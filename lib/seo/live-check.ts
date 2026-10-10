import { LIMITS, SEVERITY_WEIGHT, TITLE_SUFFIX } from './constants'
import { inspectHtml, type PageFacts } from './html-inspect'
import type { SeoIssue } from './types'

export type LiveCheckInput = {
  /** Origine su cui interrogare il sito (quella della richiesta corrente). */
  origin: string
  /** URL canonico configurato (NEXT_PUBLIC_SITE_URL o il valore di ripiego). */
  siteUrl: string
  postSlugs: string[]
  categorySlugs: string[]
}

export type LivePage = {
  path: string
  status: number | null
  ms: number | null
  issues: SeoIssue[]
  facts?: Pick<PageFacts, 'title' | 'description' | 'canonical' | 'h1Count'>
}

export type LiveCheck = {
  checkedAt: string
  origin: string
  score: number
  global: SeoIssue[]
  pages: LivePage[]
  summary: { pages: number; errors: number; warnings: number; averageMs: number | null }
}

const MAX_PAGES = 40
const CONCURRENCY = 4
const TIMEOUT_MS = 8000

async function get(url: string): Promise<{ status: number; ms: number; headers: Headers; body: string }> {
  const started = Date.now()
  const res = await fetch(url, {
    redirect: 'manual',
    cache: 'no-store',
    headers: { 'User-Agent': 'ControluceSEOAudit/1.0' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const body = res.status >= 300 && res.status < 400 ? '' : await res.text()
  return { status: res.status, ms: Date.now() - started, headers: res.headers, body }
}

const trimSlash = (value: string) => (value.length > 1 ? value.replace(/\/+$/, '') : value)

async function checkPage(origin: string, siteUrl: string, path: string): Promise<LivePage> {
  const issues: SeoIssue[] = []
  const add = (severity: SeoIssue['severity'], id: string, message: string, hint?: string) =>
    issues.push({ id, severity, category: 'technical', message, hint })

  let res: Awaited<ReturnType<typeof get>>
  try {
    res = await get(origin + path)
  } catch {
    add('error', 'unreachable', 'Pagina non raggiungibile (timeout o errore di rete).', 'Google la vedrebbe come errore del server.')
    return { path, status: null, ms: null, issues }
  }

  if (res.status >= 300 && res.status < 400) {
    add('warning', 'redirect', `La pagina risponde con un redirect (${res.status}).`, 'Gli URL in sitemap e nei link interni dovrebbero rispondere direttamente 200.')
    return { path, status: res.status, ms: res.ms, issues }
  }
  if (res.status !== 200) {
    add('error', 'status', `La pagina risponde con errore ${res.status}.`, res.status === 404 ? 'È in sitemap ma non esiste: Google la segnalerà come «Non trovata (404)».' : 'Google non può indicizzarla.')
    return { path, status: res.status, ms: res.ms, issues }
  }

  const facts = inspectHtml(res.body)
  const robotsMeta = `${facts.robots || ''} ${res.headers.get('x-robots-tag') || ''}`.toLowerCase()
  if (robotsMeta.includes('noindex')) add('error', 'noindex', 'La pagina è bloccata all’indicizzazione (noindex).', 'Rimuovi la direttiva noindex se vuoi che compaia su Google.')

  if (!facts.title) add('error', 'title-missing', 'Manca il tag <title>.')
  else if (facts.title.length > LIMITS.titleMax) add('warning', 'title-long', `Il <title> è lungo (${facts.title.length} caratteri) e verrà troncato.`)
  else if (path !== '/' && !facts.title.endsWith(TITLE_SUFFIX.trim()) && facts.title.length < LIMITS.titleMin) add('warning', 'title-short', `Il <title> è corto (${facts.title.length} caratteri).`)

  if (!facts.description) add('error', 'description-missing', 'Manca la meta description.', 'Google genererà un frammento automatico, spesso poco efficace.')
  else if (facts.description.length > LIMITS.descriptionMax + 20) add('warning', 'description-long', `La meta description è molto lunga (${facts.description.length} caratteri).`)

  if (!facts.canonical) {
    add('warning', 'canonical-missing', 'Manca il tag canonical.', 'Senza canonical, varianti dell’URL (parametri, www/non-www) possono essere indicizzate come duplicati.')
  } else {
    const expected = trimSlash(new URL(path, siteUrl).toString())
    if (trimSlash(facts.canonical) !== expected) {
      add('warning', 'canonical-mismatch', `Il canonical punta a ${facts.canonical} invece di ${expected}.`, 'Verifica NEXT_PUBLIC_SITE_URL: un canonical su un altro dominio sposta il posizionamento altrove.')
    }
  }

  if (!facts.ogTitle || !facts.ogImage) {
    add('info', 'og-incomplete', `Anteprima social incompleta${!facts.ogImage ? ' (manca og:image)' : ''}.`, 'Condivisioni su WhatsApp, Facebook e LinkedIn appariranno senza immagine.')
  }
  if (facts.h1Count !== 1) add('warning', 'h1-count', facts.h1Count === 0 ? 'Manca il titolo principale (H1).' : `Ci sono ${facts.h1Count} H1: ne serve uno solo.`)
  if (!facts.lang) add('warning', 'lang-missing', 'Manca l’attributo lang su <html>.')
  if (facts.imgMissingAlt > 0) add('warning', 'img-alt', `${facts.imgMissingAlt} immagin${facts.imgMissingAlt === 1 ? 'e' : 'i'} senza attributo alt.`)
  if (res.ms > LIMITS.slowResponseMs) add('warning', 'slow', `Risposta lenta (${(res.ms / 1000).toFixed(1)} s).`, 'Tempi alti penalizzano esperienza utente e scansione.')

  return { path, status: res.status, ms: res.ms, issues, facts: { title: facts.title, description: facts.description, canonical: facts.canonical, h1Count: facts.h1Count } }
}

async function checkGlobals(input: LiveCheckInput, expectedPaths: string[]): Promise<SeoIssue[]> {
  const issues: SeoIssue[] = []
  const add = (severity: SeoIssue['severity'], id: string, message: string, hint?: string) =>
    issues.push({ id, severity, category: 'technical', message, hint })
  const siteHost = new URL(input.siteUrl).host

  try {
    const robots = await get(input.origin + '/robots.txt')
    if (robots.status !== 200) add('error', 'robots-missing', `robots.txt risponde ${robots.status}.`)
    else {
      if (/^\s*Disallow:\s*\/\s*$/im.test(robots.body)) add('error', 'robots-blocks-all', 'robots.txt blocca l’intero sito (Disallow: /).', 'Google non scansionerà nessuna pagina.')
      if (!/^\s*Sitemap:/im.test(robots.body)) add('warning', 'robots-no-sitemap', 'robots.txt non indica la sitemap.')
      else add('good', 'robots-ok', 'robots.txt raggiungibile e con riferimento alla sitemap.')
    }
  } catch { add('error', 'robots-unreachable', 'robots.txt non raggiungibile.') }

  try {
    const sitemap = await get(input.origin + '/sitemap.xml')
    if (sitemap.status !== 200) add('error', 'sitemap-missing', `sitemap.xml risponde ${sitemap.status}.`, 'Senza sitemap Google scopre i nuovi articoli più lentamente.')
    else {
      const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
      if (locs.length === 0) add('error', 'sitemap-empty', 'La sitemap è vuota.')
      else {
        const foreign = locs.filter((loc) => { try { return new URL(loc).host !== new URL(input.origin).host } catch { return true } })
        if (foreign.length > 0 && siteHost !== new URL(input.origin).host) {
          add('error', 'sitemap-host', `La sitemap elenca ${foreign.length} URL su ${siteHost}, ma il sito risponde su ${new URL(input.origin).host}.`, 'Google scarterà quegli URL: correggi NEXT_PUBLIC_SITE_URL.')
        }
        const present = new Set(locs.map((l) => { try { return trimSlash(new URL(l).pathname) } catch { return l } }))
        const missing = expectedPaths.filter((p) => p.startsWith('/blog/') && !present.has(trimSlash(p)))
        if (missing.length > 0) add('warning', 'sitemap-missing-posts', `${missing.length} articol${missing.length === 1 ? 'o pubblico manca' : 'i pubblici mancano'} nella sitemap.`, 'La sitemap si aggiorna ogni 5 minuti: se è un articolo appena pubblicato, ricontrolla più tardi.')
        else add('good', 'sitemap-ok', `Sitemap raggiungibile con ${locs.length} URL.`)
      }
    }
  } catch { add('error', 'sitemap-unreachable', 'sitemap.xml non raggiungibile.') }

  try {
    const feed = await get(input.origin + '/feed.xml')
    if (feed.status !== 200) add('warning', 'feed-missing', `Il feed RSS risponde ${feed.status}.`)
  } catch { add('warning', 'feed-unreachable', 'Il feed RSS non è raggiungibile.') }

  return issues
}

export async function runLiveCheck(input: LiveCheckInput): Promise<LiveCheck> {
  const paths = [
    '/', '/about', '/privacy-policy',
    ...input.postSlugs.map((s) => `/blog/${s}`),
    ...input.categorySlugs.map((s) => `/categoria/${s}`),
  ].slice(0, MAX_PAGES)

  const global = await checkGlobals(input, paths)
  const pages: LivePage[] = new Array(paths.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, paths.length) }, async () => {
    while (cursor < paths.length) {
      const index = cursor++
      pages[index] = await checkPage(input.origin, input.siteUrl, paths[index])
    }
  }))

  const all = [...global, ...pages.flatMap((p) => p.issues)]
  const errors = all.filter((i) => i.severity === 'error').length
  const warnings = all.filter((i) => i.severity === 'warning').length
  const timings = pages.map((p) => p.ms).filter((ms): ms is number => typeof ms === 'number')
  const penalty = all.reduce((sum, i) => sum + SEVERITY_WEIGHT[i.severity], 0)

  return {
    checkedAt: new Date().toISOString(),
    origin: input.origin,
    score: Math.max(0, 100 - Math.round(penalty / Math.max(1, Math.sqrt(pages.length)))),
    global,
    pages,
    summary: { pages: pages.length, errors, warnings, averageMs: timings.length ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) : null },
  }
}

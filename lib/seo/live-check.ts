import { LIMITS, SEVERITY_WEIGHT } from './constants'
import { inspectHtml, type PageFacts } from './html-inspect'
import type { SeoIssue } from './types'

export type LiveCheckInput = {
  /** Origine canonica da interrogare, ricavata da SITE_URL. */
  origin: string
  /** URL canonico configurato (SITE_URL o il valore di ripiego). */
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
  summary: {
    pages: number
    totalAvailablePages: number
    truncated: boolean
    errors: number
    warnings: number
    averageMs: number | null
  }
}

const MAX_PAGES = 32
const CONCURRENCY = 4
// 8 ondate di 4 pagine da 5s = massimo circa 40s, più i controlli globali in parallelo.
const TIMEOUT_MS = 5000

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
  else if (facts.title.length > LIMITS.titleMax) add('info', 'title-long', `Il <title> è lungo (${facts.title.length} caratteri).`, 'Google non applica un limite fisso: il link del titolo può essere abbreviato in base allo spazio disponibile.')
  else if (path !== '/' && facts.title.length < LIMITS.titleMin) add('info', 'title-short', `Il <title> è breve (${facts.title.length} caratteri).`, 'Verifica che descriva chiaramente il contenuto; l’intervallo indicato è solo una guida editoriale.')

  if (!facts.description) add('error', 'description-missing', 'Manca la meta description.', 'Google può generare uno snippet dal contenuto della pagina.')
  else if (facts.description.length < LIMITS.descriptionMin) add('info', 'description-short', `La meta description è breve (${facts.description.length} caratteri).`, 'È una guida editoriale, non una soglia obbligatoria: privilegia un riepilogo specifico e utile.')
  else if (facts.description.length > LIMITS.descriptionMax + 20) add('info', 'description-long', `La meta description è lunga (${facts.description.length} caratteri).`, 'Google non impone un limite fisso e può abbreviare lo snippet in base allo spazio disponibile o scegliere un estratto della pagina.')

  if (!facts.canonical) {
    add('warning', 'canonical-missing', 'Manca il tag canonical.', 'Senza canonical, varianti dell’URL (parametri, www/non-www) possono essere indicizzate come duplicati.')
  } else {
    const expected = trimSlash(new URL(path, siteUrl).toString())
    if (trimSlash(facts.canonical) !== expected) {
      add('warning', 'canonical-mismatch', `Il canonical punta a ${facts.canonical} invece di ${expected}.`, 'Verifica SITE_URL: un canonical su un altro dominio sposta il posizionamento altrove.')
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

  // I tre controlli indipendenti vengono eseguiti in parallelo per rispettare il limite della funzione Vercel.
  const [robots, sitemap, feed] = await Promise.all([
    get(input.origin + '/robots.txt').catch(() => null),
    get(input.origin + '/sitemap.xml').catch(() => null),
    get(input.origin + '/feed.xml').catch(() => null),
  ])

  if (!robots) {
    add('error', 'robots-unreachable', 'robots.txt non raggiungibile.')
  } else if (robots.status !== 200) {
    add('error', 'robots-missing', `robots.txt risponde ${robots.status}.`)
  } else {
    if (/^\s*Disallow:\s*\/\s*$/im.test(robots.body)) add('error', 'robots-blocks-all', 'robots.txt blocca l’intero sito (Disallow: /).', 'Google non scansionerà nessuna pagina.')
    if (!/^\s*Sitemap:/im.test(robots.body)) add('warning', 'robots-no-sitemap', 'robots.txt non indica la sitemap.')
    else add('good', 'robots-ok', 'robots.txt raggiungibile e con riferimento alla sitemap.')
  }

  if (!sitemap) {
    add('error', 'sitemap-unreachable', 'sitemap.xml non raggiungibile.')
  } else if (sitemap.status !== 200) {
    add('error', 'sitemap-missing', `sitemap.xml risponde ${sitemap.status}.`, 'Senza sitemap Google scopre i nuovi articoli più lentamente.')
  } else {
    const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
    if (locs.length === 0) {
      add('error', 'sitemap-empty', 'La sitemap è vuota.')
    } else {
      const foreign = locs.filter((loc) => {
        try { return new URL(loc).host !== siteHost } catch { return true }
      })
      if (foreign.length > 0) {
        add('error', 'sitemap-host', `La sitemap contiene ${foreign.length} URL su un host diverso dal dominio canonico ${siteHost}.`, 'Verifica SITE_URL e assicurati che tutte le voci della sitemap puntino al dominio principale.')
      }
      const present = new Set(locs.map((loc) => {
        try { return trimSlash(new URL(loc).pathname) } catch { return loc }
      }))
      const missing = expectedPaths.filter((path) => path.startsWith('/blog/') && !present.has(trimSlash(path)))
      if (missing.length > 0) add('warning', 'sitemap-missing-posts', `${missing.length} articol${missing.length === 1 ? 'o pubblico manca' : 'i pubblici mancano'} nella sitemap.`, 'La sitemap si aggiorna ogni 5 minuti: se è un articolo appena pubblicato, ricontrolla più tardi.')
      else if (foreign.length === 0) add('good', 'sitemap-ok', `Sitemap raggiungibile con ${locs.length} URL.`)
    }
  }

  if (!feed) add('warning', 'feed-unreachable', 'Il feed RSS non è raggiungibile.')
  else if (feed.status !== 200) add('warning', 'feed-missing', `Il feed RSS risponde ${feed.status}.`)

  return issues
}

export async function runLiveCheck(input: LiveCheckInput): Promise<LiveCheck> {
  const staticPaths = ['/', '/articoli', '/about', '/scrivimi', '/privacy-policy', '/rss']
  const postPaths = input.postSlugs.map((slug) => `/blog/${slug}`)
  const categoryPaths = input.categorySlugs.map((slug) => `/categoria/${slug}`)
  const allPaths = [...new Set([...staticPaths, ...postPaths, ...categoryPaths])]
  const selectedContentPaths: string[] = []
  const contentLimit = MAX_PAGES - staticPaths.length

  // Alterna articoli e categorie: un elenco di articoli molto lungo non esclude tutte le categorie dal campione.
  for (let index = 0; selectedContentPaths.length < contentLimit && (index < postPaths.length || index < categoryPaths.length); index += 1) {
    if (postPaths[index]) selectedContentPaths.push(postPaths[index])
    if (categoryPaths[index] && selectedContentPaths.length < contentLimit) selectedContentPaths.push(categoryPaths[index])
  }

  const paths = [...new Set([...staticPaths, ...selectedContentPaths])].slice(0, MAX_PAGES)
  const global = await checkGlobals(input, paths)
  const pages: LivePage[] = new Array(paths.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, paths.length) }, async () => {
    while (cursor < paths.length) {
      const index = cursor++
      pages[index] = await checkPage(input.origin, input.siteUrl, paths[index])
    }
  }))

  const all = [...global, ...pages.flatMap((page) => page.issues)]
  const errors = all.filter((issue) => issue.severity === 'error').length
  const warnings = all.filter((issue) => issue.severity === 'warning').length
  const timings = pages.map((page) => page.ms).filter((ms): ms is number => typeof ms === 'number')
  const penalty = all.reduce((sum, issue) => sum + SEVERITY_WEIGHT[issue.severity], 0)

  return {
    checkedAt: new Date().toISOString(),
    origin: input.origin,
    score: Math.max(0, 100 - Math.round(penalty / Math.max(1, Math.sqrt(pages.length)))),
    global,
    pages,
    summary: {
      pages: pages.length,
      totalAvailablePages: allPaths.length,
      truncated: allPaths.length > pages.length,
      errors,
      warnings,
      averageMs: timings.length ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) : null,
    },
  }
}

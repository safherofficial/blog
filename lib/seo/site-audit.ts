import { LIMITS, SEVERITY_WEIGHT } from './constants'
import { portableTextToEditorText } from '@/lib/content/editor'
import type { PortableTextBlock } from '@/lib/db'
import { analyzePost, countBySeverity } from './post-analyzer'
import type { OtherPost, PostDraft, SeoIssue } from './types'

export type AuditPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string | null
  cover_image_alt: string | null
  category_id: string | null
  published_at: string | Date
  published: boolean
  body: PortableTextBlock[] | null
  seo_title: string | null
  seo_description: string | null
}

export type AuditSettingsRow = {
  site_title?: string | null
  tagline?: string | null
  author_name?: string | null
  author_bio?: PortableTextBlock[] | null
  author_photo_url?: string | null
  author_photo_alt?: string | null
  instagram_url?: string | null
} | null

export type SiteAuditInput = {
  posts: AuditPostRow[]
  categories: Array<{ id: string; title: string; slug: string }>
  settings: AuditSettingsRow
  env: { siteUrl: string; siteUrlConfigured: boolean; sessionSecretConfigured: boolean }
  /** Origine su cui il sito sta rispondendo in questo momento. */
  origin: string
  now?: number
}

export type PostAudit = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'scheduled' | 'published'
  score: number
  errors: number
  warnings: number
  issues: SeoIssue[]
}

export type SiteAudit = {
  generatedAt: string
  score: number
  summary: { published: number; scheduled: number; drafts: number; postsWithErrors: number; averagePostScore: number }
  siteIssues: SeoIssue[]
  posts: PostAudit[]
}

function toDraft(row: AuditPostRow): PostDraft {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url || '',
    coverImageAlt: row.cover_image_alt || '',
    categoryId: row.category_id || '',
    publishedAt: new Date(row.published_at).toISOString(),
    published: row.published,
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    bodyText: portableTextToEditorText(row.body),
  }
}

const hostOf = (url: string): string => {
  try { return new URL(url).host } catch { return '' }
}

export function auditSite(input: SiteAuditInput): SiteAudit {
  const now = input.now ?? Date.now()
  const { env, settings } = input
  const siteIssues: SeoIssue[] = []
  const add = (severity: SeoIssue['severity'], id: string, message: string, hint?: string, category: SeoIssue['category'] = 'site') =>
    siteIssues.push({ id, severity, category, message, hint })

  // ---------- Configurazione ----------
  if (!env.siteUrlConfigured) {
    add('error', 'env-site-url', 'SITE_URL non è configurata.', `Canonical, sitemap, robots, feed RSS e dati strutturati puntano a ${env.siteUrl}, che potrebbe non essere il tuo dominio. Imposta la variabile su Vercel con l’indirizzo reale del sito e rifai il deploy.`, 'technical')
  } else if (!env.siteUrl.startsWith('https://')) {
    add('error', 'env-site-https', 'L’URL del sito non usa HTTPS.', 'Google privilegia i siti sicuri e segnala quelli senza HTTPS.', 'technical')
  } else {
    const originHost = hostOf(input.origin)
    const siteHost = hostOf(env.siteUrl)
    if (originHost && siteHost && originHost !== siteHost) {
      add('warning', 'env-host-mismatch', `Il sito risponde su ${originHost} ma l’URL canonico configurato è ${siteHost}.`, 'Se entrambi gli indirizzi sono pubblici Google può vedere contenuti duplicati. Imposta un redirect 301 verso il dominio principale.', 'technical')
    } else if (siteHost.endsWith('.vercel.app')) {
      add('info', 'env-vercel-domain', 'Il sito usa un dominio vercel.app.', 'Funziona, ma un dominio personalizzato è più affidabile e portabile nel tempo.', 'technical')
    }
  }
  if (!env.sessionSecretConfigured) {
    add('warning', 'env-session-secret', 'ADMIN_SESSION_SECRET non è impostata.', 'Le sessioni admin usano la password come chiave di firma. Imposta un segreto casuale distinto.', 'technical')
  }

  // ---------- Articoli ----------
  const drafts = input.posts.map(toDraft)
  const others: OtherPost[] = drafts.map((d) => ({
    id: d.id as string, title: d.title, slug: d.slug, excerpt: d.excerpt,
    seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null,
  }))
  // Confrontiamo solo con gli articoli che possono finire in indice: bozze duplicate non fanno danni.
  const publicIds = new Set(drafts.filter((d) => d.published).map((d) => d.id))
  const posts: PostAudit[] = drafts.map((draft) => {
    const result = analyzePost(draft, {
      others: others.filter((o) => publicIds.has(o.id)),
      originalSlug: draft.slug,
      wasPublished: false,
      now,
    })
    const counts = countBySeverity(result.issues)
    const publishedAt = Date.parse(draft.publishedAt)
    const status: PostAudit['status'] = !draft.published ? 'draft' : publishedAt > now ? 'scheduled' : 'published'
    return { id: draft.id as string, title: draft.title, slug: draft.slug, status, score: result.score, errors: counts.error, warnings: counts.warning, issues: result.issues.filter((i) => i.severity !== 'good') }
  })

  const live = posts.filter((p) => p.status === 'published')
  const scheduled = posts.filter((p) => p.status === 'scheduled').length
  const draftCount = posts.filter((p) => p.status === 'draft').length

  if (live.length === 0) {
    add('warning', 'no-published', 'Non c’è nessun articolo pubblicato.', 'Un sito senza contenuti pubblici non può essere indicizzato in modo utile.', 'content')
  } else {
    const latest = Math.max(...input.posts.filter((p) => p.published && Date.parse(new Date(p.published_at).toISOString()) <= now).map((p) => new Date(p.published_at).getTime()))
    const days = Math.floor((now - latest) / 86_400_000)
    if (days > LIMITS.staleDays) {
      add('info', 'stale', `L’ultimo articolo risale a ${days} giorni fa.`, 'Aggiornare con regolarità segnala a Google che il sito è attivo.', 'content')
    }
  }

  // Categorie vuote: finiscono in sitemap ma non hanno contenuti.
  const publicCategoryIds = new Set(input.posts.filter((p) => p.published && new Date(p.published_at).getTime() <= now).map((p) => p.category_id))
  const emptyCategories = input.categories.filter((c) => !publicCategoryIds.has(c.id))
  if (emptyCategories.length > 0) {
    add('warning', 'empty-categories', `${emptyCategories.length} categori${emptyCategories.length === 1 ? 'a è vuota' : 'e sono vuote'}: ${emptyCategories.map((c) => c.title).join(', ')}.`, 'Le pagine categoria senza articoli sono nella sitemap ma non hanno contenuto: Google le tratta come pagine di scarso valore. Assegna articoli o elimina la categoria.', 'content')
  }

  // ---------- Impostazioni del sito ----------
  if (!settings?.author_name?.trim()) {
    add('warning', 'author-name', 'Nome dell’autrice/autore non impostato.', 'La pagina «Chi sono» mostra un titolo generico. Un autore riconoscibile rafforza la fiducia (E-E-A-T).', 'site')
  }
  const bioWords = (settings?.author_bio || []).map((b) => (b.children || []).map((c) => c.text).join(' ')).join(' ').trim()
  if (!bioWords) {
    add('warning', 'author-bio', 'La biografia è vuota.', 'La pagina «Chi sono» ha un testo di default generico: scrivi una bio vera.', 'site')
  }
  if (settings?.author_photo_url && !settings.author_photo_alt?.trim()) {
    add('warning', 'author-photo-alt', 'La foto profilo non ha testo alternativo.', undefined, 'site')
  }
  if (!settings?.tagline?.trim()) {
    add('info', 'tagline', 'Tagline non impostata.', 'Una frase breve che dice di cosa parla il blog.', 'site')
  }
  if (!settings?.instagram_url?.trim()) {
    add('info', 'social', 'Nessun profilo social collegato.', undefined, 'site')
  }

  // ---------- Punteggio ----------
  const averagePostScore = live.length ? Math.round(live.reduce((s, p) => s + p.score, 0) / live.length) : 100
  const sitePenalty = siteIssues.reduce((s, i) => s + SEVERITY_WEIGHT[i.severity], 0)
  const postsWithErrors = live.filter((p) => p.errors > 0).length

  return {
    generatedAt: new Date(now).toISOString(),
    score: Math.max(0, averagePostScore - sitePenalty),
    summary: { published: live.length, scheduled, drafts: draftCount, postsWithErrors, averagePostScore },
    siteIssues,
    posts: posts.sort((a, b) => a.score - b.score),
  }
}

/** Identità e indirizzi del sito: un'unica fonte per metadati, sitemap, feed e dati strutturati. */

export const FALLBACK_SITE_URL = 'https://www.controluce.blog'
export const SITE_NAME = 'Controluce'
export const SITE_LOCALE = 'it_IT'
export const DEFAULT_TITLE = 'Controluce — Storie, idee e punti di vista'
export const DEFAULT_DESCRIPTION =
  'Un blog indipendente scritto e curato da un’autrice italiana. Storie e riflessioni su società, benessere, relazioni, tecnologia e vita quotidiana.'

export function getSiteUrl(): string {
  // SITE_URL è la variabile ufficiale (solo lato server); NEXT_PUBLIC_SITE_URL resta come ripiego per le installazioni esistenti.
  const configured = process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL
  const value = configured.replace(/\/+$/, '')

  // Il dominio pubblico reindirizza in modo permanente al sottodominio www:
  // canonical, sitemap, robots, feed e dati strutturati devono usare lo stesso host finale.
  try {
    const url = new URL(value)
    if (url.hostname === 'controluce.blog' || url.hostname === 'www.controluce.blog') {
      url.protocol = 'https:'
      url.hostname = 'www.controluce.blog'
    }
    return url.toString().replace(/\/+$/, '')
  } catch {
    return value
  }
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return getSiteUrl() + (path.startsWith('/') ? path : `/${path}`)
}

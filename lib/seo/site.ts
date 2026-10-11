/** Identità e indirizzi del sito: un'unica fonte per metadati, sitemap, feed e dati strutturati. */

export const FALLBACK_SITE_URL = 'https://controluce.blog'
export const SITE_NAME = 'Controluce'
export const SITE_LOCALE = 'it_IT'
export const DEFAULT_TITLE = 'Controluce — Blog di lifestyle e vita quotidiana'
export const DEFAULT_DESCRIPTION =
  'Storie, riflessioni e piccoli rituali di vita quotidiana raccontati con uno sguardo personale.'

export function getSiteUrl(): string {
  // SITE_URL è la variabile ufficiale (solo lato server); NEXT_PUBLIC_SITE_URL resta come ripiego per le installazioni esistenti.
  return (process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL).replace(/\/+$/, '')
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return getSiteUrl() + (path.startsWith('/') ? path : `/${path}`)
}

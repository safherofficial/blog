import type { Metadata } from 'next'
import { SITE_LOCALE, SITE_NAME } from './site'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const DEFAULT_OG_IMAGE = '/og'

type PageMetadataInput = {
  title: string
  description: string
  /** Percorso canonico, es. `/articoli`. */
  path: string
  /** Titolo assoluto: ignora il suffisso « — Controluce ». */
  absoluteTitle?: boolean
  /** Immagine di anteprima; se assente si usa quella generata dal sito. */
  image?: string | null
  imageAlt?: string
}

/**
 * Metadati completi di una pagina: titolo, descrizione, canonical, Open Graph e Twitter.
 * Next sostituisce interi gli oggetti `openGraph`/`twitter` del layout, quindi vanno sempre completi.
 */
export function pageMetadata({ title, description, path, absoluteTitle, image, imageAlt }: PageMetadataInput): Metadata {
  const imageUrl = image || DEFAULT_OG_IMAGE
  const generated = !image
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, types: { 'application/rss+xml': '/feed.xml' } },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      url: path,
      images: [{ url: imageUrl, ...(generated ? OG_SIZE : {}), alt: imageAlt || title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  }
}

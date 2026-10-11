import { shortText } from '@/lib/content/article'
import type { SiteSettings } from '@/lib/db'
import { absoluteUrl, DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from './site'

type Json = Record<string, unknown>

/** Logo dell'organizzazione: deve essere un'immagine raster di almeno 112×112 px. */
const logoUrl = () => absoluteUrl('/apple-icon.png')

export function organizationJsonLd(settings: SiteSettings | null): Json {
  const name = settings?.siteTitle || SITE_NAME
  return {
    '@type': 'Organization',
    '@id': `${getSiteUrl()}/#organization`,
    name,
    url: getSiteUrl(),
    logo: { '@type': 'ImageObject', url: logoUrl(), width: 180, height: 180 },
    ...(settings?.instagramUrl ? { sameAs: [settings.instagramUrl] } : {}),
  }
}

export function personJsonLd(settings: SiteSettings | null): Json | undefined {
  const name = settings?.authorName?.trim()
  if (!name) return undefined
  const description = shortText(settings?.authorBio, 300)
  return {
    '@type': 'Person',
    '@id': `${getSiteUrl()}/#author`,
    name,
    url: absoluteUrl('/about'),
    ...(settings?.authorPhoto?.url ? { image: settings.authorPhoto.url } : {}),
    ...(description ? { description } : {}),
    ...(settings?.instagramUrl ? { sameAs: [settings.instagramUrl] } : {}),
    worksFor: { '@id': `${getSiteUrl()}/#organization` },
  }
}

/** Grafo del sito, presente in ogni pagina: sito, blog, organizzazione e autrice collegati tra loro. */
export function siteGraphJsonLd(settings: SiteSettings | null): Json {
  const url = getSiteUrl()
  const name = settings?.siteTitle || SITE_NAME
  const description = settings?.tagline || DEFAULT_DESCRIPTION
  const person = personJsonLd(settings)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${url}/#website`, url, name, description, inLanguage: 'it-IT', publisher: { '@id': `${url}/#organization` } },
      {
        '@type': 'Blog', '@id': `${url}/#blog`, url, name, description, inLanguage: 'it-IT',
        isPartOf: { '@id': `${url}/#website` }, publisher: { '@id': `${url}/#organization` },
        ...(person ? { author: { '@id': `${url}/#author` } } : {}),
      },
      organizationJsonLd(settings),
      ...(person ? [person] : []),
    ],
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function collectionJsonLd(input: { name: string; description: string; path: string; items: Array<{ title: string; slug: string }> }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: 'it-IT',
    isPartOf: { '@id': `${getSiteUrl()}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/blog/${item.slug}`), name: item.title,
      })),
    },
  }
}

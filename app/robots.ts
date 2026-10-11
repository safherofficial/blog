import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo/site'

/**
 * Tutti i crawler (motori di ricerca e assistenti AI) possono leggere i contenuti pubblici.
 * Restano fuori solo pannello e API di amministrazione.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}

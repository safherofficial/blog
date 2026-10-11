import type { MetadataRoute } from 'next'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME } from '@/lib/seo/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_TITLE,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    lang: 'it',
    background_color: '#F5EFE5',
    theme_color: '#F5EFE5',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}

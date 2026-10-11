import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Source_Serif_4, Space_Mono } from 'next/font/google'
import './globals.css'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, getSiteUrl, SITE_LOCALE, SITE_NAME } from '@/lib/seo/site'

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['500', '600'],
  variable: '--font-fraunces',
})
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
})
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' })

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim() || 'C2F2AE380902663B014F3BFFD6AF7A93'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: DEFAULT_TITLE, template: `%s — ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: '/og', width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: { card: 'summary_large_image', title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: ['/og'] },
  // Anteprime grandi e snippet completi: necessari per Google Discover, risultati ricchi e riassunti AI.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: {
    google: googleVerification || undefined,
    other: bingVerification ? { 'msvalidate.01': bingVerification } : undefined,
  },
}

export const viewport: Viewport = {
  themeColor: '#F5EFE5',
}

// Layout radice: solo html/body e font. Header, footer e JSON-LD del sito
// vivono in app/(site)/layout.tsx, così NON compaiono dentro /admin.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${inter.variable} ${sourceSerif.variable} ${spaceMono.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  )
}

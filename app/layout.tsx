import type { Metadata } from 'next'
import { Fraunces, Inter, Source_Serif_4, Space_Mono } from 'next/font/google'
import './globals.css'

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.controluce-blog.it'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Controluce — Blog di lifestyle e vita quotidiana', template: '%s — Controluce' },
  description: 'Storie, riflessioni e piccoli rituali di vita quotidiana raccontati con uno sguardo personale.',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: { type: 'website', siteName: 'Controluce', locale: 'it_IT' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
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

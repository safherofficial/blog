import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Segui Controluce via RSS',
  description: 'Ricevi i nuovi articoli di Controluce nel tuo lettore RSS, senza registrazione e senza newsletter.',
  alternates: {
    canonical: '/rss',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
}

export default function RssPage() {
  const requestHeaders = headers()
  const host = (
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    ''
  ).split(',')[0].trim()
  const forwardedProtocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim()
  const protocol = forwardedProtocol || (host.startsWith('localhost') ? 'http' : 'https')
  const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.controluce-blog.it'
  const origin = host ? `${protocol}://${host}` : fallbackOrigin
  const feedUrl = new URL('/feed.xml', origin).toString()

  return (
    <main className="rss-page">
      <section className="reading-page-intro py-16 md:py-24">
        <div className="wrap max-w-3xl">
          <div className="reveal-on-scroll">
            <p className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">
              <span className="inline-block h-px w-8 bg-ochre" />
              Resta aggiornato
            </p>
            <h1 className="mb-6 max-w-[18ch] font-display text-4xl leading-tight tracking-tight md:text-6xl">
              Segui Controluce,<br /><em className="font-normal italic text-wine">con i tuoi tempi.</em>
            </h1>
            <p className="mb-10 max-w-[60ch] font-serif text-lg leading-relaxed text-ink-soft">
              Il feed RSS ti permette di leggere i nuovi articoli nel lettore che preferisci: niente account sul blog, nessuna newsletter e nessuna email da lasciare.
            </p>
          </div>

          <div className="rss-card reveal-on-scroll bg-bg-soft p-6 md:p-8">
            <h2 className="mb-3 font-display text-2xl">Aggiungi il feed al tuo lettore</h2>
            <p className="mb-5 leading-relaxed text-ink-soft">
              Copia l’indirizzo completo qui sotto e incollalo nella funzione “Aggiungi feed” o “Aggiungi fonte” della tua app RSS.
            </p>
            <code className="block break-all border border-line bg-bg px-4 py-3 font-mono text-sm text-wine">{feedUrl}</code>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-button inline-block border border-wine bg-wine px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-bg hover:bg-wine-dark"
              >
                Apri il feed RSS
              </a>
              <Link
                href="/"
                className="editorial-button inline-block border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-ink hover:border-wine hover:text-wine"
              >
                Torna al blog
              </Link>
            </div>
          </div>

          <p className="reveal-on-scroll mt-8 text-sm leading-relaxed text-ink-soft">
            Nota: aprendo direttamente il feed nel browser potresti vedere testo XML. È normale: quell’indirizzo è pensato per essere aggiunto a un lettore RSS.
          </p>
        </div>
      </section>
    </main>
  )
}

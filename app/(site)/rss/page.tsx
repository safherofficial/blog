import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Segui Controluce via RSS',
  description: 'Ricevi i nuovi articoli di Controluce nel tuo lettore RSS, senza registrazione e senza newsletter.',
  alternates: {
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
    <main>
      <section className="border-b border-line py-20 md:py-28">
        <div className="wrap max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-wine">Resta aggiornato</p>
          <h1 className="mb-6 max-w-[18ch] font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Segui Controluce, con i tuoi tempi.
          </h1>
          <p className="mb-10 max-w-[60ch] font-serif text-lg leading-relaxed text-ink-soft">
            Il feed RSS ti permette di leggere i nuovi articoli nel lettore che preferisci: niente account sul blog, nessuna newsletter e nessuna email da lasciare.
          </p>

          <div className="border border-line bg-bg-soft p-6 md:p-8">
            <h2 className="mb-3 font-display text-2xl">Aggiungi il feed al tuo lettore</h2>
            <p className="mb-5 leading-relaxed text-ink-soft">
              Copia l’indirizzo completo qui sotto e incollalo nella funzione “Aggiungi feed” o “Aggiungi fonte” della tua app RSS.
            </p>
            <code className="block break-all border border-line bg-bg px-4 py-3 font-mono text-sm">{feedUrl}</code>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-wine bg-wine px-6 py-3 font-mono text-[13px] uppercase tracking-widest text-white transition-colors hover:bg-wine-dark"
              >
                Apri il feed RSS
              </a>
              <Link
                href="/"
                className="inline-block border border-line px-6 py-3 font-mono text-[13px] uppercase tracking-widest transition-colors hover:border-wine hover:text-wine"
              >
                Torna al blog
              </Link>
            </div>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-ink-soft">
            Nota: aprendo direttamente il feed nel browser potresti vedere testo XML. È normale: quell’indirizzo è pensato per essere aggiunto a un lettore RSS.
          </p>
        </div>
      </section>
    </main>
  )
}

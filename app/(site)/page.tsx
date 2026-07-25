import Link from 'next/link'
import PostCard from '@/components/PostCard'
import CropFrame from '@/components/CropFrame'
import { getLatestPosts, getSiteSettings } from '@/lib/sanity/queries'

export const revalidate = 60 // rigenera la pagina al massimo ogni 60s: i nuovi post pubblicati da /studio appaiono in fretta

export default async function HomePage() {
  const [posts, settings] = await Promise.all([
    getLatestPosts(3).catch(() => []),
    getSiteSettings().catch(() => null),
  ])

  return (
    <>
      <section className="border-b border-line py-20 md:py-28">
        <div className="wrap grid grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-wine">
              Diario personale - dal 2026
            </p>
            <h1 className="mb-6 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Piccole cose,<br /><em className="italic text-wine">guardate meglio.</em>
            </h1>
            <p className="mb-9 max-w-[46ch] font-serif text-lg leading-relaxed text-ink-soft">
              {settings?.tagline ||
                `Sono ${settings?.authorName || '[Il tuo nome]'}. Qui racconto vita quotidiana, casa, viaggi e i piccoli rituali che rendono i giorni piu leggeri.`}
            </p>
            <Link
              href="#articoli"
              className="inline-block border border-wine bg-wine px-7 py-3.5 font-mono text-[13px] uppercase tracking-widest text-white transition-colors hover:bg-wine-dark"
            >
              Leggi gli ultimi articoli
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-ochre to-wine">
            <CropFrame />
            <div className="absolute inset-0 flex items-end justify-start p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/80">
                Ph. - sostituisci con una tua foto
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="articoli" className="py-20 md:py-24">
        <div className="wrap">
          <div className="mb-12 flex items-baseline justify-between border-b border-line pb-5">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-wine">Dal blog</p>
              <h2 className="font-display text-3xl md:text-4xl">Ultimi articoli</h2>
            </div>
          </div>

          {posts.length === 0 ? (
            <p className="text-ink-soft">
              Nessun articolo ancora pubblicato. Vai su <Link href="/studio" className="nav-link text-wine">/studio</Link> per scrivere il primo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
              {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {settings?.signatureQuote && (
        <section className="bg-ink py-24 text-bg">
          <div className="wrap max-w-[760px] text-center">
            <p className="mb-0 font-display text-6xl italic text-ochre">&ldquo;</p>
            <p className="mb-6 font-display text-2xl italic leading-snug">{settings.signatureQuote}</p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ochre">
              - {settings.authorName || '[Il tuo nome]'}, autrice di Controluce
            </p>
          </div>
        </section>
      )}

      <section className="bg-bg-soft py-20 text-center">
        <div className="wrap">
          <h2 className="mb-2 font-display text-2xl">Ricevi i nuovi articoli via email</h2>
          <p className="mb-7 text-ink-soft">Niente spam: un&apos;email ogni volta che pubblico qualcosa di nuovo.</p>
          {/* Collega a un servizio come Brevo o MailerLite */}
          <form className="mx-auto flex max-w-md justify-center gap-2">
            <input
              type="email"
              required
              placeholder="La tua email"
              className="flex-1 border border-line bg-white px-4 py-3 text-sm"
            />
            <button className="border border-wine bg-wine px-6 py-3 font-mono text-[13px] uppercase tracking-widest text-white hover:bg-wine-dark">
              Iscrivimi
            </button>
          </form>
          <p className="mt-3 text-xs text-ink-soft">
            Iscrivendoti accetti la{' '}
            <Link href="/privacy-policy" className="nav-link text-ink-soft hover:text-wine">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}

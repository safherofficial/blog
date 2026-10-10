import Link from 'next/link'
import Image from 'next/image'
import PostCard from '@/components/PostCard'
import CropFrame from '@/components/CropFrame'
import { getLatestPosts, getSiteSettings } from '@/lib/db'

export const revalidate = 60

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
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-wine">Diario editoriale</p>
            <h1 className="mb-6 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Piccole cose,<br /><em className="italic text-wine">guardate meglio.</em>
            </h1>
            <p className="mb-9 max-w-[46ch] font-serif text-lg leading-relaxed text-ink-soft">
              {settings?.tagline || 'Storie, riflessioni e piccoli rituali di vita quotidiana raccontati con uno sguardo personale.'}
            </p>
            <Link href="#articoli" className="inline-block border border-wine bg-wine px-7 py-3.5 font-mono text-[13px] uppercase tracking-widest text-white transition-colors hover:bg-wine-dark">
              Leggi gli ultimi articoli
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-ochre to-wine">
            <CropFrame />
            {settings?.authorPhoto?.url ? (
              <Image
                src={settings.authorPhoto.url}
                alt={settings.authorPhoto.alt || settings.authorName || 'Immagine editoriale'}
                fill
                unoptimized
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6">
                <p className="max-w-[28ch] font-display text-2xl italic leading-snug text-white">
                  Uno spazio per osservare meglio le cose di ogni giorno.
                </p>
              </div>
            )}
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
            <p className="text-ink-soft">Nessun articolo è ancora disponibile. Torna presto per leggere i nuovi contenuti.</p>
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ochre">— {settings.authorName || settings.siteTitle || 'Controluce'}</p>
          </div>
        </section>
      )}

      <section className="bg-bg-soft py-16 text-center">
        <div className="wrap">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Resta aggiornato</p>
          <h2 className="mb-3 font-display text-2xl">Leggi i nuovi articoli, quando escono.</h2>
          <p className="mx-auto mb-7 max-w-[52ch] text-ink-soft">
            Segui il feed RSS nel tuo lettore preferito. Nessuna registrazione necessaria.
          </p>
          <Link href="/rss" className="inline-block border border-wine bg-wine px-7 py-3.5 font-mono text-[13px] uppercase tracking-widest text-white transition-colors hover:bg-wine-dark">
            Segui il feed RSS
          </Link>
        </div>
      </section>
    </>
  )
}

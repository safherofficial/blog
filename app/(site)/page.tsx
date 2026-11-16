import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PostCard from '@/components/PostCard'
import { getLatestPosts, getPublishedCategories, getSiteSettings } from '@/lib/db'
import { pageMetadata } from '@/lib/seo/metadata'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '@/lib/seo/site'
import { AUTHOR_PEN_NAME } from '@/lib/author'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: DEFAULT_TITLE,
  absoluteTitle: true,
  description: DEFAULT_DESCRIPTION,
  path: '/',
})

export default async function HomePage() {
  const [posts, settings, categories] = await Promise.all([
    getLatestPosts(3).catch(() => []),
    getSiteSettings().catch(() => null),
    getPublishedCategories().catch(() => []),
  ])

  return (
    <>
      <section className="home-hero relative isolate flex overflow-hidden border-b border-line">
        <Image
          src="/images/controluce-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="home-hero-image object-cover object-[40%_center]"
        />
        <div className="home-hero-overlay absolute inset-0" aria-hidden="true" />
        <div className="film-grain absolute inset-0" aria-hidden="true" />
        <div className="wrap relative z-10 flex w-full items-end py-16 lg:items-center lg:py-24">
          <div className="home-hero-copy editorial-reveal w-full max-w-2xl lg:ml-auto lg:max-w-[34rem]">
            <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-[#E1BD8D]">
              <span className="inline-block h-px w-9 bg-[#D5AC76]" />
              Diario editoriale · Uno sguardo personale
            </p>
            <h1 className="mb-7 font-display text-5xl leading-[1.02] tracking-tight text-[#FBF4E9] sm:text-6xl lg:text-[3.7rem] xl:text-[4.2rem]">
              Oltre la<br />
              <em className="font-normal italic text-[#D9B78A] lg:whitespace-nowrap">superficie.</em>
            </h1>
            <p className="mb-9 max-w-[44ch] font-serif text-lg leading-relaxed text-[#F0E5D7] md:text-xl">
              Storie, Idee, Curiosità, Punti di vista.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="#in-evidenza"
                className="hero-cta inline-flex items-center gap-4 border border-[#D3AB76] bg-[#D3AB76] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#211A15]"
              >
                Esplora gli articoli <span aria-hidden="true" className="text-lg leading-none">↘</span>
              </Link>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#E5D4C0]/80">Leggi · Rifletti · Riscopri</span>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-8 z-10 hidden font-mono text-[9px] uppercase tracking-[0.25em] text-white/55 lg:block">
          Controluce — oltre la superficie
        </div>
        <div className="hero-edge-mark pointer-events-none absolute bottom-0 right-8 z-10 hidden h-20 w-px origin-bottom bg-gradient-to-t from-[#D5B27F]/80 to-transparent md:block" aria-hidden="true" />
      </section>

      <section id="in-evidenza" className="py-16 md:py-20">
        <div className="wrap">
          <div className="reveal-on-scroll mb-12 flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between md:mb-14">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Dal blog</p>
              <h2 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">In primo piano</h2>
            </div>
            <p className="max-w-[34ch] font-serif text-base leading-relaxed text-ink-soft">
              Idee, storie e punti di vista da leggere senza fretta. Si comincia dal racconto più recente.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="reveal-on-scroll border-l border-ochre py-2 pl-5 text-ink-soft">Nessun articolo è ancora disponibile. Torna presto per leggere i nuovi contenuti.</p>
          ) : (
            <>
              <div className="reveal-on-scroll mb-14 md:mb-16">
                <PostCard post={posts[0]} index={0} featured />
              </div>

              {categories.length > 0 && (
                <nav aria-label="Esplora gli articoli per tema" className="reveal-on-scroll mb-14 flex flex-wrap items-center gap-3 border-y border-line py-7">
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Esplora per tema</span>
                  {categories.map((category) => (
                    <Link key={category.slug} href={`/categoria/${category.slug}`} className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-ochre hover:bg-bg-soft hover:text-wine">
                      {category.title} <span className="text-ochre">{category.count}</span>
                    </Link>
                  ))}
                </nav>
              )}

              {posts.length > 1 && (
                <>
                  <div className="reveal-on-scroll mb-8">
                    <h2 className="font-display text-3xl leading-tight tracking-tight md:text-4xl">Altre storie recenti</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-x-9 gap-y-14 md:grid-cols-2 md:gap-y-16">
                    {posts.slice(1).map((post, i) => <PostCard key={post._id} post={post} index={i + 1} />)}
                  </div>
                </>
              )}

              <div className="reveal-on-scroll mt-16 text-center md:mt-20">
                <Link href="/articoli" className="editorial-button inline-flex items-center gap-4 border border-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-wine hover:bg-wine hover:text-bg">
                  Tutti gli articoli <span aria-hidden="true" className="text-lg leading-none">→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {settings?.signatureQuote && (
        <section className="quote-section reveal-on-scroll relative overflow-hidden border-y border-[#40352A] bg-ink py-20 text-bg md:py-28">
          <div className="quote-glow pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="wrap relative max-w-[860px] text-center">
            <p className="mb-2 font-display text-7xl leading-none italic text-ochre" aria-hidden="true">&ldquo;</p>
            <p className="mb-8 font-display text-2xl italic leading-relaxed text-[#F4E9DB] md:text-4xl md:leading-snug">{settings.signatureQuote}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C9A879]">— {AUTHOR_PEN_NAME}</p>
          </div>
        </section>
      )}

      <section className="reading-invitation reveal-on-scroll bg-bg-soft py-16 text-center md:py-20">
        <div className="wrap">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Resta aggiornato</p>
          <h2 className="mb-4 font-display text-3xl md:text-4xl">Le storie migliori meritano tempo.</h2>
          <p className="mx-auto mb-8 max-w-[58ch] font-serif text-lg leading-relaxed text-ink-soft">
            Segui il feed RSS per ritrovare i nuovi articoli. Oppure, se c&apos;è qualcosa che vuoi raccontarmi, qui trovi uno spazio per farlo: senza registrazione e senza obbligo di ricevere una risposta.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/rss" className="editorial-button inline-flex items-center gap-4 border border-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-wine hover:bg-wine hover:text-bg">
              Segui il feed RSS <span aria-hidden="true" className="text-lg leading-none">↗</span>
            </Link>
            <Link href="/scrivimi" className="editorial-button inline-flex items-center gap-4 border border-wine bg-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bg hover:bg-wine-dark">
              Parliamone <span aria-hidden="true" className="text-lg leading-none">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

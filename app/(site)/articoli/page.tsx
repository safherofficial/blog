import type { Metadata } from 'next'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { getAllPosts } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd, collectionJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: 'Tutti gli articoli',
  description: 'L’archivio completo di Controluce: storie, riflessioni e piccoli rituali di vita quotidiana, dal più recente.',
  path: '/articoli',
})

export default async function ArchivePage() {
  const posts = await getAllPosts().catch(() => [])

  // Categorie ricavate dagli articoli pubblici: nessuna categoria vuota nell'elenco.
  const categories = new Map<string, { title: string; slug: string; count: number }>()
  for (const post of posts) {
    if (!post.category) continue
    const existing = categories.get(post.category.slug)
    if (existing) existing.count += 1
    else categories.set(post.category.slug, { ...post.category, count: 1 })
  }
  const [featured, ...rest] = posts

  return (
    <section className="archive-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            collectionJsonLd({ name: 'Tutti gli articoli', description: 'L’archivio completo di Controluce.', path: '/articoli', items: posts }),
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Articoli', path: '/articoli' }]),
          ]),
        }}
      />
      <div className="category-masthead py-16 md:py-20">
        <div className="wrap reveal-on-scroll">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.27em] text-[#D9B47F]">Archivio</p>
          <h1 className="max-w-[20ch] font-display text-4xl leading-tight tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl">Tutti gli articoli</h1>
          <p className="mt-5 max-w-[46ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">
            Tutto quello che ho scritto finora, dal più recente.
          </p>
          {posts.length > 0 && <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C9A879]">{posts.length} {posts.length === 1 ? 'articolo' : 'articoli'}</p>}
        </div>
      </div>

      <div className="wrap py-14 md:py-20">
        {categories.size > 0 && (
          <nav aria-label="Categorie" className="reveal-on-scroll mb-14 flex flex-wrap items-center gap-3 border-b border-line pb-8">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Esplora per tema</span>
            {[...categories.values()].map((category) => (
              <Link key={category.slug} href={`/categoria/${category.slug}`} className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-ochre hover:bg-bg-soft hover:text-wine">
                {category.title} <span className="text-ochre">{category.count}</span>
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <p className="border-l border-ochre py-2 pl-5 text-ink-soft">Nessun articolo è ancora disponibile. Torna presto per leggere i nuovi contenuti.</p>
        ) : (
          <>
            <div className="mb-16 md:mb-20">
              <PostCard post={featured} index={0} featured />
            </div>
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3 md:gap-y-16">
                {rest.map((post, i) => <PostCard key={post._id} post={post} index={i + 1} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

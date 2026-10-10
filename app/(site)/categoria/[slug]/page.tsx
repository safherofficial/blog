import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { getAllCategorySlugs, getCategoryBySlug, getPostsByCategory } from '@/lib/db'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)
  if (!category) return {}
  return {
    title: category.title,
    description: 'Tutti gli articoli nella categoria ' + category.title + ' su Controluce.',
    alternates: { canonical: `/categoria/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug)
  if (!category) notFound()

  const posts = await getPostsByCategory(params.slug).catch(() => [])

  return (
    <section className="category-page">
      <div className="category-masthead py-16 md:py-20">
        <div className="wrap reveal-on-scroll">
          <Link
            href="/#articoli"
            className="nav-link mb-9 inline-block font-mono text-[10px] uppercase tracking-[0.19em] text-[#D8C3A6] hover:text-[#F5D7A8]"
          >
            {'← Tutti gli articoli'}
          </Link>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.27em] text-[#D9B47F]">Esplora per tema</p>
          <h1 className="max-w-[20ch] font-display text-4xl leading-tight tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl">{category.title}</h1>
          <p className="mt-5 max-w-[46ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">
            Storie e pensieri raccolti sotto un unico sguardo.
          </p>
        </div>
      </div>

      <div className="wrap py-16 md:py-24">
        {posts.length === 0 ? (
          <p className="reveal-on-scroll border-l border-ochre py-2 pl-5 text-ink-soft">Nessun articolo ancora in questa categoria.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
            {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
          </div>
        )}
      </div>
    </section>
  )
}

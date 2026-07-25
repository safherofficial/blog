import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { getAllCategorySlugs, getCategoryBySlug, getPostsByCategory } from '@/lib/sanity/queries'

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
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug)
  if (!category) notFound()

  const posts = await getPostsByCategory(params.slug).catch(() => [])

  return (
    <section className="py-20 md:py-24">
      <div className="wrap">
        <Link
          href="/#articoli"
          className="nav-link mb-8 inline-block font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-wine"
        >
          {'<- Torna a tutti gli articoli'}
        </Link>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Categoria</p>
        <h1 className="mb-12 border-b border-line pb-8 font-display text-4xl md:text-5xl">{category.title}</h1>

        {posts.length === 0 ? (
          <p className="text-ink-soft">Nessun articolo ancora in questa categoria.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

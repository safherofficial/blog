import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { getAllCategorySlugs, getCategoryBySlug, getPostsByCategory, getPublishedCategories } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd, collectionJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'
import { getCategoryEditorialInfo, getRelatedCategorySlugs } from '@/lib/seo/categories'

export const revalidate = 60

type CategoryRouteProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: CategoryRouteProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  const posts = await getPostsByCategory(slug).catch(() => [])
  const info = getCategoryEditorialInfo(slug, category.title)
  const metadata = pageMetadata({
    title: info.seoTitle,
    description: info.description,
    path: `/categoria/${category.slug}`,
  })
  // Una categoria senza articoli è una pagina vuota: meglio che non finisca negli indici.
  return posts.length === 0 ? { ...metadata, robots: { index: false, follow: true } } : metadata
}

export default async function CategoryPage({ params }: CategoryRouteProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [posts, publishedCategories] = await Promise.all([
    getPostsByCategory(slug).catch(() => []),
    getPublishedCategories().catch(() => []),
  ])
  const info = getCategoryEditorialInfo(slug, category.title)
  const relatedSlugs = getRelatedCategorySlugs(slug)
  const relatedCategories = relatedSlugs
    .map((relatedSlug) => publishedCategories.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof publishedCategories)[number] => Boolean(item))

  return (
    <section className="category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            collectionJsonLd({ name: info.label, description: info.description, path: `/categoria/${category.slug}`, items: posts }),
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Articoli', path: '/articoli' }, { name: info.label, path: `/categoria/${category.slug}` }]),
          ]),
        }}
      />
      <div className="category-masthead py-16 md:py-20">
        <div className="wrap reveal-on-scroll">
          <Link
            href="/articoli"
            className="nav-link mb-9 inline-block font-mono text-[10px] uppercase tracking-[0.19em] text-[#D8C3A6] hover:text-[#F5D7A8]"
          >
            {'← Tutti gli articoli'}
          </Link>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.27em] text-[#D9B47F]">Esplora per tema</p>
          <h1 className="max-w-[20ch] font-display text-4xl leading-tight tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl">{info.label}</h1>
          <p className="mt-5 max-w-[62ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">{info.description}</p>
          {posts.length > 0 && <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C9A879]">{posts.length} {posts.length === 1 ? 'articolo' : 'articoli'}</p>}
        </div>
      </div>

      <div className="wrap py-16 md:py-24">
        {posts.length === 0 ? (
          <p className="reveal-on-scroll border-l border-ochre py-2 pl-5 text-ink-soft">Nessun articolo ancora in questa categoria.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
            {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} headingLevel={2} />)}
          </div>
        )}
      </div>

      {relatedCategories.length > 0 && (
        <nav aria-label={`Temi correlati a ${info.label}`} className="wrap mb-20 border-t border-line pt-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Esplora anche</p>
          <div className="flex flex-wrap gap-3">
            {relatedCategories.map((related) => (
              <Link key={related.slug} href={`/categoria/${related.slug}`} className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-ochre hover:bg-bg-soft hover:text-wine">
                {getCategoryEditorialInfo(related.slug, related.title).label} <span className="text-ochre">{related.count}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </section>
  )
}

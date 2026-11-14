import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { getAllCategorySlugs, getCategoryBySlug, getPostsByCategory } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd, collectionJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'

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
  const metadata = pageMetadata({
    title: category.title,
    description: `Tutti gli articoli di ${category.title} su Controluce: storie e pensieri raccolti sotto un unico sguardo.`,
    path: `/categoria/${category.slug}`,
  })
  // Una categoria senza articoli è una pagina vuota: meglio che non finisca negli indici.
  return posts.length === 0 ? { ...metadata, robots: { index: false, follow: true } } : metadata
}

export default async function CategoryPage({ params }: CategoryRouteProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const posts = await getPostsByCategory(slug).catch(() => [])

  return (
    <section className="category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            collectionJsonLd({ name: category.title, description: `Articoli nella categoria ${category.title}.`, path: `/categoria/${category.slug}`, items: posts }),
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Articoli', path: '/articoli' }, { name: category.title, path: `/categoria/${category.slug}` }]),
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
          <h1 className="max-w-[20ch] font-display text-4xl leading-tight tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl">{category.title}</h1>
          <p className="mt-5 max-w-[46ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">
            Storie e pensieri raccolti sotto un unico sguardo.
          </p>
          {posts.length > 0 && <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C9A879]">{posts.length} {posts.length === 1 ? 'articolo' : 'articoli'}</p>}
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

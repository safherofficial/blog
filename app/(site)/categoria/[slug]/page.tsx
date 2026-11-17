import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { getAllCategorySlugs, getArchivePosts, getCategoryBySlug, getPublishedCategories } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd, collectionJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'
import { getCategoryEditorialInfo, getRelatedCategorySlugs } from '@/lib/seo/categories'

export const revalidate = 60

type CategorySearchParams = { pagina?: string | string[] }
type CategoryRouteProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<CategorySearchParams>
}

const PAGE_SIZE = 12

function getRequestedPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] || '' : value || ''
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, 1000)) : 1
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryRouteProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  const firstPage = await getArchivePosts({ categorySlug: slug, page: 1, pageSize: PAGE_SIZE })
    .catch(() => ({ posts: [], total: 0 }))
  const totalPages = Math.max(1, Math.ceil(firstPage.total / PAGE_SIZE))
  const page = Math.min(getRequestedPage(query.pagina), totalPages)
  const info = getCategoryEditorialInfo(slug, category.title)
  const path = page > 1 ? `/categoria/${category.slug}?pagina=${page}` : `/categoria/${category.slug}`
  const metadata = pageMetadata({
    title: page > 1 ? `${info.seoTitle} — pagina ${page}` : info.seoTitle,
    description: page > 1 ? `${info.description} Pagina ${page} dell’archivio tematico.` : info.description,
    path,
  })

  // Una categoria senza articoli è una pagina vuota: meglio che non finisca negli indici.
  return firstPage.total === 0 ? { ...metadata, robots: { index: false, follow: true } } : metadata
}

export default async function CategoryPage({ params, searchParams }: CategoryRouteProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const requestedPage = getRequestedPage(query.pagina)
  const [initialResult, publishedCategories] = await Promise.all([
    getArchivePosts({ categorySlug: slug, page: requestedPage, pageSize: PAGE_SIZE })
      .catch(() => ({ posts: [], total: 0 })),
    getPublishedCategories().catch(() => []),
  ])
  const totalPages = Math.max(1, Math.ceil(initialResult.total / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const result = currentPage === requestedPage
    ? initialResult
    : await getArchivePosts({ categorySlug: slug, page: currentPage, pageSize: PAGE_SIZE })
      .catch(() => ({ posts: [], total: 0 }))

  const posts = result.posts
  const total = result.total
  const info = getCategoryEditorialInfo(slug, category.title)
  const categoryPath = `/categoria/${category.slug}`
  const pagePath = currentPage > 1 ? `${categoryPath}?pagina=${currentPage}` : categoryPath
  const relatedSlugs = getRelatedCategorySlugs(slug)
  const relatedCategories = relatedSlugs
    .map((relatedSlug) => publishedCategories.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof publishedCategories)[number] => Boolean(item))

  const pageUrl = (nextPage: number) => nextPage > 1
    ? `${categoryPath}?pagina=${nextPage}`
    : categoryPath

  const firstResult = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(currentPage * PAGE_SIZE, total)

  return (
    <section className="category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            collectionJsonLd({ name: info.label, description: info.description, path: pagePath, items: posts }),
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Articoli', path: '/articoli' }, { name: info.label, path: categoryPath }]),
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
          <p className="mt-5 max-w-[62ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">{info.intro}</p>
          {total > 0 && (
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C9A879]">
              {total} {total === 1 ? 'articolo' : 'articoli'}
            </p>
          )}
        </div>
      </div>

      <div className="wrap py-16 md:py-24">
        {total === 0 ? (
          <p className="reveal-on-scroll border-l border-ochre py-2 pl-5 text-ink-soft">Nessun articolo ancora in questa categoria.</p>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                Risultati {firstResult}–{lastResult} di {total}
              </p>
              {totalPages > 1 && (
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  Pagina {currentPage} di {totalPages}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
              {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} headingLevel={2} />)}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Paginazione articoli della categoria" className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
                {currentPage > 1 ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {currentPage > 2 && (
                      <Link href={categoryPath} className="nav-link font-mono text-[10px] uppercase tracking-[0.15em] text-wine">
                        Prima pagina
                      </Link>
                    )}
                    <Link href={pageUrl(currentPage - 1)} rel="prev" className="editorial-button inline-flex items-center gap-3 border border-wine px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-wine hover:bg-wine hover:text-bg">
                      <span aria-hidden="true">←</span> Precedenti
                    </Link>
                  </div>
                ) : <span aria-hidden="true" />}
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">{currentPage} / {totalPages}</span>
                {currentPage < totalPages ? (
                  <Link href={pageUrl(currentPage + 1)} rel="next" className="editorial-button inline-flex items-center gap-3 border border-wine bg-wine px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-bg hover:bg-wine-dark">
                    Successivi <span aria-hidden="true">→</span>
                  </Link>
                ) : <span aria-hidden="true" />}
              </nav>
            )}
          </>
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

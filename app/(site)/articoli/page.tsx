import type { Metadata } from 'next'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { getArchivePosts, getPublishedCategories } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd, collectionJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: 'Tutti gli articoli',
  description: 'L’archivio completo di Controluce: cerca tra gli articoli, esplora gli argomenti e ritrova le storie dal più recente.',
  path: '/articoli',
})

type ArchiveSearchParams = {
  q?: string | string[]
  categoria?: string | string[]
  ordine?: string | string[]
  pagina?: string | string[]
}

const PAGE_SIZE = 12
const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || '' : value || ''

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<ArchiveSearchParams>
}) {
  const params = await searchParams
  const query = firstValue(params.q).trim().slice(0, 100)
  const requestedCategory = firstValue(params.categoria).trim().slice(0, 120)
  const sort = firstValue(params.ordine) === 'oldest' ? 'oldest' : 'newest'
  const requestedPage = Number.parseInt(firstValue(params.pagina), 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.min(requestedPage, 1000)) : 1

  const categories = await getPublishedCategories().catch(() => [])
  const categorySlug = categories.some((category) => category.slug === requestedCategory)
    ? requestedCategory
    : ''

  const filters = {
    query,
    categorySlug: categorySlug || null,
    sort,
    page,
    pageSize: PAGE_SIZE,
  }

  let result = await getArchivePosts(filters).catch(() => ({ posts: [], total: 0 }))
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  // Un link salvato a una pagina non più esistente torna all'ultima pagina valida.
  if (currentPage !== page) {
    result = await getArchivePosts({ ...filters, page: currentPage }).catch(() => ({ posts: [], total: 0 }))
  }

  const posts = result.posts
  const total = result.total
  const hasActiveFilters = Boolean(query || categorySlug)
  const isDefaultArchive = !hasActiveFilters && sort === 'newest' && currentPage === 1
  const firstResult = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(currentPage * PAGE_SIZE, total)

  const archiveUrl = (nextPage?: number) => {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    if (categorySlug) next.set('categoria', categorySlug)
    if (sort !== 'newest') next.set('ordine', sort)
    if (nextPage && nextPage > 1) next.set('pagina', String(nextPage))
    const encoded = next.toString()
    return encoded ? `/articoli?${encoded}` : '/articoli'
  }

  const categoryUrl = (slug: string) => {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    next.set('categoria', slug)
    if (sort !== 'newest') next.set('ordine', sort)
    return `/articoli?${next.toString()}`
  }

  return (
    <section className="archive-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            ...(isDefaultArchive
              ? [collectionJsonLd({ name: 'Tutti gli articoli', description: 'L’archivio completo di Controluce.', path: '/articoli', items: posts })]
              : []),
            breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Articoli', path: '/articoli' }]),
          ]),
        }}
      />

      <div className="category-masthead py-16 md:py-20">
        <div className="wrap reveal-on-scroll">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.27em] text-[#D9B47F]">Archivio</p>
          <h1 className="max-w-[20ch] font-display text-4xl leading-tight tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl">Tutti gli articoli</h1>
          <p className="mt-5 max-w-[46ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">
            Cerca una parola, scegli un tema o cambia ordine. Le storie restano qui, pronte per essere ritrovate.
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C9A879]">
            {total} {total === 1 ? 'articolo trovato' : 'articoli trovati'}
          </p>
        </div>
      </div>

      <div className="wrap py-12 md:py-16">
        <form action="/articoli" method="get" role="search" aria-label="Cerca e filtra gli articoli" className="reveal-on-scroll mb-10 border border-line bg-bg-soft/60 p-5 md:p-7">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_minmax(160px,0.7fr)_auto] lg:items-end">
            <div className="min-w-0">
              <label htmlFor="archive-query" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">Cerca nel blog</label>
              <input
                id="archive-query"
                name="q"
                type="search"
                maxLength={100}
                defaultValue={query}
                placeholder="Titolo, argomento o parola chiave…"
                className="w-full border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ochre"
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="archive-category" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">Argomento</label>
              <select
                id="archive-category"
                name="categoria"
                defaultValue={categorySlug}
                className="w-full border border-line bg-bg px-4 py-3 text-sm text-ink focus-visible:border-ochre"
              >
                <option value="">Tutte le categorie</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.title} ({category.count})</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="archive-sort" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">Ordina per</label>
              <select
                id="archive-sort"
                name="ordine"
                defaultValue={sort}
                className="w-full border border-line bg-bg px-4 py-3 text-sm text-ink focus-visible:border-ochre"
              >
                <option value="newest">Più recenti</option>
                <option value="oldest">Meno recenti</option>
              </select>
            </div>

            <button type="submit" className="editorial-button inline-flex min-h-[46px] items-center justify-center gap-3 border border-wine bg-wine px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bg hover:bg-wine-dark">
              Cerca <span aria-hidden="true">↗</span>
            </button>
          </div>

          {(query || categorySlug || sort !== 'newest') && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-sm text-ink-soft">
                Filtri attivi{query ? <> · ricerca: <strong className="font-medium text-ink">“{query}”</strong></> : null}{categorySlug ? <> · {categories.find((category) => category.slug === categorySlug)?.title}</> : null}{sort === 'oldest' ? ' · dal meno recente' : ''}
              </p>
              <Link href="/articoli" className="nav-link font-mono text-[10px] uppercase tracking-[0.16em] text-wine">Azzera filtri ↗</Link>
            </div>
          )}
        </form>

        {categories.length > 0 && (
          <nav aria-label="Esplora gli articoli per tema" className="reveal-on-scroll mb-12 flex flex-wrap items-center gap-3 border-b border-line pb-8">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Esplora per tema</span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={categoryUrl(category.slug)}
                aria-current={categorySlug === category.slug ? 'true' : undefined}
                className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${categorySlug === category.slug ? 'border-wine bg-wine text-bg' : 'border-line text-ink-soft hover:border-ochre hover:bg-bg-soft hover:text-wine'}`}
              >
                {category.title} <span className="opacity-75">{category.count}</span>
              </Link>
            ))}
          </nav>
        )}

        {total === 0 ? (
          <div className="border-l border-ochre py-2 pl-5">
            <p className="font-display text-2xl text-ink">{hasActiveFilters ? 'Nessun risultato trovato.' : 'Nessun articolo è ancora disponibile.'}</p>
            <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-ink-soft">
              {hasActiveFilters
                ? 'Prova con parole diverse, rimuovi un filtro o esplora tutte le categorie.'
                : 'Torna presto per leggere i nuovi contenuti.'}
            </p>
            {hasActiveFilters && <Link href="/articoli" className="nav-link mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-wine">Mostra tutti gli articoli ↗</Link>}
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                Risultati {firstResult}–{lastResult} di {total}
              </p>
              {totalPages > 1 && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">Pagina {currentPage} di {totalPages}</p>}
            </div>

            <div className="grid grid-cols-1 gap-x-9 gap-y-14 md:grid-cols-2 lg:grid-cols-3 md:gap-y-16">
              {posts.map((post, index) => <PostCard key={post._id} post={post} index={index} />)}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Paginazione articoli" className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
                {currentPage > 1 ? (
                  <Link href={archiveUrl(currentPage - 1)} rel="prev" className="editorial-button inline-flex items-center gap-3 border border-wine px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-wine hover:bg-wine hover:text-bg">
                    <span aria-hidden="true">←</span> Precedenti
                  </Link>
                ) : <span />}
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">{currentPage} / {totalPages}</span>
                {currentPage < totalPages ? (
                  <Link href={archiveUrl(currentPage + 1)} rel="next" className="editorial-button inline-flex items-center gap-3 border border-wine bg-wine px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-bg hover:bg-wine-dark">
                    Successivi <span aria-hidden="true">→</span>
                  </Link>
                ) : <span />}
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  )
}

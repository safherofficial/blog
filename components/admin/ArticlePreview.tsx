'use client'

import { useEffect, useMemo, useRef } from 'react'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PostCard from '@/components/PostCard'
import PostNav from '@/components/PostNav'
import ArticleToc from '@/components/ArticleToc'
import CropFrame from '@/components/CropFrame'
import { getHeadings, readingMinutes } from '@/lib/content/article'
import { editorTextToPortableText } from '@/lib/content/editor'
import type { PortableTextBlock } from '@/lib/db'
import AuthorCard from '@/components/AuthorCard'
import { AUTHOR_PEN_NAME } from '@/lib/author'
import type { Category, Post, SiteSettingsRow } from './types'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  excerpt: string
  coverImageUrl: string
  coverImageAlt: string
  categoryTitle: string | null
  publishedAtLocal: string
  bodyText: string
  currentPostId: string | null
  currentCategoryId: string | null
  posts: Post[]
  categories: Category[]
  settings: SiteSettingsRow
}

const shareButtonClass = 'inline-flex items-center gap-2 border border-line bg-transparent px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft'

export default function ArticlePreview({
  open,
  onClose,
  title,
  excerpt,
  coverImageUrl,
  coverImageAlt,
  categoryTitle,
  publishedAtLocal,
  bodyText,
  currentPostId,
  currentCategoryId,
  posts,
  categories,
  settings,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const body = useMemo(() => editorTextToPortableText(bodyText), [bodyText])
  const headings = useMemo(() => getHeadings(body), [body])
  const minutes = readingMinutes(body)
  const siteTitle = settings.site_title || 'Controluce'
  const date = publishedAtLocal ? new Date(publishedAtLocal) : new Date()
  const validDate = !Number.isNaN(date.getTime())
  const formattedDate = validDate
    ? date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data da impostare'

  const previewId = currentPostId || '__controluce_article_preview__'
  const previewPost: Post = {
    id: previewId,
    title,
    slug: 'anteprima-articolo',
    excerpt,
    cover_image_url: coverImageUrl || null,
    cover_image_alt: coverImageAlt || null,
    category_id: currentCategoryId,
    published_at: validDate ? date.toISOString() : new Date().toISOString(),
    published: true,
    body,
  }
  const livePosts = posts.filter((item) => {
    if (item.id === currentPostId || !item.published) return false
    const publishedAt = new Date(item.published_at).getTime()
    return !Number.isNaN(publishedAt) && publishedAt <= Date.now()
  })
  const timeline = [...livePosts, previewPost].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )
  const position = timeline.findIndex((item) => item.id === previewId)
  const category = categories.find((item) => item.id === currentCategoryId)
  const sameCategory = category
    ? livePosts.filter((item) => item.category_id === currentCategoryId)
    : []
  const selectedSameCategory = sameCategory.slice(0, 3)
  const excludedRelatedIds = new Set([previewId, ...selectedSameCategory.map((item) => item.id)])
  const relatedFillers = livePosts
    .filter((item) => !excludedRelatedIds.has(item.id))
    .slice(0, Math.max(0, 3 - selectedSameCategory.length))
  const relatedPosts = [...selectedSameCategory, ...relatedFillers]

  function asPostSummary(item: Post) {
    const itemCategory = categories.find((entry) => entry.id === item.category_id)
    return {
      _id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      coverImage: item.cover_image_url ? { url: item.cover_image_url, alt: item.cover_image_alt } : null,
      publishedAt: item.published_at,
      category: itemCategory ? { title: itemCategory.title, slug: itemCategory.slug } : null,
    }
  }

  const newer = position > 0 ? asPostSummary(timeline[position - 1]) : null
  const older = position >= 0 && position < timeline.length - 1 ? asPostSummary(timeline[position + 1]) : null
  const related = relatedPosts.map(asPostSummary)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const idByKey = new Map(headings.map((heading) => [heading.key, heading.id]))
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className="mb-6">{children}</p>,
      h2: ({ children, value: block }) => {
        const id = idByKey.get(block._key ?? '')
        return (
          <h2 id={id} className="group relative mt-14 mb-5 font-display text-3xl italic">
            {children}
            {id && <a href={'#' + id} className="heading-anchor" aria-label="Link diretto a questa sezione">#</a>}
          </h2>
        )
      },
      blockquote: ({ children }) => (
        <blockquote className="my-12 border-l-[3px] border-ochre py-1 pl-7 font-display text-2xl italic text-wine">
          {children}
        </blockquote>
      ),
    },
    types: {
      image: ({ value: image }) => (
        <figure className="article-figure editorial-media-frame reveal-on-scroll relative my-14 aspect-video overflow-hidden border border-line">
          <CropFrame />
          <Image src={image.url} alt={image.alt || ''} fill unoptimized sizes="(max-width: 760px) 100vw, 860px" className="object-cover" />
          {image.alt && <figcaption className="absolute bottom-4 left-4 z-10 max-w-[80%] bg-ink/75 px-3 py-2 font-mono text-[10px] tracking-wide text-bg">{image.alt}</figcaption>}
        </figure>
      ),
    },
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-ink/80 p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-preview-dialog-title"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
      onClickCapture={(event) => {
        const target = event.target as HTMLElement
        const link = target.closest('a')
        if (!link) return
        event.preventDefault()
        const href = link.getAttribute('href') || ''
        if (href.startsWith('#')) {
          const targetId = decodeURIComponent(href.slice(1))
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }}
    >
      <div className="mx-auto flex min-h-full max-w-[1480px] flex-col overflow-hidden border border-[#72583D] bg-bg shadow-2xl">
        <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-3 border-b border-[#59422D] bg-ink px-4 py-3 text-bg sm:px-6">
          <div>
            <p id="article-preview-dialog-title" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D5B27F]">Anteprima articolo</p>
            <p className="mt-1 text-xs text-[#D5C7B7]">Visualizzazione fedele al layout pubblico · le modifiche non vengono salvate</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 border border-[#8C7357] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-bg transition-colors hover:border-[#D5B27F] hover:text-[#E7C995]"
          >
            Chiudi anteprima <span aria-hidden="true" className="text-base leading-none">×</span>
          </button>
        </div>

        <div className="site-shell min-h-full">
          <Header siteTitle={siteTitle} instagramUrl={settings.instagram_url} />
          <main id="article-preview-content" className="site-page-transition">
            <article className="article-page">
              <header className="article-masthead relative overflow-hidden border-b border-[#4E3B2B] py-14 md:py-20">
                <div className="article-masthead-glow pointer-events-none absolute inset-0" aria-hidden="true" />
                <div className="wrap article-masthead-content relative z-10">
                  <span className="article-back-link mb-9 inline-block font-mono text-[10px] uppercase tracking-[0.19em]">
                    ← Torna agli articoli
                  </span>
                  <p className="article-category mb-5 font-mono text-[10px] uppercase tracking-[0.26em]">
                    {categoryTitle || 'Dal diario'}
                  </p>
                  <h1 className="max-w-[22ch] font-display text-4xl leading-[1.08] tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl lg:text-7xl">
                    {title || 'Titolo dell’articolo'}
                  </h1>
                  <div role="group" aria-label="Informazioni sull’articolo" className="article-date mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em]">
                    <span className="inline-block h-px w-8 bg-[#C9A879]" />
                    <span>Pubblicato il <time dateTime={validDate ? date.toISOString() : undefined}>{formattedDate}</time></span>
                    <span aria-hidden="true">·</span>
                    <span>{minutes} min di lettura</span>
                    <span aria-hidden="true">·</span>
                    <span>A cura di{' '}
                      <a href="/about" className="nav-link font-semibold text-[#E8CEAA]">{AUTHOR_PEN_NAME}</a>
                    </span>
                  </div>
                  {excerpt.trim() && <p className="article-standfirst mt-8 max-w-[58ch] font-serif text-xl leading-relaxed text-[#D9C9B7]">{excerpt}</p>}
                </div>
              </header>

              {coverImageUrl.trim() && (
                <div className="wrap">
                  <div className="editorial-media-frame cover-image-frame reveal-on-scroll relative my-10 overflow-hidden border border-line md:my-14">
                    <CropFrame />
                    <Image
                      src={coverImageUrl.trim()}
                      alt={coverImageAlt || title || 'Copertina articolo'}
                      width={1600}
                      height={1000}
                      priority
                      sizes="(max-width: 767px) 100vw, 1160px"
                      unoptimized
                      className="block h-auto w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="article-shell pb-20 pt-8 md:pt-12">
                <div className="article-layout">
                  <div className="article-column">
                    {headings.length >= 2 && <ArticleToc items={headings} variant="inline" />}
                    <div data-article-body>
                      <div className="article-prose font-serif text-[19px] leading-[1.85] text-ink">
                        <PortableText value={body as PortableTextBlock[]} components={components} />
                      </div>
                    </div>
                    <div className="article-end-mark mt-16 flex items-center justify-center gap-3" aria-hidden="true">
                      <span className="h-px w-12 bg-line" />
                      <span className="font-display text-xl italic text-ochre">C</span>
                      <span className="h-px w-12 bg-line" />
                    </div>
                    <div className="mt-12 border-t border-line pt-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Condividi</span>
                        <button type="button" disabled className={shareButtonClass + ' cursor-not-allowed opacity-60'}>Copia link</button>
                        <span className={shareButtonClass}>WhatsApp <span aria-hidden="true">↗</span></span>
                      </div>
                    </div>
                    <div className="mt-10">
                      <AuthorCard />
                    </div>
                  </div>
                  {headings.length >= 2 && (
                    <aside className="article-toc-rail">
                      <div className="sticky top-24">
                        <ArticleToc items={headings} variant="side" />
                      </div>
                    </aside>
                  )}
                </div>
              </div>
              {(newer || older) && (
                <div className="article-column mt-16">
                  <PostNav newer={newer} older={older} />
                </div>
              )}

              {related.length > 0 && (
                <section className="border-t border-line bg-bg-soft py-20 md:py-24">
                  <div className="wrap">
                    <div className="mb-10">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">Continua a leggere</p>
                      <h2 className="font-display text-3xl md:text-4xl">Altri articoli</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
                      {related.map((relatedPost, index) => (
                        <PostCard key={relatedPost._id} post={relatedPost} index={index} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="border-t border-line bg-bg py-14 md:py-18">
                <div className="wrap max-w-[760px] text-center">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Dall&apos;altra parte della storia</p>
                  <h2 className="mb-4 font-display text-3xl leading-tight md:text-4xl">Hai qualcosa da raccontarmi?</h2>
                  <p className="mx-auto mb-7 max-w-[55ch] font-serif text-lg leading-relaxed text-ink-soft">
                    Un pensiero, un ricordo o un&apos;esperienza da condividere: puoi scrivermi in uno spazio privato, con le tue parole e i tuoi tempi.
                  </p>
                  <span className="editorial-button inline-flex items-center gap-4 border border-wine bg-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bg">
                    Parliamone <span aria-hidden="true" className="text-lg leading-none">→</span>
                  </span>
                </div>
              </section>
            </article>
          </main>
          <Footer siteTitle={siteTitle} instagramUrl={settings.instagram_url} />
        </div>
      </div>
    </div>
  )
}

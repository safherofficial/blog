import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts, getAllPostSlugs, getPostBySlug, getRelatedPosts, getSiteSettings } from '@/lib/db'
import { bodyWordCount, getHeadings, readingMinutes } from '@/lib/content/article'
import { breadcrumbJsonLd, organizationJsonLd } from '@/lib/seo/jsonld'
import { pageMetadata } from '@/lib/seo/metadata'
import { getSiteUrl } from '@/lib/seo/site'
import { imageUrl as getImageUrl } from '@/lib/content/images'
import { safeJsonLd } from '@/lib/content/safe-json'
import PostBody from '@/components/PostBody'
import PostCard from '@/components/PostCard'
import CropFrame from '@/components/CropFrame'
import ArticleToc from '@/components/ArticleToc'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/AuthorCard'
import PostNav from '@/components/PostNav'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [post, settings] = await Promise.all([getPostBySlug(params.slug), getSiteSettings().catch(() => null)])
  if (!post) return {}

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const coverImageUrl = getImageUrl(post.coverImage) || undefined
  const author = settings?.authorName?.trim()
  // Con copertina si usa quella scelta dall'autrice; altrimenti un'anteprima di marca generata dal sito.
  const base = pageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    image: coverImageUrl || `/blog/${post.slug}/og`,
    imageAlt: post.coverImage?.alt || post.title,
  })

  return {
    ...base,
    authors: author ? [{ name: author, url: '/about' }] : undefined,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      section: post.category?.title,
      authors: author ? [author] : undefined,
    } as Metadata['openGraph'],
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const [relatedPosts, allPosts, settings] = await Promise.all([
    getRelatedPosts(post._id, post.category?.slug).catch(() => []),
    getAllPosts().catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  const coverImageUrl = getImageUrl(post.coverImage)
  const headings = getHeadings(post.body)
  const minutes = readingMinutes(post.body)
  const position = allPosts.findIndex((candidate) => candidate._id === post._id)
  const newer = position > 0 ? allPosts[position - 1] : null
  const older = position >= 0 && position < allPosts.length - 1 ? allPosts[position + 1] : null
  const siteUrl = getSiteUrl()
  const authorName = settings?.authorName?.trim()
  // Mostriamo l'aggiornamento solo se è davvero successivo alla pubblicazione (oltre un giorno).
  const updated =
    post.updatedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86_400_000
      ? new Date(post.updatedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
      : null

  return (
    <article className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              '@id': `${siteUrl}/blog/${post.slug}#article`,
              headline: post.title,
              description: post.seoDescription || post.excerpt,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt || post.publishedAt,
              inLanguage: 'it-IT',
              url: `${siteUrl}/blog/${post.slug}`,
              mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
              image: coverImageUrl || `${siteUrl}/blog/${post.slug}/og`,
              articleSection: post.category?.title,
              wordCount: bodyWordCount(post.body),
              timeRequired: `PT${minutes}M`,
              isPartOf: { '@type': 'Blog', '@id': `${siteUrl}/#blog`, name: settings?.siteTitle || 'Controluce' },
              author: authorName
                ? { '@type': 'Person', name: authorName, url: `${siteUrl}/about`, ...(settings?.instagramUrl ? { sameAs: [settings.instagramUrl] } : {}) }
                : { '@type': 'Organization', name: settings?.siteTitle || 'Controluce', url: siteUrl },
              publisher: organizationJsonLd(settings),
            },
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Articoli', path: '/articoli' },
              ...(post.category ? [{ name: post.category.title, path: `/categoria/${post.category.slug}` }] : []),
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
          ]),
        }}
      />

      <header className="article-masthead relative overflow-hidden border-b border-[#4E3B2B] py-14 md:py-20">
        <div className="article-masthead-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="wrap article-masthead-content relative z-10 reveal-on-scroll">
          <Link
            href="/articoli"
            className="article-back-link nav-link mb-9 inline-block font-mono text-[10px] uppercase tracking-[0.19em]"
          >
            {'← Torna agli articoli'}
          </Link>
          <p className="article-category mb-5 font-mono text-[10px] uppercase tracking-[0.26em]">
            {post.category ? (
              <Link href={`/categoria/${post.category.slug}`} className="nav-link">
                {post.category.title}
              </Link>
            ) : (
              'Dal diario'
            )}
          </p>
          <h1 className="max-w-[22ch] font-display text-4xl leading-[1.08] tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl lg:text-7xl">{post.title}</h1>
          <p className="article-date mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="inline-block h-px w-8 bg-[#C9A879]" />
            <time dateTime={post.publishedAt}>{date}</time>
            <span aria-hidden="true">·</span>
            <span>{minutes} min di lettura</span>
            {updated && (
              <>
                <span aria-hidden="true">·</span>
                <span>Aggiornato il <time dateTime={post.updatedAt}>{updated}</time></span>
              </>
            )}
          </p>
          {post.excerpt && <p className="article-standfirst mt-8 max-w-[58ch] font-serif text-xl leading-relaxed text-[#D9C9B7]">{post.excerpt}</p>}
        </div>
      </header>

      {post.coverImage && (
        <div className="wrap">
          <div className="editorial-media-frame cover-image-frame reveal-on-scroll relative my-10 overflow-hidden border border-line md:my-14">
            <CropFrame />
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
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
              <PostBody value={post.body} />
            </div>
            <div className="article-end-mark mt-16 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-line" />
              <span className="font-display text-xl italic text-ochre">C</span>
              <span className="h-px w-12 bg-line" />
            </div>
            <div className="mt-12 border-t border-line pt-8 print:hidden">
              <ShareButtons title={post.title} />
            </div>
            <div className="mt-10 print:hidden">
              <AuthorCard settings={settings} />
            </div>
          </div>
          {headings.length >= 2 && (
            <aside className="article-toc-rail print:hidden">
              <div className="sticky top-24">
                <ArticleToc items={headings} variant="side" />
              </div>
            </aside>
          )}
        </div>
        <div className="article-column mt-16 print:hidden">
          <PostNav newer={newer} older={older} />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-line bg-bg-soft py-20 md:py-24">
          <div className="wrap">
            <div className="reveal-on-scroll mb-10">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">Continua a leggere</p>
              <h2 className="font-display text-3xl md:text-4xl">Altri articoli</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
              {relatedPosts.map((relatedPost, i) => (
                <PostCard key={relatedPost._id} post={relatedPost} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="border-t border-line bg-bg py-14 md:py-18 print:hidden">
        <div className="wrap max-w-[760px] text-center">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Dall&apos;altra parte della storia</p>
          <h2 className="mb-4 font-display text-3xl leading-tight md:text-4xl">Hai qualcosa da raccontarmi?</h2>
          <p className="mx-auto mb-7 max-w-[55ch] font-serif text-lg leading-relaxed text-ink-soft">
            Un pensiero, un ricordo o un&apos;esperienza da condividere: puoi scrivermi in uno spazio privato, con le tue parole e i tuoi tempi.
          </p>
          <Link href="/scrivimi" className="editorial-button inline-flex items-center gap-4 border border-wine bg-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bg hover:bg-wine-dark">
            Parliamone <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
      </section>
    </article>
  )
}

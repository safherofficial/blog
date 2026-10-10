import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/db'
import { imageUrl as getImageUrl } from '@/lib/content/images'
import { safeJsonLd } from '@/lib/content/safe-json'
import PostBody from '@/components/PostBody'
import PostCard from '@/components/PostCard'
import CropFrame from '@/components/CropFrame'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs().catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const coverImageUrl = getImageUrl(post.coverImage) || undefined

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      images: coverImageUrl ? [coverImageUrl] : undefined,
      publishedTime: post.publishedAt,
    },
    twitter: { card: 'summary_large_image', title, description },
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

  const relatedPosts = await getRelatedPosts(post._id, post.category?.slug).catch(() => [])
  const coverImageUrl = getImageUrl(post.coverImage)

  return (
    <article className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.controluce-blog.it'}/blog/${post.slug}`,
            image: coverImageUrl || undefined,
            author: { '@type': 'Person', name: 'Controluce' },
          }),
        }}
      />

      <header className="article-masthead relative overflow-hidden border-b border-[#4E3B2B] py-14 md:py-20">
        <div className="article-masthead-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="wrap article-masthead-content relative z-10 reveal-on-scroll">
          <Link
            href="/#articoli"
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
          </p>
        </div>
      </header>

      {post.coverImage && (
        <div className="wrap">
          <div className="editorial-media-frame reveal-on-scroll relative my-10 aspect-[21/9] overflow-hidden border border-line md:my-14">
            <CropFrame />
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 1160px"
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="wrap mx-auto max-w-[760px] pb-24 pt-8 md:pt-12 reveal-on-scroll">
        <PostBody value={post.body} />
        <div className="article-end-mark mt-16 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-line" />
          <span className="font-display text-xl italic text-ochre">C</span>
          <span className="h-px w-12 bg-line" />
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
    </article>
  )
}

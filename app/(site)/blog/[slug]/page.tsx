import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPostSlugs, getPostBySlug } from '@/lib/sanity/queries'
import { urlForImage } from '@/lib/sanity/image'
import PostBody from '@/components/PostBody'
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
  const imageUrl = post.coverImage ? urlForImage(post.coverImage).width(1200).height(630).url() : undefined

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      publishedTime: post.publishedAt,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
          }),
        }}
      />

      <div className="wrap border-b border-line py-16">
        <Link href="/#articoli" className="nav-link mb-8 inline-block font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-wine">
          ← Torna agli articoli
        </Link>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-wine">
          {post.category?.title || 'Blog'}
        </p>
        <h1 className="max-w-[22ch] font-display text-4xl leading-tight md:text-6xl">{post.title}</h1>
        <p className="mt-7 font-mono text-xs uppercase tracking-widest text-ink-soft">{date}</p>
      </div>

      {post.coverImage && (
        <div className="wrap">
          <div className="relative my-12 aspect-[21/9] overflow-hidden">
            <CropFrame />
            <Image
              src={urlForImage(post.coverImage).width(1600).url()}
              alt={post.coverImage.alt || post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="wrap mx-auto max-w-[720px] pb-24">
        <PostBody value={post.body} />
      </div>
    </article>
  )
}

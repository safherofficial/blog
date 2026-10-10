import Link from 'next/link'
import Image from 'next/image'
import CropFrame from './CropFrame'
import type { PostSummary } from '@/lib/db'

const gradients = [
  'from-[#8D6E47] to-[#35241B]',
  'from-[#5A4A3D] to-[#211A15]',
  'from-[#C09B69] to-[#4A3024]',
]

export default function PostCard({ post, index = 0 }: { post: PostSummary; index?: number }) {
  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className="editorial-card group min-w-0" style={{ animationDelay: `${Math.min(index, 4) * 90}ms` }}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div className={`relative mb-5 aspect-[4/3] overflow-hidden border border-line/70 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
          <CropFrame />
          {post.coverImage?.url && (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 33vw"
              unoptimized
              className="editorial-card-image object-cover"
            />
          )}
          <span className="pointer-events-none absolute inset-3 border border-white/20 transition-all duration-500 group-hover:inset-4 group-hover:border-white/40" aria-hidden="true" />
        </div>
      </Link>
      <p className="mb-3 flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-[0.13em] text-ink-soft">
        {post.category ? (
          <Link href={`/categoria/${post.category.slug}`} className="nav-link text-wine transition-colors hover:text-ochre">{post.category.title}</Link>
        ) : 'Blog'}
        <span aria-hidden="true" className="text-ochre">/</span>
        <time dateTime={post.publishedAt}>{date}</time>
      </p>
      <Link href={`/blog/${post.slug}`} className="block">
        <h3 className="mb-3 font-display text-2xl leading-snug tracking-tight transition-colors duration-300 group-hover:text-wine">{post.title}</h3>
        <p className="text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-wine transition-all duration-300 group-hover:gap-3">
          Continua a leggere <span aria-hidden="true">↗</span>
        </span>
      </Link>
    </article>
  )
}

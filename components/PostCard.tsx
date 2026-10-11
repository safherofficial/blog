import Link from 'next/link'
import Image from 'next/image'
import CropFrame from './CropFrame'
import type { PostSummary } from '@/lib/db'

const gradients = [
  'from-[#8D6E47] to-[#35241B]',
  'from-[#5A4A3D] to-[#211A15]',
  'from-[#C09B69] to-[#4A3024]',
]

export default function PostCard({ post, index = 0, featured = false }: { post: PostSummary; index?: number; featured?: boolean }) {
  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className={`editorial-card reveal-on-scroll group min-w-0 ${featured ? 'lg:grid lg:grid-cols-12 lg:items-center lg:gap-12' : ''}`} style={{ animationDelay: `${Math.min(index, 4) * 90}ms` }}>
      <Link href={`/blog/${post.slug}`} className={`block ${featured ? 'lg:col-span-7' : ''}`} aria-label={`Leggi: ${post.title}`}>
        <div className={`editorial-media-frame relative mb-5 ${featured ? 'lg:mb-0 lg:aspect-[16/10]' : ''} aspect-[4/3] overflow-hidden border border-line/70 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
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
          <span className="pointer-events-none absolute inset-3 border border-white/20 transition-all duration-700 group-hover:inset-5 group-hover:border-white/50" aria-hidden="true" />
          <span className="card-image-index absolute bottom-5 left-5 z-10 font-mono text-[9px] uppercase tracking-[0.22em] text-white/85">{String(index + 1).padStart(2, '0')} / CONTROLUCE</span>
        </div>
      </Link>
      <div className={featured ? 'lg:col-span-5' : ''}>
      <p className="mb-3 flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-[0.13em] text-ink-soft">
        {post.category ? (
          <Link href={`/categoria/${post.category.slug}`} className="nav-link text-wine transition-colors hover:text-ochre">{post.category.title}</Link>
        ) : 'Blog'}
        <span aria-hidden="true" className="text-ochre">/</span>
        <time dateTime={post.publishedAt}>{date}</time>
      </p>
      <Link href={`/blog/${post.slug}`} className="post-title-link block">
        <h3 className={`mb-3 font-display leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-wine ${featured ? 'text-3xl lg:text-4xl' : 'text-2xl'}`}>{post.title}</h3>
        <p className="text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className="post-read-more mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-wine transition-all duration-300 group-hover:gap-4">
          Continua a leggere <span aria-hidden="true">↗</span>
        </span>
      </Link>
      </div>
    </article>
  )
}

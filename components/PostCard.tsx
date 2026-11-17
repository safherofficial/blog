import Link from 'next/link'
import Image from 'next/image'
import CropFrame from './CropFrame'
import type { PostSummary } from '@/lib/db'
import { isUploadedCoverImageUrl } from '@/lib/content/images'
import { getCategoryEditorialInfo } from '@/lib/seo/categories'

const gradients = [
  'from-[#8D6E47] to-[#35241B]',
  'from-[#5A4A3D] to-[#211A15]',
  'from-[#C09B69] to-[#4A3024]',
]

export default function PostCard({ post, index = 0, featured = false, headingLevel = 3, imageSizes = '(max-width: 640px) calc(100vw - 46px), (max-width: 767px) calc(100vw - 66px), (max-width: 1375px) calc((min(100vw, 1240px) - 144px) / 3), 365px' }: { post: PostSummary; index?: number; featured?: boolean; headingLevel?: 2 | 3; imageSizes?: string }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className={`editorial-card reveal-on-scroll group min-w-0 ${featured ? 'lg:grid lg:grid-cols-12 lg:items-center lg:gap-12' : ''}`} style={{ animationDelay: `${Math.min(index, 4) * 90}ms` }}>
      <Link href={`/blog/${post.slug}`} className={`block ${featured ? 'lg:col-span-7' : ''}`} aria-label={`Leggi: ${post.title}`}>
        <div className={`editorial-media-frame cover-image-frame relative mb-5 ${featured ? 'lg:mb-0' : ''} ${post.coverImage?.url ? '' : featured ? 'aspect-[4/3] lg:aspect-[16/10]' : 'aspect-[4/3]'} overflow-hidden border border-line/70 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
          <CropFrame />
          {post.coverImage?.url && (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              width={1200}
              height={800}
              sizes={imageSizes}
              quality={75}
              unoptimized={!isUploadedCoverImageUrl(post.coverImage.url)}
              className="editorial-card-image block h-auto w-full object-contain"
            />
          )}
          <span className="pointer-events-none absolute inset-3 border border-white/20 transition-all duration-700 group-hover:inset-5 group-hover:border-white/50" aria-hidden="true" />
          <span className="card-image-index absolute bottom-5 left-5 z-10 font-mono text-[9px] uppercase tracking-[0.22em] text-white/85">{String(index + 1).padStart(2, '0')} / CONTROLUCE</span>
        </div>
      </Link>
      <div className={featured ? 'lg:col-span-5' : ''}>
      <p className="mb-3 flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-[0.13em] text-ink-soft">
        {post.category ? (
          <Link href={`/categoria/${post.category.slug}`} className="nav-link text-wine transition-colors hover:text-ochre">{getCategoryEditorialInfo(post.category.slug, post.category.title).label}</Link>
        ) : 'Blog'}
        <span aria-hidden="true" className="text-ochre">/</span>
        <time dateTime={post.publishedAt}>{date}</time>
      </p>
      <Link href={`/blog/${post.slug}`} className="post-title-link block">
        <Heading className={`mb-3 font-display leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-wine ${featured ? 'text-3xl lg:text-4xl' : 'text-2xl'}`}>{post.title}</Heading>
        <p className="text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className="post-read-more mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-wine transition-all duration-300 group-hover:gap-4">
          Continua a leggere <span aria-hidden="true">↗</span>
        </span>
      </Link>
      </div>
    </article>
  )
}

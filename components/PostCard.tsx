import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity/image'
import CropFrame from './CropFrame'
import type { PostSummary } from '@/lib/sanity/queries'

const gradients = [
  'from-[#8B6B35] to-[#5E1B26]',
  'from-[#4A4038] to-[#211C18]',
  'from-[#A9812F] to-[#3F1219]',
]

export default function PostCard({ post, index = 0 }: { post: PostSummary; index?: number }) {
  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className={`relative mb-5 aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]}`}
        >
          <CropFrame />
          {post.coverImage && (
            <Image
              src={urlForImage(post.coverImage).width(700).height(525).url()}
              alt={post.coverImage.alt || post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
        </div>
      </Link>

      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ochre">
        {post.category ? (
          <Link href={`/categoria/${post.category.slug}`} className="nav-link hover:text-wine transition-colors">
            {post.category.title}
          </Link>
        ) : (
          'Blog'
        )}
        <span className="text-line"> - </span>
        {date}
      </p>

      <Link href={`/blog/${post.slug}`} className="block">
        <h3 className="mb-2 font-display text-xl leading-snug transition-colors group-hover:text-wine">
          {post.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-ink-soft">{post.excerpt}</p>
      </Link>
    </div>
  )
}

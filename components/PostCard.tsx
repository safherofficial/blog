import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity/image'
import type { PostSummary } from '@/lib/sanity/queries'

const gradients = [
  'from-[#C79A6B] to-[#7A2E3A]',
  'from-[#8A9A82] to-[#2B2420]',
  'from-[#B8874A] to-[#5C222B]',
]

export default function PostCard({ post, index = 0 }: { post: PostSummary; index?: number }) {
  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className={`relative mb-4 aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]}`}>
        {post.coverImage && (
          <Image
            src={urlForImage(post.coverImage).width(700).height(525).url()}
            alt={post.coverImage.alt || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-sage">
        {post.category?.title || 'Blog'} · {date}
      </p>
      <h3 className="mb-2 font-display text-xl leading-snug">{post.title}</h3>
      <p className="text-[15px] text-ink-soft">{post.excerpt}</p>
    </Link>
  )
}

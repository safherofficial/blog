import Link from 'next/link'
import type { PostSummary } from '@/lib/db'
import { getCategoryEditorialInfo } from '@/lib/seo/categories'

function Item({ post, label, align }: { post: PostSummary; label: string; align: 'left' | 'right' }) {
  const publishedDate = new Date(post.publishedAt)
  const dateLabel = Number.isNaN(publishedDate.getTime())
    ? null
    : publishedDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const categoryLabel = post.category
    ? getCategoryEditorialInfo(post.category.slug, post.category.title).label
    : 'Dal diario'

  return (
    <Link
      href={`/blog/${post.slug}`}
      aria-label={`${label}: ${post.title}`}
      className={`post-nav-item group flex min-w-0 flex-col gap-3 border border-line p-6 transition-colors hover:border-ochre hover:bg-bg-soft/50 focus-visible:border-ochre ${align === 'right' ? 'text-right sm:items-end' : ''}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ochre">
        {align === 'left' ? '← ' : ''}{label}{align === 'right' ? ' →' : ''}
      </span>
      <span className="font-display text-xl leading-snug transition-colors group-hover:text-wine">
        {post.title}
      </span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] uppercase tracking-[0.13em] text-ink-soft">
        <span>{categoryLabel}</span>
        {dateLabel && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{dateLabel}</time>
          </>
        )}
      </span>
    </Link>
  )
}

/** Navigazione cronologica: il più recente a sinistra, il più vecchio a destra. */
export default function PostNav({ newer, older }: { newer: PostSummary | null; older: PostSummary | null }) {
  if (!newer && !older) return null
  return (
    <nav aria-label="Navigazione cronologica tra gli articoli" className="grid gap-4 sm:grid-cols-2">
      {newer ? <Item post={newer} label="Più recente" align="left" /> : <span aria-hidden="true" />}
      {older ? <Item post={older} label="Più vecchio" align="right" /> : <span aria-hidden="true" />}
    </nav>
  )
}

import Link from 'next/link'
import type { PostSummary } from '@/lib/db'

function Item({ post, label, align }: { post: PostSummary; label: string; align: 'left' | 'right' }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`post-nav-item group flex flex-col gap-2 border border-line p-6 transition-colors hover:border-ochre ${align === 'right' ? 'text-right sm:items-end' : ''}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ochre">{align === 'left' ? '← ' : ''}{label}{align === 'right' ? ' →' : ''}</span>
      <span className="font-display text-xl leading-snug transition-colors group-hover:text-wine">{post.title}</span>
    </Link>
  )
}

/** Navigazione tra articoli adiacenti: il più recente a sinistra, il più vecchio a destra. */
export default function PostNav({ newer, older }: { newer: PostSummary | null; older: PostSummary | null }) {
  if (!newer && !older) return null
  return (
    <nav aria-label="Altri articoli" className="grid gap-4 sm:grid-cols-2">
      {newer ? <Item post={newer} label="Più recente" align="left" /> : <span />}
      {older ? <Item post={older} label="Più vecchio" align="right" /> : <span />}
    </nav>
  )
}

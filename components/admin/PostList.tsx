'use client'

import { useMemo, useState } from 'react'
import { portableTextToEditorText } from '@/lib/content/editor'
import { analyzePost, countBySeverity } from '@/lib/seo/post-analyzer'
import { postStatus, STATUS_LABEL, type Post, type PostStatus } from './types'
import { ScoreBadge, inputClass, primaryButton } from './ui'

type Filter = 'all' | PostStatus

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Tutti' },
  { id: 'published', label: 'Pubblicati' },
  { id: 'scheduled', label: 'Programmati' },
  { id: 'draft', label: 'Bozze' },
]

const STATUS_TONE: Record<PostStatus, string> = {
  published: 'text-emerald-800',
  scheduled: 'text-sky-800',
  draft: 'text-ink-soft',
}

export default function PostList({ posts, selectedId, onSelect }: { posts: Post[]; selectedId: string | null; onSelect: (post: Post | null) => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // Punteggio SEO calcolato in locale con lo stesso motore dell'editor.
  const rows = useMemo(() => {
    const others = posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, seoTitle: p.seo_title, seoDescription: p.seo_description }))
    return posts.map((post) => {
      const result = analyzePost({
        id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt,
        coverImageUrl: post.cover_image_url || '', coverImageAlt: post.cover_image_alt || '',
        categoryId: post.category_id || '', publishedAt: post.published_at, published: post.published,
        seoTitle: post.seo_title || '', seoDescription: post.seo_description || '',
        bodyText: portableTextToEditorText(post.body),
      }, { others })
      return { post, status: postStatus(post), score: result.score, errors: countBySeverity(result.issues).error }
    })
  }, [posts])

  const visible = rows.filter(({ post, status }) => {
    if (filter !== 'all' && status !== filter) return false
    const q = query.trim().toLowerCase()
    return !q || post.title.toLowerCase().includes(q) || post.slug.includes(q)
  })

  return (
    <aside className="border border-line bg-white p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
      <button type="button" onClick={() => onSelect(null)} className={`${primaryButton} mb-4 w-full`}>+ Nuovo articolo</button>
      <input type="search" aria-label="Cerca articoli" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per titolo…" className={`${inputClass} mb-3`} />
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtra per stato">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${filter === f.id ? 'border-wine bg-wine text-white' : 'border-line text-ink-soft hover:bg-bg-soft'}`}>
            {f.label}{f.id === 'all' ? ` ${rows.length}` : ` ${rows.filter((r) => r.status === f.id).length}`}
          </button>
        ))}
      </div>
      <ul>
        {visible.map(({ post, status, score, errors }) => (
          <li key={post.id}>
            <button type="button" onClick={() => onSelect(post)} aria-current={selectedId === post.id} className={`block w-full border-b border-line p-3 text-left hover:bg-bg-soft ${selectedId === post.id ? 'bg-bg-soft' : ''}`}>
              <span className="flex items-start justify-between gap-3">
                <span className="font-display text-lg leading-snug">{post.title || 'Senza titolo'}</span>
                <ScoreBadge score={score} />
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink-soft">
                <span className={STATUS_TONE[status]}>{STATUS_LABEL[status]}</span>
                <span>· {post.category_title || 'Senza categoria'}</span>
                {errors > 0 && status !== 'draft' && <span className="text-red-800">· {errors} da correggere</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="p-3 text-sm text-ink-soft">{rows.length === 0 ? 'Non ci sono ancora articoli. Inizia dal pulsante in alto.' : 'Nessun articolo corrisponde ai filtri.'}</p>}
    </aside>
  )
}

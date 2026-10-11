'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/content/article'

/** Indice dell'articolo: laterale con evidenziazione della sezione letta, oppure a comparsa su schermi piccoli. */
export default function ArticleToc({ items, variant }: { items: Heading[]; variant: 'side' | 'inline' }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    if (variant !== 'side' || items.length === 0) return
    const elements = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el))
    const visible = new Set<string>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      const first = elements.find((el) => visible.has(el.id))
      if (first) setActive(first.id)
    }, { rootMargin: '-80px 0px -60% 0px' })
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items, variant])

  const list = (
    <ol className="space-y-1">
      {items.map((item, index) => (
        <li key={item.id}>
          <a href={`#${item.id}`} aria-current={active === item.id && variant === 'side' ? 'location' : undefined} className="toc-link">
            <span className="toc-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span>{item.text}</span>
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === 'inline') {
    return (
      <details className="toc-inline mb-10 border border-line bg-bg-soft/60 px-5 py-4">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">In questo articolo</summary>
        <nav aria-label="Indice dell’articolo" className="mt-4">{list}</nav>
      </details>
    )
  }
  return (
    <nav aria-label="Indice dell’articolo" className="toc-side">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">In questo articolo</p>
      {list}
    </nav>
  )
}

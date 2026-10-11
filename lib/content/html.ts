import type { PortableTextBlock } from '@/lib/db'

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Serializzazione minimale e sicura del corpo articolo, per feed RSS e consumo da parte di lettori/AI. */
export function portableTextToHtml(body: PortableTextBlock[] | null | undefined): string {
  return (body || [])
    .map((block) => {
      if (block._type === 'image' && block.url?.startsWith('https://')) {
        return `<figure><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || '')}" /></figure>`
      }
      if (block._type !== 'block') return ''
      const text = escapeHtml((block.children || []).map((child) => child.text).join(''))
      if (!text.trim()) return ''
      if (block.style === 'h2') return `<h2>${text}</h2>`
      if (block.style === 'blockquote') return `<blockquote><p>${text}</p></blockquote>`
      return `<p>${text}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

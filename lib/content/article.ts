import type { PortableTextBlock } from '@/lib/db'
import { countWords, slugify } from '@/lib/seo/text'

export type Heading = { key: string; id: string; text: string }

const blockText = (block: PortableTextBlock): string => (block.children || []).map((child) => child.text).join('')

/** Sottotitoli (H2) con id univoci e stabili, usati per indice, ancore e scroll-spy. */
export function getHeadings(body: PortableTextBlock[] | null | undefined): Heading[] {
  const used = new Map<string, number>()
  const headings: Heading[] = []
  for (const block of body || []) {
    if (block._type !== 'block' || block.style !== 'h2') continue
    const text = blockText(block).trim()
    if (!text) continue
    const base = slugify(text, 60) || 'sezione'
    const count = (used.get(base) || 0) + 1
    used.set(base, count)
    headings.push({ key: block._key, id: count > 1 ? `${base}-${count}` : base, text })
  }
  return headings
}

export function bodyWordCount(body: PortableTextBlock[] | null | undefined): number {
  return (body || []).filter((b) => b._type === 'block').reduce((sum, b) => sum + countWords(blockText(b)), 0)
}

export function readingMinutes(body: PortableTextBlock[] | null | undefined): number {
  return Math.max(1, Math.round(bodyWordCount(body) / 200))
}

/** Prima porzione di testo della biografia, tagliata a fine frase quando possibile. */
export function shortText(body: PortableTextBlock[] | null | undefined, max = 220): string {
  const first = (body || []).filter((b) => b._type === 'block').map(blockText).find((t) => t.trim()) || ''
  if (first.length <= max) return first.trim()
  const cut = first.slice(0, max)
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
  return (sentence > 80 ? cut.slice(0, sentence + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…').trim()
}

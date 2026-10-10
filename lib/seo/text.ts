/** Utility testuali pure, condivise da editor (browser) e audit (server). */

/** Minuscolo e senza accenti, per confronti tolleranti. */
export const norm = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function slugify(input: string, max = 60): string {
  const base = norm(input).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (base.length <= max) return base
  const cut = base.slice(0, max)
  const lastDash = cut.lastIndexOf('-')
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, '')
}

export function countWords(text: string): number {
  const match = text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g)
  return match ? match.length : 0
}

export type EditorBlock = { type: 'p' | 'h2' | 'quote' | 'image'; text: string; url?: string }

/** Rispecchia editorTextToPortableText senza generare chiavi: serve solo all'analisi. */
export function parseEditorText(input: string): EditorBlock[] {
  const blocks: EditorBlock[] = []
  let paragraph: string[] = []
  const flush = () => {
    const text = paragraph.join(' ').trim()
    if (text) blocks.push({ type: 'p', text })
    paragraph = []
  }
  for (const raw of input.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    if (line.startsWith('## ')) { flush(); blocks.push({ type: 'h2', text: line.slice(3).trim() }); continue }
    if (line.startsWith('> ')) { flush(); blocks.push({ type: 'quote', text: line.slice(2).trim() }); continue }
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/)
    if (image) { flush(); blocks.push({ type: 'image', text: image[1], url: image[2] }); continue }
    paragraph.push(line)
  }
  flush()
  return blocks
}

export function countOccurrences(haystackNorm: string, keywordNorm: string): number {
  if (!keywordNorm) return 0
  const pattern = new RegExp(`(?<![a-z0-9])${escapeRegExp(keywordNorm)}(?![a-z0-9])`, 'g')
  return (haystackNorm.match(pattern) || []).length
}

import type { PortableTextBlock } from '@/lib/db'

const makeKey = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function decodeStoredValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed || (trimmed[0] !== '[' && trimmed[0] !== '{')) return value

  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    // Older rows may contain plain editor text or malformed JSON strings.
    // Preserve the text instead of allowing the editor or SEO audit to crash.
    return value
  }
}

function extractBlocks(value: unknown): unknown[] {
  const decoded = decodeStoredValue(value)
  if (Array.isArray(decoded)) return decoded
  if (!isRecord(decoded)) return []

  for (const key of ['blocks', 'content', 'body', 'value', 'author_bio', 'authorBio']) {
    if (Array.isArray(decoded[key])) return decoded[key] as unknown[]
  }

  const type = decoded._type ?? decoded.type
  if (type === 'block' || type === 'image' || type === 'paragraph' || type === 'heading' || type === 'blockquote') {
    return [decoded]
  }

  if (Array.isArray(decoded.children)) {
    const children = decoded.children
    const isInlineText = children.every((child) =>
      typeof child === 'string' || (isRecord(child) && typeof child.text === 'string'),
    )
    return isInlineText ? [decoded] : children
  }

  if (typeof decoded.text === 'string') return [decoded]
  return []
}

function textFromUnknownBlock(block: unknown): string {
  if (typeof block === 'string') return block
  if (!isRecord(block)) return ''

  if (Array.isArray(block.children)) {
    return block.children.map((child) => {
      if (typeof child === 'string') return child
      return isRecord(child) && typeof child.text === 'string' ? child.text : ''
    }).join('')
  }

  if (typeof block.text === 'string') return block.text
  if (typeof block.value === 'string') return block.value
  return ''
}

export function editorTextToPortableText(input: string): PortableTextBlock[] {
  const lines = input.replace(/\r\n/g, '\n').split('\n')
  const blocks: PortableTextBlock[] = []
  let paragraph: string[] = []

  const flush = () => {
    const text = paragraph.join(' ').trim()
    if (!text) { paragraph = []; return }
    blocks.push({
      _key: makeKey(), _type: 'block', style: 'normal', markDefs: [],
      children: [{ _key: makeKey(), _type: 'span', text, marks: [] }],
    })
    paragraph = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    if (line.startsWith('## ')) { flush(); blocks.push({ _key: makeKey(), _type: 'block', style: 'h2', markDefs: [], children: [{ _key: makeKey(), _type: 'span', text: line.slice(3).trim(), marks: [] }] }); continue }
    if (line.startsWith('> ')) { flush(); blocks.push({ _key: makeKey(), _type: 'block', style: 'blockquote', markDefs: [], children: [{ _key: makeKey(), _type: 'span', text: line.slice(2).trim(), marks: [] }] }); continue }
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/)
    if (image) { flush(); blocks.push({ _key: makeKey(), _type: 'image', url: image[2], alt: image[1] || '' }); continue }
    paragraph.push(line)
  }
  flush()
  return blocks
}

/**
 * Reads the current Portable Text array as well as older JSON strings and
 * legacy object wrappers. Database JSONB values are not guaranteed to arrive
 * in the same shape for every historic row.
 */
export function portableTextToEditorText(value: unknown): string {
  const decoded = decodeStoredValue(value)
  if (typeof decoded === 'string') return decoded

  return extractBlocks(decoded).map((block) => {
    if (!isRecord(block)) return textFromUnknownBlock(block)

    const type = block._type ?? block.type
    if (type === 'image') {
      const asset = isRecord(block.asset) ? block.asset : null
      const url = typeof block.url === 'string'
        ? block.url
        : typeof block.src === 'string'
          ? block.src
          : typeof asset?.url === 'string' ? asset.url : ''
      const alt = typeof block.alt === 'string' ? block.alt : ''
      return url ? `![${alt}](${url})` : alt
    }

    const text = textFromUnknownBlock(block)
    const style = typeof block.style === 'string' ? block.style : type
    if (style === 'h2' || style === 'heading') return `## ${text}`
    if (style === 'blockquote' || style === 'quote') return `> ${text}`
    return text
  }).filter(Boolean).join('\n\n')
}

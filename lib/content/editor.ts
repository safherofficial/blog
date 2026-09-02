import type { PortableTextBlock } from '@/lib/db'

const makeKey = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const textFromBlock = (block: PortableTextBlock) => (block.children || []).map((child) => child.text).join('')

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

export function portableTextToEditorText(value: PortableTextBlock[] | null | undefined): string {
  return (value || []).map((block) => {
    if (block._type === 'image') return `![${block.alt || ''}](${block.url || ''})`
    const text = textFromBlock(block)
    if (block.style === 'h2') return `## ${text}`
    if (block.style === 'blockquote') return `> ${text}`
    return text
  }).join('\n\n')
}

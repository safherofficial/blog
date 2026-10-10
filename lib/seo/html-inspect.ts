/** Estrazione leggera dei fatti SEO da una stringa HTML, senza dipendenze. */

export type PageFacts = {
  title: string | null
  description: string | null
  canonical: string | null
  robots: string | null
  lang: string | null
  h1Count: number
  ogTitle: string | null
  ogImage: string | null
  imgTotal: number
  imgMissingAlt: number
  jsonLdCount: number
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
}

function attrs(tag: string): Record<string, string> {
  const result: Record<string, string> = {}
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(tag))) result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? '')
  return result
}

export function inspectHtml(html: string): PageFacts {
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const facts: PageFacts = {
    title: title ? decode(title) : null,
    description: null,
    canonical: null,
    robots: null,
    lang: html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']*)["']/i)?.[1] ?? null,
    h1Count: (html.match(/<h1\b/gi) || []).length,
    ogTitle: null,
    ogImage: null,
    imgTotal: 0,
    imgMissingAlt: 0,
    jsonLdCount: (html.match(/application\/ld\+json/gi) || []).length,
  }

  for (const tag of head.match(/<meta\b[^>]*>/gi) || []) {
    const a = attrs(tag)
    const key = (a.name || a.property || '').toLowerCase()
    if (key === 'description') facts.description = a.content ?? ''
    else if (key === 'robots') facts.robots = a.content ?? ''
    else if (key === 'og:title') facts.ogTitle = a.content ?? ''
    else if (key === 'og:image') facts.ogImage = a.content ?? ''
  }
  for (const tag of head.match(/<link\b[^>]*>/gi) || []) {
    const a = attrs(tag)
    if ((a.rel || '').toLowerCase() === 'canonical') facts.canonical = a.href ?? ''
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    facts.imgTotal += 1
    if (!/\balt\s*=/i.test(tag)) facts.imgMissingAlt += 1
  }
  return facts
}

import { editorTextToPortableText } from '@/lib/content/editor'

export type NormalizedPostInput = {
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string | null
  coverImageAlt: string | null
  categoryId: string | null
  publishedAt: string
  published: boolean
  body: ReturnType<typeof editorTextToPortableText>
  seoTitle: string | null
  seoDescription: string | null
}

type ValidationResult = { value: NormalizedPostInput } | { error: string }

function optionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function validHttpsUrl(value: string | null): boolean {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validatePostInput(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Dati articolo non validi.' }
  }

  const data = input as Record<string, unknown>
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const slug = typeof data.slug === 'string' ? data.slug.trim().toLowerCase() : ''
  const excerpt = typeof data.excerpt === 'string' ? data.excerpt.trim() : ''

  if (!title || !slug || !excerpt) {
    return { error: 'Titolo, slug e anteprima sono obbligatori.' }
  }
  if (title.length > 180) return { error: 'Il titolo non può superare 180 caratteri.' }
  if (excerpt.length > 220) return { error: 'L’anteprima non può superare 220 caratteri.' }
  if (slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: 'Lo slug deve contenere solo lettere minuscole, numeri e trattini.' }
  }

  const coverImageUrl = optionalText(data.coverImageUrl, 2048)
  const coverImageAlt = optionalText(data.coverImageAlt, 300)
  const categoryId = optionalText(data.categoryId, 80)
  if (!validHttpsUrl(coverImageUrl)) return { error: 'L’immagine di copertina deve usare un URL HTTPS valido.' }
  if (categoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(categoryId)) {
    return { error: 'La categoria selezionata non è valida.' }
  }

  const publishedAtInput = typeof data.publishedAt === 'string' && data.publishedAt.trim()
    ? data.publishedAt.trim()
    : new Date().toISOString()
  const publishedAt = new Date(publishedAtInput)
  if (Number.isNaN(publishedAt.getTime())) return { error: 'Data di pubblicazione non valida.' }

  const bodyText = typeof data.bodyText === 'string' ? data.bodyText : ''
  if (bodyText.length > 150_000) return { error: 'Il contenuto supera il limite consentito.' }

  return {
    value: {
      title,
      slug,
      excerpt,
      coverImageUrl,
      coverImageAlt,
      categoryId,
      publishedAt: publishedAt.toISOString(),
      published: data.published === true,
      body: editorTextToPortableText(bodyText),
      seoTitle: optionalText(data.seoTitle, 180),
      seoDescription: optionalText(data.seoDescription, 320),
    },
  }
}

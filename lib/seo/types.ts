export type Severity = 'error' | 'warning' | 'info' | 'good'

export type IssueCategory =
  | 'title'
  | 'description'
  | 'url'
  | 'content'
  | 'images'
  | 'keyword'
  | 'indexing'
  | 'readability'
  | 'site'
  | 'technical'

/** Campi dell'editor a cui un problema può rimandare (id DOM = `post-${field}`). */
export type PostField =
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'seoTitle'
  | 'seoDescription'
  | 'coverImageUrl'
  | 'coverImageAlt'
  | 'categoryId'
  | 'publishedAt'
  | 'bodyText'
  | 'focusKeyword'

export type SeoIssue = {
  id: string
  severity: Severity
  category: IssueCategory
  message: string
  hint?: string
  field?: PostField
}

export type PostDraft = {
  id?: string | null
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string
  coverImageAlt: string
  categoryId: string
  /** ISO 8601; stringa vuota se non valorizzata. */
  publishedAt: string
  published: boolean
  seoTitle: string
  seoDescription: string
  bodyText: string
  /** Solo per l'analisi: non viene salvata nel database. */
  focusKeyword?: string
}

export type OtherPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  seoTitle?: string | null
  seoDescription?: string | null
}

export type AnalysisContext = {
  others: OtherPost[]
  /** Slug con cui l'articolo è stato salvato l'ultima volta. */
  originalSlug?: string | null
  /** L'articolo era già pubblico prima di questa modifica. */
  wasPublished?: boolean
  now?: number
}

export type AnalysisStats = {
  words: number
  readingMinutes: number
  h2: number
  images: number
  titleLength: number
  descriptionLength: number
}

export type AnalysisResult = {
  score: number
  issues: SeoIssue[]
  stats: AnalysisStats
}

export function scoreLabel(score: number): 'Ottimo' | 'Da migliorare' | 'Critico' {
  if (score >= 85) return 'Ottimo'
  if (score >= 60) return 'Da migliorare'
  return 'Critico'
}

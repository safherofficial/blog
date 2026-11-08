const UPLOADED_COVER_PATH = /^\/api\/media\/covers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidCoverImageUrl(value: string): boolean {
  const url = value.trim()
  if (!url) return false
  if (UPLOADED_COVER_PATH.test(url)) return true
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

export function imageUrl(source: { url?: string } | null | undefined): string | null {
  return source?.url || null
}

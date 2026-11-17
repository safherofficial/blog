const UPLOADED_COVER_PATH = /^\/(?:api\/)?media\/covers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Existing rows still store /api/media/covers URLs; expose them through the crawlable public route. */
export function publicImageUrl(value: string): string {
  return value.trim().replace(/^\/api\/media\/covers\//i, '/media/covers/')
}

export function isUploadedCoverImageUrl(value: string): boolean {
  return UPLOADED_COVER_PATH.test(value.trim())
}

export function isValidCoverImageUrl(value: string): boolean {
  const url = value.trim()
  if (!url) return false
  if (isUploadedCoverImageUrl(url)) return true
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

export function imageUrl(source: { url?: string } | null | undefined): string | null {
  return source?.url ? publicImageUrl(source.url) : null
}

export function imageUrl(source: { url?: string } | null | undefined): string | null {
  return source?.url || null
}

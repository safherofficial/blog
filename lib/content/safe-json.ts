/** Safely embed JSON-LD in a script element without allowing a value to close the tag. */
export function safeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value) ?? 'null'
  return serialized.replace(/</g, '\\u003c')
}

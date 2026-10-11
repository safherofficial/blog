import { getIndexNowKey } from '@/lib/seo/indexnow'

export const dynamic = 'force-dynamic'

/** File di verifica IndexNow: contiene la chiave impostata in INDEXNOW_KEY. */
export async function GET() {
  const key = getIndexNowKey()
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}

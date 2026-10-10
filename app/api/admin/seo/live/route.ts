import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { runLiveCheck } from '@/lib/seo/live-check'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FALLBACK_SITE_URL = 'https://www.controluce-blog.it'

/** Scansiona il sito pubblicato come farebbe un crawler. Solo same-origin: nessun URL arriva dal client. */
export async function POST(request: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  try {
    const [posts, categories] = await Promise.all([
      sql`SELECT slug FROM posts WHERE published = TRUE AND published_at <= NOW() ORDER BY published_at DESC`,
      sql`SELECT slug FROM categories ORDER BY title`,
    ])
    const result = await runLiveCheck({
      origin: new URL(request.url).origin,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL,
      postSlugs: posts.rows.map((r) => r.slug as string),
      categorySlugs: categories.rows.map((r) => r.slug as string),
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Impossibile completare la scansione del sito.' }, { status: 500 })
  }
}

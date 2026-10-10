import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { validatePostInput } from '@/lib/content/post-input'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`SELECT * FROM posts WHERE id = ${params.id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  const data = await request.json().catch(() => null)
  const parsed = validatePostInput(data)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const post = parsed.value

  try {
    const { rowCount } = await sql`
      UPDATE posts SET
        title = ${post.title}, slug = ${post.slug}, excerpt = ${post.excerpt},
        cover_image_url = ${post.coverImageUrl}, cover_image_alt = ${post.coverImageAlt},
        category_id = ${post.categoryId}, published_at = ${post.publishedAt},
        published = ${post.published}, body = ${JSON.stringify(post.body)}::jsonb,
        seo_title = ${post.seoTitle}, seo_description = ${post.seoDescription}
      WHERE id = ${params.id}
    `
    if (!rowCount) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'Slug già utilizzato.' }, { status: 409 })
    return NextResponse.json({ error: 'Impossibile aggiornare l’articolo.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rowCount } = await sql`DELETE FROM posts WHERE id = ${params.id}`
  if (!rowCount) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

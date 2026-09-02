import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { editorTextToPortableText } from '@/lib/content/editor'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`SELECT * FROM posts WHERE id = ${params.id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const data = await request.json().catch(() => null)
  if (!data?.title || !data?.slug || !data?.excerpt) return NextResponse.json({ error: 'Titolo, slug e anteprima sono obbligatori.' }, { status: 400 })
  const body = Array.isArray(data.body) ? data.body : editorTextToPortableText(String(data.bodyText || ''))
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date()
  if (Number.isNaN(publishedAt.getTime())) return NextResponse.json({ error: 'Data di pubblicazione non valida.' }, { status: 400 })
  try {
    const { rowCount } = await sql`
      UPDATE posts SET title=${data.title.trim()}, slug=${data.slug.trim()}, excerpt=${data.excerpt.trim()},
      cover_image_url=${data.coverImageUrl || null}, cover_image_alt=${data.coverImageAlt || null}, category_id=${data.categoryId || null},
      published_at=${publishedAt.toISOString()}, published=${data.published !== false}, body=${JSON.stringify(body)}::jsonb,
      seo_title=${data.seoTitle || null}, seo_description=${data.seoDescription || null}
      WHERE id=${params.id}
    `
    if (!rowCount) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.code === '23505' ? 'Slug già utilizzato.' : 'Impossibile aggiornare l’articolo.' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  await sql`DELETE FROM posts WHERE id=${params.id}`
  return NextResponse.json({ ok: true })
}

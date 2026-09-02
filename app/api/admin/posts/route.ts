import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { editorTextToPortableText } from '@/lib/content/editor'

export async function GET() {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`
    SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.cover_image_alt,
           p.category_id, p.published_at, p.published, p.body, p.seo_title, p.seo_description,
           c.title AS category_title
    FROM posts p LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.published_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const data = await request.json().catch(() => null)
  if (!data?.title || !data?.slug || !data?.excerpt) return NextResponse.json({ error: 'Titolo, slug e anteprima sono obbligatori.' }, { status: 400 })

  const body = Array.isArray(data.body) ? data.body : editorTextToPortableText(String(data.bodyText || ''))
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date()
  if (Number.isNaN(publishedAt.getTime())) return NextResponse.json({ error: 'Data di pubblicazione non valida.' }, { status: 400 })

  try {
    const { rows } = await sql`
      INSERT INTO posts (title, slug, excerpt, cover_image_url, cover_image_alt, category_id, published_at, published, body, seo_title, seo_description)
      VALUES (${data.title.trim()}, ${data.slug.trim()}, ${data.excerpt.trim()}, ${data.coverImageUrl || null}, ${data.coverImageAlt || null}, ${data.categoryId || null}, ${publishedAt.toISOString()}, ${data.published !== false}, ${JSON.stringify(body)}::jsonb, ${data.seoTitle || null}, ${data.seoDescription || null})
      RETURNING id
    `
    return NextResponse.json({ id: rows[0].id }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.code === '23505' ? 'Slug già utilizzato.' : 'Impossibile creare l’articolo.' }, { status: 400 })
  }
}

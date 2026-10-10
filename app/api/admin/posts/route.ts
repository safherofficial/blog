import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { validatePostInput } from '@/lib/content/post-input'

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
  const parsed = validatePostInput(data)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const post = parsed.value

  try {
    const { rows } = await sql`
      INSERT INTO posts (
        title, slug, excerpt, cover_image_url, cover_image_alt, category_id,
        published_at, published, body, seo_title, seo_description
      )
      VALUES (
        ${post.title}, ${post.slug}, ${post.excerpt}, ${post.coverImageUrl}, ${post.coverImageAlt},
        ${post.categoryId}, ${post.publishedAt}, ${post.published}, ${JSON.stringify(post.body)}::jsonb,
        ${post.seoTitle}, ${post.seoDescription}
      )
      RETURNING id
    `
    return NextResponse.json({ id: rows[0].id }, { status: 201 })
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'Slug già utilizzato.' }, { status: 409 })
    return NextResponse.json({ error: 'Impossibile creare l’articolo.' }, { status: 500 })
  }
}

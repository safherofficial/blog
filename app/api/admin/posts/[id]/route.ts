import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { validatePostInput } from '@/lib/content/post-input'
import { isPubliclyLive, pingIndexNow, postChangePaths } from '@/lib/seo/indexnow'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  const data = await request.json().catch(() => null)
  const parsed = validatePostInput(data)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const post = parsed.value

  try {
    const before = (await sql`SELECT slug, published, published_at FROM posts WHERE id = ${id} LIMIT 1`).rows[0]
    const { rowCount } = await sql`
      UPDATE posts SET
        title = ${post.title}, slug = ${post.slug}, excerpt = ${post.excerpt},
        cover_image_url = ${post.coverImageUrl}, cover_image_alt = ${post.coverImageAlt},
        category_id = ${post.categoryId}, published_at = ${post.publishedAt},
        published = ${post.published}, body = ${JSON.stringify(post.body)}::jsonb,
        seo_title = ${post.seoTitle}, seo_description = ${post.seoDescription}
      WHERE id = ${id}
    `
    if (!rowCount) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
    await pingIndexNow(postChangePaths({
      slug: post.slug,
      live: isPubliclyLive(post.published, post.publishedAt),
      previous: before ? { slug: before.slug as string, live: isPubliclyLive(before.published as boolean, before.published_at as string) } : null,
    }))
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'Slug già utilizzato.' }, { status: 409 })
    return NextResponse.json({ error: 'Impossibile aggiornare l’articolo.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const before = (await sql`SELECT slug, published, published_at FROM posts WHERE id = ${id} LIMIT 1`).rows[0]
  const { rowCount } = await sql`DELETE FROM posts WHERE id = ${id}`
  if (!rowCount) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 })
  // L'indirizzo rimosso risponderà 404: lo segnaliamo perché venga tolto dagli indici.
  if (before) {
    await pingIndexNow(postChangePaths({ slug: before.slug as string, live: false, previous: { slug: before.slug as string, live: isPubliclyLive(before.published as boolean, before.published_at as string) } }))
  }
  return NextResponse.json({ ok: true })
}

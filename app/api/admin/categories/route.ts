import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'

export async function GET() {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`SELECT id, title, slug FROM categories ORDER BY title`
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const data = await request.json().catch(() => null)
  const title = typeof data?.title === 'string' ? data.title.trim() : ''
  const slug = typeof data?.slug === 'string' ? data.slug.trim().toLowerCase() : ''
  if (!title || !slug) return NextResponse.json({ error: 'Nome e slug sono obbligatori.' }, { status: 400 })
  if (title.length > 100) return NextResponse.json({ error: 'Il nome della categoria non può superare 100 caratteri.' }, { status: 400 })
  if (slug.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Lo slug deve contenere solo lettere minuscole, numeri e trattini.' }, { status: 400 })
  }

  try {
    const { rows } = await sql`INSERT INTO categories (title, slug) VALUES (${title}, ${slug}) RETURNING id, title, slug`
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'Slug già utilizzato.' }, { status: 409 })
    return NextResponse.json({ error: 'Impossibile creare la categoria.' }, { status: 500 })
  }
}

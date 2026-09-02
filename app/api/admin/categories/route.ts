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
  const { title, slug } = await request.json().catch(() => ({}))
  if (!title || !slug) return NextResponse.json({ error: 'Nome e slug sono obbligatori.' }, { status: 400 })
  try {
    const { rows } = await sql`INSERT INTO categories (title, slug) VALUES (${title.trim()}, ${slug.trim()}) RETURNING id, title, slug`
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.code === '23505' ? 'Slug già utilizzato.' : 'Impossibile creare la categoria.' }, { status: 400 })
  }
}

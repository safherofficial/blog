import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { editorTextToPortableText } from '@/lib/content/editor'

export async function GET() {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`SELECT * FROM site_settings WHERE id=1 LIMIT 1`
  return NextResponse.json(rows[0] || null)
}

export async function PUT(request: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const data = await request.json().catch(() => ({}))
  const bio = Array.isArray(data.authorBio) ? data.authorBio : editorTextToPortableText(String(data.authorBioText || ''))
  await sql`
    INSERT INTO site_settings (id, site_title, tagline, author_name, author_bio, author_photo_url, author_photo_alt, instagram_url, signature_quote)
    VALUES (1, ${data.siteTitle || 'Controluce'}, ${data.tagline || null}, ${data.authorName || null}, ${JSON.stringify(bio)}::jsonb,
            ${data.authorPhotoUrl || null}, ${data.authorPhotoAlt || null}, ${data.instagramUrl || null}, ${data.signatureQuote || null})
    ON CONFLICT (id) DO UPDATE SET site_title=EXCLUDED.site_title, tagline=EXCLUDED.tagline, author_name=EXCLUDED.author_name,
      author_bio=EXCLUDED.author_bio, author_photo_url=EXCLUDED.author_photo_url, author_photo_alt=EXCLUDED.author_photo_alt,
      instagram_url=EXCLUDED.instagram_url, signature_quote=EXCLUDED.signature_quote
  `
  return NextResponse.json({ ok: true })
}

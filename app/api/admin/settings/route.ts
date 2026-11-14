import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { editorTextToPortableText } from '@/lib/content/editor'

function optionalHttpsUrl(value: unknown): string | null | false {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url.toString() : false
  } catch {
    return false
  }
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const result = value.trim()
  return result ? result.slice(0, max) : null
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const { rows } = await sql`SELECT * FROM site_settings WHERE id=1 LIMIT 1`
  return NextResponse.json(rows[0] || null)
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  const data = await request.json().catch(() => null)
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Impostazioni non valide.' }, { status: 400 })
  }

  const authorPhotoUrl = optionalHttpsUrl(data.authorPhotoUrl)
  const instagramUrl = optionalHttpsUrl(data.instagramUrl)
  if (authorPhotoUrl === false) return NextResponse.json({ error: 'La foto profilo deve usare un URL HTTPS valido.' }, { status: 400 })
  if (instagramUrl === false) return NextResponse.json({ error: 'Instagram deve essere un URL HTTPS valido.' }, { status: 400 })

  const authorBioText = typeof data.authorBioText === 'string' ? data.authorBioText : ''
  if (authorBioText.length > 20000) return NextResponse.json({ error: 'La biografia supera il limite consentito.' }, { status: 400 })
  const bio = editorTextToPortableText(authorBioText)

  try {
    await sql`
      INSERT INTO site_settings (id, site_title, tagline, author_name, author_bio, author_photo_url, author_photo_alt, instagram_url, signature_quote)
      VALUES (
        1, ${text(data.siteTitle, 120) || 'Controluce'}, ${text(data.tagline, 300)}, ${text(data.authorName, 120)},
        ${JSON.stringify(bio)}::jsonb, ${authorPhotoUrl}, ${text(data.authorPhotoAlt, 300)},
        ${instagramUrl}, ${text(data.signatureQuote, 1000)}
      )
      ON CONFLICT (id) DO UPDATE SET
        site_title=EXCLUDED.site_title, tagline=EXCLUDED.tagline, author_name=EXCLUDED.author_name,
        author_bio=EXCLUDED.author_bio, author_photo_url=EXCLUDED.author_photo_url,
        author_photo_alt=EXCLUDED.author_photo_alt, instagram_url=EXCLUDED.instagram_url,
        signature_quote=EXCLUDED.signature_quote
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Impossibile salvare le impostazioni.' }, { status: 500 })
  }
}

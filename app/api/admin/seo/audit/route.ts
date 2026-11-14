import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { getIndexNowKey } from '@/lib/seo/indexnow'
import { FALLBACK_SITE_URL } from '@/lib/seo/site'
import { auditSite, type AuditPostRow, type AuditSettingsRow } from '@/lib/seo/site-audit'

export const dynamic = 'force-dynamic'

// Il layout radice emette questo token Bing anche quando la variabile Vercel non è impostata.
const DEFAULT_BING_VERIFICATION = 'C2F2AE380902663B014F3BFFD6AF7A93'

export async function GET(request: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  try {
    const [posts, categories, settings] = await Promise.all([
      sql`SELECT id, title, slug, excerpt, cover_image_url, cover_image_alt, category_id, published_at, published, body, seo_title, seo_description FROM posts`,
      sql`SELECT id, title, slug FROM categories ORDER BY title`,
      sql`SELECT site_title, tagline, author_name, author_bio, author_photo_url, author_photo_alt, instagram_url FROM site_settings WHERE id = 1 LIMIT 1`,
    ])
    const configured = process.env.SITE_URL?.trim()
    const audit = auditSite({
      posts: posts.rows as unknown as AuditPostRow[],
      categories: categories.rows as Array<{ id: string; title: string; slug: string }>,
      settings: (settings.rows[0] as unknown as AuditSettingsRow) ?? null,
      env: {
        siteUrl: configured || FALLBACK_SITE_URL,
        siteUrlConfigured: Boolean(configured),
        sessionSecretConfigured: Boolean(process.env.ADMIN_SESSION_SECRET?.trim()),
        sessionSecretFallbackAvailable: Boolean(process.env.ADMIN_PASSWORD?.trim()),
        indexNowConfigured: Boolean(getIndexNowKey()),
        googleVerificationConfigured: Boolean(process.env.GOOGLE_SITE_VERIFICATION?.trim()),
        bingVerificationConfigured: Boolean(process.env.BING_SITE_VERIFICATION?.trim() || DEFAULT_BING_VERIFICATION),
      },
      origin: new URL(request.url).origin,
    })
    return NextResponse.json(audit)
  } catch (error) {
    console.error('[SEO audit] Impossibile completare l’analisi:', error)
    return NextResponse.json({ error: 'Impossibile eseguire l’analisi. Verifica il database e riprova.' }, { status: 500 })
  }
}

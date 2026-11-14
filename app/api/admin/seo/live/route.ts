import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { getSiteUrl } from '@/lib/seo/site'
import { runLiveCheck } from '@/lib/seo/live-check'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Scansiona il dominio canonico configurato; nessun URL arriva dal client. */
export async function POST() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  const configuredSiteUrl = getSiteUrl()
  let siteUrl: URL
  try {
    siteUrl = new URL(configuredSiteUrl)
    if (!['https:', 'http:'].includes(siteUrl.protocol) || !siteUrl.hostname || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
      throw new Error('SITE_URL deve essere un URL assoluto del dominio, senza percorsi o parametri.')
    }
  } catch (error) {
    console.error('[SEO live] SITE_URL non valida:', error)
    return NextResponse.json({
      error: 'SITE_URL non è valida. In Vercel imposta l’indirizzo completo del dominio canonico, ad esempio https://controluce.blog.',
    }, { status: 500 })
  }

  try {
    const [posts, categories] = await Promise.all([
      sql`SELECT slug FROM posts WHERE published = TRUE AND published_at <= NOW() ORDER BY published_at DESC`,
      sql`SELECT c.slug FROM categories c WHERE EXISTS (SELECT 1 FROM posts p WHERE p.category_id = c.id AND p.published = TRUE AND p.published_at <= NOW()) ORDER BY c.title`,
    ])
    const origin = siteUrl.origin
    const result = await runLiveCheck({
      origin,
      siteUrl: origin,
      postSlugs: posts.rows.map((r) => r.slug as string),
      categorySlugs: categories.rows.map((r) => r.slug as string),
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[SEO live] Scansione non riuscita:', error)
    return NextResponse.json({ error: 'Impossibile completare la scansione del sito. Controlla i log della funzione su Vercel.' }, { status: 500 })
  }
}

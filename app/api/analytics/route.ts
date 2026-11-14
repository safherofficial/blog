import { NextResponse } from 'next/server'
import { isDatabaseConfigured, sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
let tableReady: Promise<unknown> | null = null

async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS site_analytics_events (
          id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          page_path TEXT NOT NULL, source TEXT NOT NULL, medium TEXT, campaign TEXT, referrer_host TEXT
        )
      `
      // Remove the temporary visitor identifier column from an earlier preview build, if present.
      await sql`ALTER TABLE site_analytics_events DROP COLUMN IF EXISTS visitor_hash`
    })().catch((error) => { tableReady = null; throw error })
  }
  await tableReady
}

function classifySource(utmSource: string, referrer: string) {
  const aliases: Record<string, string> = {
    instagram: 'Instagram', ig: 'Instagram', facebook: 'Facebook', fb: 'Facebook',
    tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn', pinterest: 'Pinterest',
    x: 'X', twitter: 'X', google: 'Google', bing: 'Bing', newsletter: 'Newsletter',
    email: 'Email', whatsapp: 'WhatsApp', telegram: 'Telegram',
  }
  const value = utmSource.trim().toLowerCase()
  if (value) return { source: aliases[value] || utmSource.trim().slice(0, 80), host: '' }
  if (!referrer) return { source: 'Diretto', host: '' }
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '')
    if (host.includes('instagram.com')) return { source: 'Instagram', host }
    if (host.includes('facebook.com')) return { source: 'Facebook', host }
    if (host === 't.co' || host === 'x.com' || host.includes('twitter.com')) return { source: 'X', host }
    if (host.includes('tiktok.com')) return { source: 'TikTok', host }
    if (host.includes('youtube.com') || host === 'youtu.be') return { source: 'YouTube', host }
    if (host.includes('linkedin.com')) return { source: 'LinkedIn', host }
    if (host.includes('pinterest.com')) return { source: 'Pinterest', host }
    if (host.includes('google.')) return { source: 'Google', host }
    if (host.includes('bing.com')) return { source: 'Bing', host }
    return { source: host, host }
  } catch { return { source: 'Diretto', host: '' } }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.path !== 'string') return NextResponse.json({ ok: false }, { status: 400 })
  const agent = request.headers.get('user-agent') || ''
  if (/bot|crawler|spider|headless|preview|facebookexternalhit|whatsapp/i.test(agent)) return NextResponse.json({ ok: true, ignored: true })
  const path = body.path.slice(0, 500).split('?')[0]
  if (!path.startsWith('/') || path.startsWith('/stats') || path.startsWith('/api/')) return NextResponse.json({ ok: true, ignored: true })
  const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 1000) : ''
  const utmSource = typeof body.utmSource === 'string' ? body.utmSource.slice(0, 80) : ''
  const medium = typeof body.utmMedium === 'string' ? body.utmMedium.slice(0, 80) : ''
  const campaign = typeof body.utmCampaign === 'string' ? body.utmCampaign.slice(0, 120) : ''
  const classified = classifySource(utmSource, referrer)
  try {
    await ensureTable()
    await sql`INSERT INTO site_analytics_events (page_path, source, medium, campaign, referrer_host)
      VALUES (${path}, ${classified.source}, ${medium || null}, ${campaign || null}, ${classified.host || null})`
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ ok: false }, { status: 503 }) }
}

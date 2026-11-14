import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isStatsRequest } from '@/lib/stats-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
let tableReady: Promise<unknown> | null = null
async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS site_analytics_events (
        id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        page_path TEXT NOT NULL, source TEXT NOT NULL, medium TEXT, campaign TEXT, referrer_host TEXT
      )`
      await sql`ALTER TABLE site_analytics_events DROP COLUMN IF EXISTS visitor_hash`
    })().catch((error) => { tableReady = null; throw error })
  }
  await tableReady
}

export async function GET() {
  if (!(await isStatsRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  if (!process.env.POSTGRES_URL) return NextResponse.json({ error: 'Database non configurato.' }, { status: 503 })
  try {
    await ensureTable()
    const [totals, daily, sources, hours, pages] = await Promise.all([
      sql`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW() AT TIME ZONE 'Europe/Rome') AT TIME ZONE 'Europe/Rome')::int AS today,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW() AT TIME ZONE 'Europe/Rome') AT TIME ZONE 'Europe/Rome')::int AS month
        FROM site_analytics_events`,
      sql`SELECT to_char(day, 'DD/MM') AS label, COALESCE(counts.views, 0)::int AS views
        FROM generate_series(date_trunc('day', NOW() AT TIME ZONE 'Europe/Rome') - interval '29 days',
          date_trunc('day', NOW() AT TIME ZONE 'Europe/Rome'), interval '1 day') AS days(day)
        LEFT JOIN (SELECT date_trunc('day', created_at AT TIME ZONE 'Europe/Rome') AS event_day, COUNT(*) AS views
          FROM site_analytics_events
          WHERE created_at >= (date_trunc('day', NOW() AT TIME ZONE 'Europe/Rome') - interval '29 days') AT TIME ZONE 'Europe/Rome'
          GROUP BY 1) counts ON counts.event_day = day ORDER BY day`,
      sql`SELECT source, COUNT(*)::int AS views,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1)::float AS percentage
        FROM site_analytics_events GROUP BY source ORDER BY views DESC LIMIT 12`,
      sql`SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Rome')::int AS hour, COUNT(*)::int AS views
        FROM site_analytics_events GROUP BY 1 ORDER BY 1`,
      sql`SELECT page_path AS path, COUNT(*)::int AS views FROM site_analytics_events
        GROUP BY page_path ORDER BY views DESC LIMIT 8`,
    ])
    return NextResponse.json({
      totals: totals.rows[0] || { total: 0, today: 0, month: 0 },
      daily: daily.rows, sources: sources.rows, hours: hours.rows, pages: pages.rows,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch {
    return NextResponse.json({ error: 'Impossibile leggere le statistiche. Verifica la connessione a Vercel Postgres.' }, { status: 503 })
  }
}

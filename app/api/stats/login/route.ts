import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createStatsToken, statsCookieName, statsSessionMaxAge } from '@/lib/stats-auth'

const attempts = new Map<string, { count: number; until: number }>()
const WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  const expected = process.env.STATS_PASSWORD
  if (!expected) return NextResponse.json({ error: 'Accesso statistiche non configurato su Vercel.' }, { status: 503 })
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const key = crypto.createHash('sha256').update(ip).digest('hex')
  const now = Date.now()
  const current = attempts.get(key)
  if (current && current.until > now && current.count >= 5) return NextResponse.json({ error: 'Troppi tentativi. Riprova più tardi.' }, { status: 429 })
  const body = await request.json().catch(() => null)
  const supplied = typeof body?.password === 'string' ? body.password : ''
  const a = Buffer.from(supplied); const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    const count = current && current.until > now ? current.count + 1 : 1
    attempts.set(key, { count, until: now + WINDOW_MS })
    return NextResponse.json({ error: 'Password non corretta.' }, { status: 401 })
  }
  attempts.delete(key)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(statsCookieName, createStatsToken(), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/api/stats', maxAge: statsSessionMaxAge,
  })
  return response
}

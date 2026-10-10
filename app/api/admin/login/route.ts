import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { adminCookieName, adminSessionMaxAge, adminToken } from '@/lib/admin-auth'

// Best-effort per-instance throttling. Configure platform-level rate limiting too,
// because serverless instances do not share in-memory state.
const attempts = new Map<string, { count: number; resetAt: number; blockedUntil: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const BLOCK_MS = 15 * 60 * 1000

function clientKey(request: Request): string {
  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  return crypto.createHash('sha256').update(ip).digest('hex')
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Autenticazione amministrativa non configurata.' }, { status: 503 })
  }

  const key = clientKey(request)
  const now = Date.now()
  const current = attempts.get(key)
  if (current && current.resetAt <= now) attempts.delete(key)
  const active = attempts.get(key)
  if (active && active.blockedUntil > now) {
    return NextResponse.json(
      { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((active.blockedUntil - now) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (password !== process.env.ADMIN_PASSWORD) {
    const previous = attempts.get(key)
    const count = previous && previous.resetAt > now ? previous.count + 1 : 1
    attempts.set(key, {
      count,
      resetAt: previous && previous.resetAt > now ? previous.resetAt : now + WINDOW_MS,
      blockedUntil: count >= MAX_ATTEMPTS ? now + BLOCK_MS : 0,
    })
    return NextResponse.json({ error: 'Password non valida.' }, { status: 401 })
  }

  attempts.delete(key)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminCookieName, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: adminSessionMaxAge,
  })
  return response
}

import { NextResponse } from 'next/server'
import { adminCookieName, adminToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}))
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Password non valida.' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminCookieName, adminToken(), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 60 * 60 * 24 * 7,
  })
  return response
}

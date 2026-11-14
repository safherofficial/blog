import { NextResponse } from 'next/server'
import { statsCookieName } from '@/lib/stats-auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(statsCookieName, '', {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/api/stats', maxAge: 0,
  })
  return response
}

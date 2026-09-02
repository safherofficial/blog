import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'controluce_admin'

function token(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD non configurata')
  return crypto.createHmac('sha256', secret).update('controluce-admin-v1').digest('hex')
}

export function isAdminRequest(): boolean {
  if (!process.env.ADMIN_PASSWORD) return false
  const value = cookies().get(COOKIE_NAME)?.value
  if (!value) return false
  const expected = token()
  return value.length === expected.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}

export function adminToken(): string {
  return token()
}

export const adminCookieName = COOKIE_NAME

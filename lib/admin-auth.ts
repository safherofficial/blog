import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'controluce_admin'
const SESSION_TTL_SECONDS = 60 * 60 * 8

function signingSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD non configurata')
  return secret
}

/**
 * Signed, expiring session token. A separate ADMIN_SESSION_SECRET is recommended;
 * ADMIN_PASSWORD remains a compatibility fallback for existing deployments.
 */
export function adminToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const nonce = crypto.randomBytes(16).toString('base64url')
  const payload = `${expiresAt}.${nonce}`
  const signature = crypto.createHmac('sha256', signingSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function isAdminRequest(): boolean {
  if (!process.env.ADMIN_PASSWORD) return false

  const value = cookies().get(COOKIE_NAME)?.value
  if (!value) return false

  const parts = value.split('.')
  if (parts.length !== 3) return false

  const [expiry, nonce, suppliedSignature] = parts
  const expiresAt = Number(expiry)
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false
  if (!nonce || !suppliedSignature) return false

  const payload = `${expiry}.${nonce}`
  const expectedSignature = crypto.createHmac('sha256', signingSecret()).update(payload).digest('base64url')
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected)
}

export const adminCookieName = COOKIE_NAME
export const adminSessionMaxAge = SESSION_TTL_SECONDS

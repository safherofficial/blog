import crypto from 'node:crypto'
import { cookies } from 'next/headers'

export const statsCookieName = 'controluce_stats'
export const statsSessionMaxAge = 60 * 60 * 12

function secret(): string {
  const value = process.env.STATS_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.STATS_PASSWORD
  if (!value) throw new Error('Configurare STATS_PASSWORD')
  return value
}

export function createStatsToken(): string {
  const expires = Math.floor(Date.now() / 1000) + statsSessionMaxAge
  const nonce = crypto.randomBytes(18).toString('base64url')
  const payload = `${expires}.${nonce}`
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export async function isStatsRequest(): Promise<boolean> {
  if (!process.env.STATS_PASSWORD) return false
  const cookieStore = await cookies()
  const token = cookieStore.get(statsCookieName)?.value
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [expiry, nonce, signature] = parts
  const expires = Number(expiry)
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000) || !nonce || !signature) return false
  const expected = crypto.createHmac('sha256', secret()).update(`${expiry}.${nonce}`).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

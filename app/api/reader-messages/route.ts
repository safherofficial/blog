import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureReaderMessagesTable } from '@/lib/db/reader-messages'

const CATEGORIES = ['racconto', 'argomento', 'altro'] as const
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SUBMISSION_WINDOW_MS = 15 * 60 * 1000
const MAX_SUBMISSIONS_PER_WINDOW = 4

type RateWindow = { count: number; resetAt: number }
const submissionWindows = new Map<string, RateWindow>()

function limited(request: Request): boolean {
  const now = Date.now()
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const key = request.headers.get('x-real-ip')?.trim() || forwarded || 'unknown'
  if (submissionWindows.size > 1000) {
    for (const [ip, window] of submissionWindows) {
      if (window.resetAt <= now) submissionWindows.delete(ip)
    }
  }
  const current = submissionWindows.get(key)
  if (!current || current.resetAt <= now) {
    submissionWindows.set(key, { count: 1, resetAt: now + SUBMISSION_WINDOW_MS })
    return false
  }
  if (current.count >= MAX_SUBMISSIONS_PER_WINDOW) return true
  current.count += 1
  return false
}

function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 16000) return response({ error: 'Il messaggio è troppo grande.' }, 413)

  const data = await request.json().catch(() => null)
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return response({ error: 'Controlla i dati inseriti e riprova.' }, 400)
  }
  if (typeof data.companyWebsite === 'string' && data.companyWebsite.trim()) {
    return response({ ok: true }, 201)
  }
  if (limited(request)) {
    return response({ error: 'Hai inviato diversi messaggi in poco tempo. Riprova più tardi.' }, 429)
  }

  const message = typeof data.message === 'string' ? data.message.replace(/\u0000/g, '').trim() : ''
  if (message.length < 10 || message.length > 5000) {
    return response({ error: 'Il messaggio deve contenere da 10 a 5.000 caratteri.' }, 400)
  }
  const rawCategory = typeof data.category === 'string' ? data.category.trim() : ''
  const category = rawCategory ? CATEGORIES.find((item) => item === rawCategory) : 'altro'
  if (!category) return response({ error: 'Seleziona una categoria valida.' }, 400)

  const displayName = typeof data.name === 'string' ? data.name.trim().slice(0, 80) || null : null
  const wantsReply = data.wantsReply === true
  const emailInput = typeof data.email === 'string' ? data.email.trim().toLowerCase().slice(0, 254) : ''
  const email = wantsReply ? emailInput : null
  if (wantsReply && (!email || !EMAIL_PATTERN.test(email))) {
    return response({ error: 'Inserisci un indirizzo email valido per ricevere una risposta.' }, 400)
  }
  if (data.privacyAccepted !== true) {
    return response({ error: 'Per inviare il messaggio devi confermare di aver letto l’informativa privacy.' }, 400)
  }

  try {
    await ensureReaderMessagesTable()
    await sql`
      INSERT INTO reader_messages (category, message, display_name, email, wants_reply, privacy_acknowledged)
      VALUES (${category}, ${message}, ${displayName}, ${email}, ${wantsReply}, TRUE)
    `
    return response({ ok: true }, 201)
  } catch {
    return response({ error: 'Non è stato possibile salvare il messaggio. Il testo non è stato inviato: riprova più tardi.' }, 500)
  }
}

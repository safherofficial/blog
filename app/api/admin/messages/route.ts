import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { ensureReaderMessagesTable } from '@/lib/db/reader-messages'

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  try {
    await ensureReaderMessagesTable()
    const { rows } = await sql`
      SELECT id, category, message, display_name, email, wants_reply, status, created_at, updated_at, replied_at
      FROM reader_messages
      ORDER BY created_at DESC
      LIMIT 500
    `
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Impossibile caricare i messaggi. Verifica la connessione al database.' }, { status: 500 })
  }
}

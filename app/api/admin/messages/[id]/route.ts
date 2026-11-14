import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdminRequest } from '@/lib/admin-auth'
import { ensureReaderMessagesTable, type ReaderMessageStatus } from '@/lib/db/reader-messages'

type RouteContext = { params: Promise<{ id: string }> }

const STATUSES: ReaderMessageStatus[] = ['new', 'reading', 'replied', 'archived']
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function validId(id: string): boolean {
  return UUID_PATTERN.test(id)
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  if (!validId(id)) return NextResponse.json({ error: 'Messaggio non valido.' }, { status: 400 })
  const data = await request.json().catch(() => null)
  if (!data || typeof data.status !== 'string' || !STATUSES.includes(data.status as ReaderMessageStatus)) {
    return NextResponse.json({ error: 'Stato non valido.' }, { status: 400 })
  }
  const status = data.status as ReaderMessageStatus
  try {
    await ensureReaderMessagesTable()
    const { rows } = await sql`
      UPDATE reader_messages
      SET status = ${status},
          updated_at = NOW(),
          replied_at = CASE WHEN ${status} = 'replied' THEN COALESCE(replied_at, NOW()) ELSE NULL END
      WHERE id = ${id}
      RETURNING id, status
    `
    if (!rows[0]) return NextResponse.json({ error: 'Messaggio non trovato.' }, { status: 404 })
    return NextResponse.json({ ok: true, message: rows[0] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Impossibile aggiornare lo stato del messaggio.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  if (!validId(id)) return NextResponse.json({ error: 'Messaggio non valido.' }, { status: 400 })
  try {
    await ensureReaderMessagesTable()
    const { rows } = await sql`DELETE FROM reader_messages WHERE id = ${id} RETURNING id`
    if (!rows[0]) return NextResponse.json({ error: 'Messaggio non trovato.' }, { status: 404 })
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Impossibile eliminare il messaggio.' }, { status: 500 })
  }
}

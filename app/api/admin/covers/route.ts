import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_COVER_UPLOAD_BYTES = 4 * 1024 * 1024
let storageTableReady: Promise<void> | null = null

function ensureStorageTable(): Promise<void> {
  if (!storageTableReady) {
    storageTableReady = sql`
      CREATE TABLE IF NOT EXISTS controluce_media_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
        data BYTEA NOT NULL,
        size_bytes INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 4194304),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined).catch((error) => {
      storageTableReady = null
      throw error
    })
  }
  return storageTableReady
}

function detectImageContentType(bytes: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  return null
}

export async function POST(request: Request) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Richiesta di caricamento non valida.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Seleziona un file immagine.' }, { status: 400 })
  }
  if (file.size <= 0) return NextResponse.json({ error: 'Il file selezionato è vuoto.' }, { status: 400 })
  if (file.size > MAX_COVER_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'La copertina non può superare 4 MB.' }, { status: 413 })
  }

  let bytes: Buffer
  try {
    bytes = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'Impossibile leggere il file selezionato.' }, { status: 400 })
  }

  const contentType = detectImageContentType(bytes)
  if (!contentType) {
    return NextResponse.json({ error: 'Formato non supportato. Usa un’immagine JPG, PNG o WebP valida.' }, { status: 415 })
  }

  try {
    await ensureStorageTable()
    const base64 = bytes.toString('base64')
    const { rows } = await sql`
      INSERT INTO controluce_media_assets (content_type, data, size_bytes)
      VALUES (${contentType}, decode(${base64}, 'base64'), ${bytes.byteLength})
      RETURNING id
    `
    const id = rows[0]?.id
    if (!id) return NextResponse.json({ error: 'Il file è stato ricevuto ma non è stato salvato.' }, { status: 500 })
    return NextResponse.json({
      url: '/api/media/covers/' + id,
      contentType,
      sizeBytes: bytes.byteLength,
    }, { status: 201 })
  } catch (error) {
    console.error('Controluce cover upload failed:', error)
    return NextResponse.json({ error: 'Impossibile salvare la copertina. Riprova.' }, { status: 500 })
  }
}

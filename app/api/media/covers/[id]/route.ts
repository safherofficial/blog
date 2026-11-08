import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CoverAssetRow = {
  content_type: string
  data_base64: string
  size_bytes: number
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'Immagine non trovata.' }, { status: 404 })
  }

  try {
    const { rows } = await sql`
      SELECT content_type, encode(data, 'base64') AS data_base64, size_bytes
      FROM controluce_media_assets
      WHERE id = ${params.id}
      LIMIT 1
    `
    const asset = rows[0] as CoverAssetRow | undefined
    const extension = asset ? EXTENSIONS[asset.content_type] : null
    if (!asset || !extension) {
      return NextResponse.json({ error: 'Immagine non trovata.' }, { status: 404 })
    }

    const image = Buffer.from(asset.data_base64, 'base64')
    if (image.byteLength !== asset.size_bytes) {
      return NextResponse.json({ error: 'Immagine non disponibile.' }, { status: 500 })
    }

    return new NextResponse(image, {
      headers: {
        'Content-Type': asset.content_type,
        'Content-Length': String(image.byteLength),
        'Content-Disposition': 'inline; filename="controluce-cover-' + params.id + '.' + extension + '"',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Controluce cover delivery failed:', error)
    return NextResponse.json({ error: 'Immagine temporaneamente non disponibile.' }, { status: 500 })
  }
}

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { OG_SIZE } from './metadata'

// I font sono nel repository (licenza OFL) e vengono letti una sola volta per istanza.
const fontCache = new Map<string, Promise<Buffer>>()
function loadFont(file: string): Promise<Buffer> {
  let font = fontCache.get(file)
  if (!font) {
    font = readFile(path.join(process.cwd(), 'assets', 'fonts', file))
    fontCache.set(file, font)
  }
  return font
}

type CardInput = { eyebrow: string; title: string; footer?: string }

function titleSize(length: number): number {
  if (length <= 34) return 92
  if (length <= 60) return 76
  if (length <= 90) return 62
  return 52
}

/** Anteprima social di marca (1200×630): serve a Google Discover, WhatsApp, LinkedIn, X e agli assistenti AI. */
export async function renderOgCard({ eyebrow, title, footer }: CardInput): Promise<ImageResponse> {
  const [regular, italic] = await Promise.all([loadFont('fraunces-600.woff'), loadFont('fraunces-600-italic.woff')])
  const text = title.length > 120 ? `${title.slice(0, 117).trimEnd()}…` : title
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 76px', background: 'linear-gradient(135deg, #17110d 0%, #2a1d14 55%, #3d2b1c 100%)', color: '#F5EFE5', fontFamily: 'Fraunces', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 760, height: 760, borderRadius: 760, background: 'radial-gradient(circle, rgba(213,178,127,0.42) 0%, rgba(213,178,127,0) 68%)', display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 44, letterSpacing: -1 }}>
          <span>Contro</span>
          <span style={{ fontStyle: 'italic', color: '#D5B27F' }}>luce</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, textTransform: 'uppercase', color: '#D5B27F', marginBottom: 28 }}>{eyebrow}</div>
          <div style={{ display: 'flex', fontSize: titleSize(text.length), lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 980 }}>{text}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#CDBBA6' }}>
          <div style={{ display: 'flex', width: 64, height: 2, background: '#D5B27F', marginRight: 20 }} />
          {footer || 'Oltre la superficie'}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Fraunces', data: regular, weight: 600, style: 'normal' },
        { name: 'Fraunces', data: italic, weight: 600, style: 'italic' },
      ],
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
    },
  )
}

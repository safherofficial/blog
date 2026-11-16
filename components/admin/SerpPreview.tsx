'use client'

import { useState } from 'react'

/** Anteprima visiva indicativa: Google adatta titolo e snippet alla larghezza disponibile. */
export default function SerpPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  const [mobile, setMobile] = useState(false)
  // Static display-only host; the configurable site URL remains server-side.
  const host = 'controluce.blog'
  const clampStyle = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: 2,
    overflow: 'hidden',
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Anteprima su Google</p>
        <div className="flex border border-line text-[11px]" role="group" aria-label="Dispositivo">
          {[false, true].map((isMobile) => (
            <button key={String(isMobile)} type="button" aria-pressed={mobile === isMobile} onClick={() => setMobile(isMobile)} className={`px-2.5 py-1 font-mono uppercase tracking-wider ${mobile === isMobile ? 'bg-wine text-white' : 'bg-white text-ink-soft'}`}>
              {isMobile ? 'Mobile' : 'Desktop'}
            </button>
          ))}
        </div>
      </div>
      <div className={`border border-line bg-white p-4 ${mobile ? 'max-w-[360px]' : ''}`}>
        <p className="truncate text-xs text-[#4d5156]">{host} › blog › {slug || 'slug-articolo'}</p>
        <p className="mt-1 text-xl leading-snug text-[#1a0dab]" style={clampStyle}>{title || 'Titolo dell’articolo'}</p>
        <p className="mt-1 text-sm leading-snug text-[#4d5156]" style={clampStyle}>{description || 'La descrizione dell’articolo apparirà qui sotto il titolo.'}</p>
      </div>
      <p className="mt-2 text-xs text-ink-soft">Simulazione orientativa: Google può riscrivere il link del titolo e lo snippet in base alla ricerca e allo spazio disponibile.</p>
    </div>
  )
}

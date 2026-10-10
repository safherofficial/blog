'use client'

import { useState } from 'react'
import { LIMITS } from '@/lib/seo/constants'

function clip(value: string, max: number): string {
  return value.length > max ? value.slice(0, max - 1).trimEnd() + '…' : value
}

/** Simulazione indicativa del risultato Google: i limiti reali dipendono dai pixel, non dai caratteri. */
export default function SerpPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  const [mobile, setMobile] = useState(false)
  const host = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.controluce-blog.it').replace(/^https?:\/\//, '').replace(/\/$/, '')
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
        <p className="mt-1 text-xl leading-snug text-[#1a0dab]">{clip(title || 'Titolo dell’articolo', LIMITS.titleMax)}</p>
        <p className="mt-1 text-sm leading-snug text-[#4d5156]">{clip(description || 'La descrizione dell’articolo apparirà qui sotto il titolo.', LIMITS.descriptionMax)}</p>
      </div>
    </div>
  )
}

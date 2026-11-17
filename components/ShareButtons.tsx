'use client'

import { useEffect, useState } from 'react'

const button = 'share-button inline-flex min-h-[44px] items-center justify-center gap-2 border border-line bg-transparent px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-ochre hover:text-wine'

export default function ShareButtons({ title }: { title: string }) {
  const [status, setStatus] = useState('')
  const [url, setUrl] = useState('')
  const [canShare, setCanShare] = useState(false)

  // Indirizzo calcolato dopo il montaggio: evita differenze tra server e client.
  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname)
    setCanShare(typeof navigator.share === 'function')
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setStatus('Link copiato negli appunti')
    } catch {
      setStatus('Copia non riuscita: copia l’indirizzo dalla barra del browser')
    }
    window.setTimeout(() => setStatus(''), 3500)
  }

  async function share() {
    try { await navigator.share({ title, url }) } catch { /* annullato dall’utente */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Condividi</span>
      <button type="button" onClick={copy} disabled={!url} className={button}>Copia link</button>
      <a className={button} target="_blank" rel="noopener noreferrer" href={url ? `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` : undefined} aria-disabled={!url}>
        WhatsApp <span aria-hidden="true">↗</span>
      </a>
      {canShare && <button type="button" onClick={share} className={button}>Altro…</button>}
      <span role="status" aria-live="polite" className="font-mono text-[10px] tracking-wide text-emerald-800">{status}</span>
    </div>
  )
}

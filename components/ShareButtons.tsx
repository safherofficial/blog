'use client'

import { useEffect, useState } from 'react'

const button =
  'share-button inline-flex min-h-[48px] items-center justify-center gap-2 rounded-sm border border-[#6F5035] bg-[#30251F] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F1E9DC] shadow-[0_3px_12px_rgba(42,29,20,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D6A45B] hover:bg-[#493426] hover:text-[#F8E7C9] hover:shadow-[0_8px_20px_rgba(42,29,20,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9D7440] disabled:cursor-not-allowed disabled:opacity-50'

const copyButton =
  'border-[#A17A45] bg-[#D6A45B] text-[#211A15] hover:border-[#8A683F] hover:bg-[#E4C18F] hover:text-[#211A15]'

export default function ShareButtons({ title }: { title: string }) {
  const [status, setStatus] = useState('')
  const [url, setUrl] = useState('')
  const [canShare, setCanShare] = useState(false)

  // Indirizzo calcolato dopo il montaggio: evita differenze tra server e client.
  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname)
    setCanShare(typeof navigator.share === 'function')
  }, [])

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const message = encodeURIComponent(`${title}\n${url}`)

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
    try {
      await navigator.share({ title, url })
    } catch {
      /* annullato dall’utente */
    }
  }

  return (
    <section
      className="relative my-10 overflow-hidden border border-[#D6A45B]/60 bg-[#F1E9DC] px-5 py-6 shadow-[0_12px_32px_rgba(42,29,20,0.07)] sm:px-7 sm:py-7"
      aria-label="Condivisione articolo"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#30251F] via-[#D6A45B] to-[#30251F]"
      />
      <div className="mb-5 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[#B18C5E]/60 bg-[#E6D6BF] font-mono text-lg text-[#604633]"
        >
          ↗
        </span>
        <div>
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#604633]">
            Condividi questo articolo
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#6A5C50]">
            Hai trovato interessante questa lettura? Falla arrivare anche ad altri.
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Scegli dove condividere"
        className="flex flex-wrap gap-2.5"
      >
        <button
          type="button"
          onClick={copy}
          disabled={!url}
          className={`${button} ${copyButton}`}
        >
          Copia link <span aria-hidden="true">⧉</span>
        </button>
        <a
          className={button}
          target="_blank"
          rel="noopener noreferrer"
          href={url ? `https://wa.me/?text=${message}` : undefined}
          aria-disabled={!url}
          aria-label="Condividi su WhatsApp"
        >
          WhatsApp <span aria-hidden="true">↗</span>
        </a>
        <a
          className={button}
          target="_blank"
          rel="noopener noreferrer"
          href={url ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` : undefined}
          aria-disabled={!url}
          aria-label="Condividi su Facebook"
        >
          Facebook <span aria-hidden="true">↗</span>
        </a>
        <a
          className={button}
          target="_blank"
          rel="noopener noreferrer"
          href={url ? `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` : undefined}
          aria-disabled={!url}
          aria-label="Condividi su X"
        >
          X <span aria-hidden="true">↗</span>
        </a>
        <a
          className={button}
          target="_blank"
          rel="noopener noreferrer"
          href={url ? `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` : undefined}
          aria-disabled={!url}
          aria-label="Condividi su Telegram"
        >
          Telegram <span aria-hidden="true">↗</span>
        </a>
        <a
          className={button}
          target="_blank"
          rel="noopener noreferrer"
          href={url ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` : undefined}
          aria-disabled={!url}
          aria-label="Condividi su LinkedIn"
        >
          LinkedIn <span aria-hidden="true">↗</span>
        </a>
        <a
          className={button}
          href={url ? `mailto:?subject=${encodedTitle}&body=${message}` : undefined}
          aria-disabled={!url}
          aria-label="Condividi via email"
        >
          Email <span aria-hidden="true">↗</span>
        </a>
        {canShare && (
          <button type="button" onClick={share} disabled={!url} className={button}>
            Altro… <span aria-hidden="true">＋</span>
          </button>
        )}
      </div>

      <span
        role="status"
        aria-live="polite"
        className="mt-3 block min-h-4 font-mono text-[10px] tracking-wide text-[#49634D]"
      >
        {status}
      </span>
    </section>
  )
}

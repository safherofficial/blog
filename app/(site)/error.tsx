'use client'

import Link from 'next/link'

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="category-masthead py-24 md:py-32">
      <div className="wrap text-center">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#D9B47F]">Qualcosa è andato storto</p>
        <h1 className="mx-auto max-w-[20ch] font-display text-4xl leading-tight text-[#F5EFE5] md:text-6xl">Un attimo, riproviamo.</h1>
        <p className="mx-auto mt-6 max-w-[46ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">
          La pagina non si è caricata correttamente. Succede: riprova tra un momento oppure torna alla home.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={reset} className="hero-cta inline-flex items-center gap-3 border border-[#D3AB76] bg-[#D3AB76] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#211A15]">Riprova</button>
          <Link href="/" className="nav-link font-mono text-[11px] uppercase tracking-[0.18em] text-[#E5D4C0]">Torna alla home</Link>
        </div>
      </div>
    </section>
  )
}

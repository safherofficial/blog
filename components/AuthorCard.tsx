import Link from 'next/link'
import { AUTHOR_PEN_NAME, AUTHOR_SHORT_BIO } from '@/lib/author'

export default function AuthorCard() {
  return (
    <aside aria-label="L’autrice" className="author-card flex flex-col gap-5 border border-line bg-bg-soft/50 p-6 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ochre/50 bg-ink">
        <span className="font-display text-3xl italic text-[#D5B27F]" aria-hidden="true">C</span>
      </div>
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Una storia firmata</p>
        <p className="font-display text-2xl leading-tight">{AUTHOR_PEN_NAME}</p>
        <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">{AUTHOR_SHORT_BIO}</p>
        <Link href="/about" className="nav-link mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-wine">La storia dietro la firma ↗</Link>
      </div>
    </aside>
  )
}

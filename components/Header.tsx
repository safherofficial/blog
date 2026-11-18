import Link from 'next/link'
import { X_PROFILE_URL } from '@/lib/seo/site'

export default function Header({ siteTitle = 'Controluce', instagramUrl }: { siteTitle?: string | null; instagramUrl?: string | null }) {
  return (
    <header className="site-header bg-bg">
      <div className="masthead-rule" aria-hidden="true" />
      <div className="wrap topbar flex items-center justify-between border-b border-line py-2.5">
        <span className="flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-soft sm:text-[10px] sm:tracking-[0.22em]">
          <span className="topbar-light" aria-hidden="true" />
          Storie, riflessioni e vita quotidiana
        </span>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest text-ink-soft sm:gap-5 sm:text-[10px]">
          <a href={X_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="Profilo ufficiale di Controluce su X" className="nav-link whitespace-nowrap transition-colors hover:text-wine">
            X <span aria-hidden="true">↗</span>
          </a>
          {instagramUrl ? (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-link whitespace-nowrap transition-colors hover:text-wine">
              Instagram <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link href="/rss" className="nav-link whitespace-nowrap transition-colors hover:text-wine">Feed RSS <span aria-hidden="true">↗</span></Link>
          )}
        </div>
      </div>

      <div className="wrap brand-masthead border-b border-line py-6 text-center md:py-7">
        <Link href="/" className="brand-link inline-flex flex-col items-center" aria-label={`${siteTitle || 'Controluce'} — homepage`}>
          <span className="font-display text-4xl leading-none tracking-tight text-ink md:text-[3.35rem]">
            {siteTitle === 'Controluce' ? <>Contro<span className="brand-emphasis italic">luce</span></> : siteTitle}
          </span>
          <span className="brand-subtitle mt-3 font-mono text-[8px] uppercase tracking-[0.32em] text-ink-soft sm:text-[9px]">
            Oltre la superficie
          </span>
        </Link>
      </div>

      <nav aria-label="Navigazione principale" className="site-nav wrap flex min-h-[44px] items-center justify-center gap-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:gap-8 sm:text-[11px]">
        <Link href="/" className="site-nav-link nav-link inline-flex min-h-[44px] items-center transition-colors hover:text-wine">Home</Link>
        <span aria-hidden="true" className="nav-separator">✳</span>
        <Link href="/about" className="site-nav-link nav-link inline-flex min-h-[44px] items-center transition-colors hover:text-wine">Chi sono</Link>
        <span aria-hidden="true" className="nav-separator">✳</span>
        <Link href="/articoli" className="site-nav-link nav-link inline-flex min-h-[44px] items-center transition-colors hover:text-wine">Articoli</Link>
        <span aria-hidden="true" className="nav-separator">✳</span>
        <Link href="/scrivimi" className="site-nav-link nav-link inline-flex min-h-[44px] items-center transition-colors hover:text-wine">Parliamone</Link>
      </nav>
    </header>
  )
}

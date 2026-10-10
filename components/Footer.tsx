import Link from 'next/link'

export default function Footer({ siteTitle = 'Controluce', authorName, instagramUrl }: { siteTitle?: string | null; authorName?: string | null; instagramUrl?: string | null }) {
  return (
    <footer className="border-t border-line py-14">
      <div className="wrap grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <Link href="/" className="font-display text-2xl">{siteTitle || 'Controluce'}</Link>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-ink-soft">
            Storie, riflessioni e piccoli rituali di vita quotidiana, raccontati con uno sguardo personale.
          </p>
        </div>
        <nav aria-label="Navigazione footer" className="flex flex-col gap-2 text-[13px] font-mono uppercase tracking-widest text-ink-soft md:mx-auto">
          <Link href="/" className="nav-link w-fit transition-colors hover:text-wine">Home</Link>
          <Link href="/about" className="nav-link w-fit transition-colors hover:text-wine">Chi sono</Link>
          <Link href="/#articoli" className="nav-link w-fit transition-colors hover:text-wine">Articoli</Link>
          <Link href="/rss" className="nav-link w-fit transition-colors hover:text-wine">Feed RSS</Link>
        </nav>
        <div className="md:text-right">
          <p className="mb-2 text-[13px] font-mono uppercase tracking-widest text-ink-soft">Seguimi</p>
          {instagramUrl ? (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-link text-sm text-ink transition-colors hover:text-wine">Instagram</a>
          ) : (
            <Link href="/rss" className="nav-link text-sm text-ink transition-colors hover:text-wine">Ricevi gli aggiornamenti via RSS</Link>
          )}
        </div>
      </div>
      <div className="wrap mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-soft">
        <span>
          &copy; {new Date().getFullYear()} {siteTitle || 'Controluce'}{authorName ? ` — ${authorName}` : ''}. Tutti i diritti riservati.
          {' · '}
          <Link href="/privacy-policy" className="nav-link transition-colors hover:text-wine">Privacy Policy</Link>
        </span>
        <span className="font-mono uppercase tracking-widest">Impaginato con cura editoriale</span>
      </div>
    </footer>
  )
}

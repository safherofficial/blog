import Link from 'next/link'

export default function Header({ siteTitle = 'Controluce', instagramUrl }: { siteTitle?: string | null; instagramUrl?: string | null }) {
  return (
    <header className="bg-bg">
      <div className="wrap flex items-center justify-between border-b border-line py-2.5 text-[11px] font-mono uppercase tracking-widest text-ink-soft">
        <span>Storie, riflessioni e vita quotidiana</span>
        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="nav-link transition-colors hover:text-wine">
            Instagram
          </a>
        ) : (
          <Link href="/rss" className="nav-link transition-colors hover:text-wine">Feed RSS</Link>
        )}
      </div>

      <div className="wrap border-b border-line py-7 text-center">
        <Link href="/" className="font-display text-4xl tracking-tight md:text-5xl">
          {siteTitle === 'Controluce' ? <>Contro<em className="text-wine not-italic italic">luce</em></> : siteTitle}
        </Link>
      </div>

      <nav aria-label="Navigazione principale" className="wrap flex items-center justify-center gap-3 py-3 text-[13px] font-mono uppercase tracking-widest text-ink-soft md:gap-4">
        <Link href="/" className="nav-link transition-colors hover:text-wine">Home</Link>
        <span aria-hidden className="text-line">·</span>
        <Link href="/about" className="nav-link transition-colors hover:text-wine">Chi sono</Link>
        <span aria-hidden className="text-line">·</span>
        <Link href="/#articoli" className="nav-link transition-colors hover:text-wine">Articoli</Link>
      </nav>
    </header>
  )
}

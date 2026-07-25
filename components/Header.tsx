import Link from 'next/link'

export default function Header({ instagramUrl }: { instagramUrl?: string }) {
  return (
    <header className="bg-bg">
      <div className="wrap flex items-center justify-between border-b border-line py-2.5 text-[11px] font-mono uppercase tracking-widest text-ink-soft">
        <span>Diario editoriale - dal 2026</span>
        <a
          href={instagramUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link hover:text-wine transition-colors"
        >
          Instagram
        </a>
      </div>

      <div className="wrap border-b border-line py-7 text-center">
        <Link href="/" className="font-display text-4xl tracking-tight md:text-5xl">
          Contro<em className="text-wine not-italic italic">luce</em>
        </Link>
      </div>

      <nav className="wrap flex items-center justify-center gap-3 py-3 text-[13px] font-mono uppercase tracking-widest text-ink-soft md:gap-4">
        <Link href="/" className="nav-link hover:text-wine transition-colors">Home</Link>
        <span aria-hidden className="text-line">.</span>
        <Link href="/about" className="nav-link hover:text-wine transition-colors">Chi sono</Link>
        <span aria-hidden className="text-line">.</span>
        <Link href="/#articoli" className="nav-link hover:text-wine transition-colors">Articoli</Link>
      </nav>
    </header>
  )
}

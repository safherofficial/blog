import Link from 'next/link'

export default function Footer({ authorName, instagramUrl }: { authorName?: string; instagramUrl?: string }) {
  return (
    <footer className="border-t border-line py-14">
      <div className="wrap grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <span className="font-display text-2xl">
            Contro<em className="text-wine not-italic italic">luce</em>
          </span>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-ink-soft">
            Storie, riflessioni e piccoli rituali di vita quotidiana, raccontati con uno sguardo personale.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-[13px] font-mono uppercase tracking-widest text-ink-soft md:mx-auto">
          <Link href="/" className="nav-link w-fit hover:text-wine transition-colors">Home</Link>
          <Link href="/about" className="nav-link w-fit hover:text-wine transition-colors">Chi sono</Link>
          <Link href="/#articoli" className="nav-link w-fit hover:text-wine transition-colors">Articoli</Link>
        </nav>
        <div className="md:text-right">
          <p className="mb-2 text-[13px] font-mono uppercase tracking-widest text-ink-soft">Seguimi</p>
          <a
            href={instagramUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link text-sm text-ink hover:text-wine transition-colors"
          >
            Instagram
          </a>
        </div>
      </div>
      <div className="wrap mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-soft">
        <span>
          &copy; {new Date().getFullYear()} Controluce - {authorName || '[Il tuo nome]'}. Tutti i diritti riservati.
          {' - '}
          <Link href="/privacy-policy" className="nav-link hover:text-wine transition-colors">
            Privacy Policy
          </Link>
        </span>
        <span className="font-mono uppercase tracking-widest">Impaginato con cura editoriale</span>
      </div>
    </footer>
  )
}

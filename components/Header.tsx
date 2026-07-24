import Link from 'next/link'

export default function Header({ instagramUrl }: { instagramUrl?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className="wrap flex items-center justify-between py-5">
        <Link href="/" className="font-display italic text-2xl">
          Contro<em className="text-wine not-italic italic">luce</em>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-soft">
          <Link href="/" className="hover:text-wine transition-colors">Home</Link>
          <Link href="/about" className="hover:text-wine transition-colors">Chi sono</Link>
          <Link href="/#articoli" className="hover:text-wine transition-colors">Articoli</Link>
        </nav>
        <a
          href={instagramUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-wine hover:border-wine hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.6.5.7.3 1.2.6 1.7 1.1.5.5.9 1 1.1 1.7.25.6.44 1.4.5 2.6.07 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.5 2.6-.3.7-.6 1.2-1.1 1.7-.5.5-1 .9-1.7 1.1-.6.25-1.4.44-2.6.5-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2-.25-2.6-.5-.7-.3-1.2-.6-1.7-1.1-.5-.5-.9-1-1.1-1.7-.25-.6-.44-1.4-.5-2.6C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-2 .5-2.6.3-.7.6-1.2 1.1-1.7.5-.5 1-.9 1.7-1.1.6-.25 1.4-.44 2.6-.5C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.52 0-4.76.07-1.03.05-1.6.22-1.96.36-.5.2-.85.42-1.22.79-.37.37-.6.72-.79 1.22-.14.37-.3.93-.36 1.96C2.8 8.48 2.8 8.85 2.8 12s0 3.52.07 4.76c.05 1.03.22 1.6.36 1.96.2.5.42.85.79 1.22.37.37.72.6 1.22.79.37.14.93.3 1.96.36 1.24.07 1.6.07 4.76.07s3.52 0 4.76-.07c1.03-.05 1.6-.22 1.96-.36.5-.2.85-.42 1.22-.79.37-.37.6-.72.79-1.22.14-.37.3-.93.36-1.96.07-1.24.07-1.6.07-4.76s0-3.52-.07-4.76c-.05-1.03-.22-1.6-.36-1.96-.2-.5-.42-.85-.79-1.22-.37-.37-.72-.6-1.22-.79-.37-.14-.93-.3-1.96-.36C15.52 4 15.15 4 12 4zm0 3.4a4.6 4.6 0 110 9.2 4.6 4.6 0 010-9.2zm0 1.8a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6zm4.8-2.1a1.07 1.07 0 110 2.15 1.07 1.07 0 010-2.15z" />
          </svg>
        </a>
      </div>
    </header>
  )
}

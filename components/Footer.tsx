import Link from 'next/link'

export default function Footer({ siteTitle = 'Controluce', instagramUrl }: { siteTitle?: string | null; instagramUrl?: string | null }) {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-[#4A392A] bg-ink text-bg">
      <div className="footer-light" aria-hidden="true" />
      <div className="wrap relative z-10 grid grid-cols-1 gap-10 py-14 md:grid-cols-3 md:gap-12 md:py-16">
        <div>
          <Link href="/" className="footer-brand inline-block font-display text-3xl tracking-tight text-bg transition-colors hover:text-ochre">
            {siteTitle || 'Controluce'}
          </Link>
          <p className="mt-4 max-w-[34ch] font-serif text-base leading-relaxed text-[#D5C7B7]">
            Storie, riflessioni e piccoli rituali di vita quotidiana, raccontati con uno sguardo personale.
          </p>
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-[#B9A184]">Uno sguardo oltre la superficie</p>
        </div>

        <nav aria-label="Navigazione footer" className="flex flex-col items-start gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D5C7B7] md:mx-auto">
          <p className="mb-1 text-[9px] tracking-[0.25em] text-ochre">Esplora</p>
          <Link href="/" className="footer-link nav-link transition-colors hover:text-ochre">Home</Link>
          <Link href="/about" className="footer-link nav-link transition-colors hover:text-ochre">Chi sono</Link>
          <Link href="/articoli" className="footer-link nav-link transition-colors hover:text-ochre">Articoli</Link>
          <Link href="/scrivimi" className="footer-link nav-link transition-colors hover:text-ochre">Parliamone</Link>
          <Link href="/rss" className="footer-link nav-link transition-colors hover:text-ochre">Feed RSS</Link>
        </nav>

        <div className="md:text-right">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.25em] text-ochre">Resta in ascolto</p>
          <p className="mb-5 max-w-[31ch] font-serif leading-relaxed text-[#D5C7B7] md:ml-auto">
            Prenditi il tempo per leggere. Le storie nuove ti aspettano qui.
          </p>
          {instagramUrl ? (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-link nav-link inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-bg transition-colors hover:text-ochre">Instagram ↗</a>
          ) : (
            <Link href="/rss" className="footer-link nav-link inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-bg transition-colors hover:text-ochre">Ricevi gli aggiornamenti ↗</Link>
          )}
        </div>
      </div>

      <div className="wrap relative z-10 flex flex-col gap-3 border-t border-[#554435] py-5 text-[11px] text-[#B9A99A] sm:flex-row sm:items-center sm:justify-between">
        <span>
          &copy; {new Date().getFullYear()} {siteTitle || 'Controluce'}. Tutti i diritti riservati.
        </span>
        <Link href="/privacy-policy" className="footer-link nav-link w-fit transition-colors hover:text-ochre">Privacy Policy</Link>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { getCategoryEditorialInfo } from '@/lib/seo/categories'

type FooterCategory = { title: string; slug: string; count: number }

export default function Footer({ siteTitle = 'Controluce', instagramUrl, categories = [] }: { siteTitle?: string | null; instagramUrl?: string | null; categories?: FooterCategory[] }) {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-[#4A392A] bg-ink text-bg">
      <div className="footer-light" aria-hidden="true" />
      <div className="wrap relative z-10 grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.1fr_0.8fr_1.1fr] md:gap-12 md:py-16">
        <div>
          <Link href="/" className="footer-brand inline-block font-display text-3xl tracking-tight text-bg transition-colors hover:text-[#D5B27F]">
            {siteTitle || 'Controluce'}
          </Link>
          <p className="mt-4 max-w-[34ch] font-serif text-base leading-relaxed text-[#D5C7B7]">
            Storie, riflessioni e piccoli rituali di vita quotidiana, raccontati con uno sguardo personale.
          </p>
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-[#B9A184]">Uno sguardo oltre la superficie</p>
        </div>

        <nav aria-label="Navigazione footer" className="flex flex-col items-start gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D5C7B7] md:mx-auto">
          <p className="mb-1 text-[9px] tracking-[0.25em] text-[#D5B27F]">Esplora</p>
          <Link href="/" className="footer-link nav-link transition-colors hover:text-[#D5B27F]">Home</Link>
          <Link href="/about" className="footer-link nav-link transition-colors hover:text-[#D5B27F]">Chi sono</Link>
          <Link href="/articoli" className="footer-link nav-link transition-colors hover:text-[#D5B27F]">Articoli</Link>
          <Link href="/scrivimi" className="footer-link nav-link transition-colors hover:text-[#D5B27F]">Parliamone</Link>
        </nav>

        <div className="md:text-right">
          {categories.length > 0 && (
            <nav aria-label="Categorie del blog" className="mb-8">
              <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.25em] text-[#D5B27F]">Esplora per tema</p>
              <div className="flex flex-wrap gap-x-4 gap-y-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#D5C7B7] md:justify-end">
                {categories.map((category) => (
                  <Link key={category.slug} href={`/categoria/${category.slug}`} className="footer-link nav-link transition-colors hover:text-[#D5B27F]">
                    {getCategoryEditorialInfo(category.slug, category.title).label} ({category.count})
                  </Link>
                ))}
              </div>
            </nav>
          )}
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.25em] text-[#D5B27F]">Segui e partecipa</p>
          <p className="mb-5 max-w-[34ch] font-serif leading-relaxed text-[#D5C7B7] md:ml-auto">
            Puoi seguire i nuovi articoli tramite il feed RSS{instagramUrl ? ' e trovare gli aggiornamenti anche su Instagram' : ''}. Per condividere un pensiero o suggerire un tema, c&apos;è lo spazio Parliamone.
          </p>
          <nav aria-label="Canali e contatti" className="flex flex-wrap gap-x-5 gap-y-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bg md:justify-end">
            <Link href="/rss" className="footer-link nav-link inline-block transition-colors hover:text-[#D5B27F]">Feed RSS ↗</Link>
            <Link href="/scrivimi" className="footer-link nav-link inline-block transition-colors hover:text-[#D5B27F]">Parliamone ↗</Link>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-link nav-link inline-block transition-colors hover:text-[#D5B27F]">
                Instagram ↗
              </a>
            )}
          </nav>
        </div>
      </div>

      <div className="wrap relative z-10 flex flex-col gap-3 border-t border-[#554435] py-5 text-[11px] text-[#B9A99A] sm:flex-row sm:items-center sm:justify-between">
        <span>
          &copy; {new Date().getFullYear()} {siteTitle || 'Controluce'}. Tutti i diritti riservati.
        </span>
        <Link href="/privacy-policy" className="footer-link nav-link w-fit transition-colors hover:text-[#D5B27F]">Privacy Policy</Link>
      </div>
    </footer>
  )
}

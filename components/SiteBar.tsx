import Link from 'next/link'

const LINKS = [
  { href: '/articoli', label: 'Articoli' },
  { href: '/about', label: 'Chi sono' },
  { href: '/scrivimi', label: 'Parliamone' },
]

/** Barra compatta: la visibilità e lo stato del link sono coordinati dal controller pubblico. */
export default function SiteBar({ siteTitle = 'Controluce' }: { siteTitle?: string | null }) {
  const title = siteTitle || 'Controluce'
  return (
    <div className="site-bar" data-visible="false">
      <div className="wrap flex min-h-[52px] flex-row items-center justify-between gap-3 py-2 sm:h-[52px] sm:gap-6 sm:py-0">
        <Link href="/" className="w-fit max-w-[36%] shrink truncate font-display text-base leading-none tracking-tight text-ink sm:max-w-none sm:text-xl" aria-label={`${title} — homepage`}>
          {title === 'Controluce' ? <>Contro<span className="italic text-[#765338]">luce</span></> : title}
        </Link>
        <nav data-site-navigation aria-label="Navigazione rapida" className="flex min-w-0 flex-1 items-center justify-end gap-1 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.04em] text-ink-soft sm:w-auto sm:flex-none sm:justify-start sm:gap-6 sm:text-[10px] sm:tracking-[0.2em]">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link flex min-h-[44px] items-center px-1 transition-colors hover:text-wine aria-[current=page]:text-wine">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

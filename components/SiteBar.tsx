'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '/articoli', label: 'Articoli' },
  { href: '/about', label: 'Chi sono' },
  { href: '/scrivimi', label: 'Parliamone' },
]

/** Barra compatta che compare dopo la testata: navigazione sempre a portata di mano. */
export default function SiteBar({ siteTitle = 'Controluce' }: { siteTitle?: string | null }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setVisible(window.scrollY > 280)
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  const title = siteTitle || 'Controluce'
  return (
    <div className="site-bar" data-visible={visible}>
      <div className="wrap flex min-h-[52px] flex-col items-stretch justify-center gap-1 py-2 sm:h-[52px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0">
        <Link href="/" className="w-fit font-display text-lg leading-none tracking-tight text-ink sm:text-xl" aria-label={`${title} — homepage`}>
          {title === 'Controluce' ? <>Contro<span className="italic text-[#765338]">luce</span></> : title}
        </Link>
        <nav aria-label="Navigazione rapida" className="flex w-full items-center justify-between gap-2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft sm:w-auto sm:justify-start sm:gap-6 sm:text-[10px] sm:tracking-[0.2em]">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className="nav-link flex min-h-[32px] items-center py-2 transition-colors hover:text-wine aria-[current=page]:text-wine">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

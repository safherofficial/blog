'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '/articoli', label: 'Articoli' },
  { href: '/about', label: 'Chi sono' },
  { href: '/scrivimi', label: 'Raccontamelo' },
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
      <div className="wrap flex h-[52px] items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl leading-none tracking-tight text-ink" aria-label={`${title} — homepage`}>
          {title === 'Controluce' ? <>Contro<span className="italic text-[#765338]">luce</span></> : title}
        </Link>
        <nav aria-label="Navigazione rapida" className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className="nav-link py-2 transition-colors hover:text-wine aria-[current=page]:text-wine">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

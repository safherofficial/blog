'use client'

import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY > 500)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      aria-label="Torna all'inizio della pagina"
      title="Torna su"
      className="scroll-top-control fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center border border-ochre bg-ink text-bg"
    >
      <span aria-hidden="true" className="font-mono text-xs">↑</span>
    </button>
  )
}

'use client'

import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Torna su"
      className="fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center border border-ochre bg-ink text-bg transition-colors hover:bg-wine"
    >
      <span aria-hidden className="font-mono text-[10px] uppercase tracking-widest">
        Su
      </span>
    </button>
  )
}

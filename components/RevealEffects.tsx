'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Coordinates non-critical public-page enhancements through one scroll loop.
 * Route-aware scans replace the previous subtree MutationObserver.
 */
export default function RevealEffects() {
  const pathname = usePathname()
  const lastTrackedPath = useRef('')
  const scanRevealElements = useRef<(() => void) | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const root = document.documentElement
    const siteBar = document.querySelector<HTMLElement>('.site-bar')
    const backToTop = document.querySelector<HTMLElement>('[data-back-to-top]')

    let pointerFrame = 0
    let scrollFrame = 0
    let pointerX = window.innerWidth * 0.58
    let pointerY = window.innerHeight * 0.24
    let observer: IntersectionObserver | undefined
    const observed = new WeakSet<Element>()

    const paintPointer = () => {
      root.style.setProperty('--pointer-x', `${pointerX}px`)
      root.style.setProperty('--pointer-y', `${pointerY}px`)
      pointerFrame = 0
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintPointer)
    }

    const observeRevealElements = (scope: ParentNode) => {
      const elements: Element[] = []
      if (scope instanceof Element && scope.matches('.reveal-on-scroll')) elements.push(scope)
      scope.querySelectorAll('.reveal-on-scroll').forEach((element) => elements.push(element))

      for (const element of elements) {
        if (observed.has(element)) continue
        observed.add(element)
        if (observer) observer.observe(element)
        else element.classList.add('is-visible')
      }
    }

    if (!reducedMotion && finePointer && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        }
      }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 })
      root.classList.add('has-reveal-motion')
    }

    scanRevealElements.current = () => observeRevealElements(document)

    const paintScrollState = () => {
      const scrollY = window.scrollY
      if (siteBar) siteBar.dataset.visible = String(scrollY > 280)
      if (backToTop) backToTop.dataset.visible = String(scrollY > 500)

      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollableHeight > 0
        ? Math.min(1, Math.max(0, scrollY / scrollableHeight))
        : 0
      root.style.setProperty('--scroll-progress', String(progress))
      scrollFrame = 0
    }

    const handleScrollOrResize = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScrollState)
    }

    if (finePointer && !reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
      paintPointer()
    }

    window.addEventListener('scroll', handleScrollOrResize, { passive: true })
    window.addEventListener('resize', handleScrollOrResize, { passive: true })
    observeRevealElements(document)
    paintScrollState()

    return () => {
      observer?.disconnect()
      scanRevealElements.current = null
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScrollOrResize)
      window.removeEventListener('resize', handleScrollOrResize)
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      root.classList.remove('has-reveal-motion')
      root.style.removeProperty('--scroll-progress')
    }
  }, [])

  useEffect(() => {
    if (!pathname) return

    // App Router commits the new page before this effect runs, so newly rendered
    // reveal elements can be observed without watching every DOM mutation.
    scanRevealElements.current?.()

    document.querySelectorAll<HTMLAnchorElement>('[data-site-navigation] a[href]').forEach((link) => {
      const linkPath = new URL(link.href, window.location.origin).pathname
      if (linkPath === pathname) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })

    if (pathname.startsWith('/stats') || pathname.startsWith('/api/') || lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname

    const params = new URLSearchParams(window.location.search)
    let referrerHost = ''
    if (document.referrer) {
      try {
        referrerHost = new URL(document.referrer).hostname
      } catch {
        referrerHost = ''
      }
    }

    const payload = {
      path: pathname,
      referrerHost,
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
    }
    const sendAnalytics = () => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      }).catch(() => {})
    }

    // Analytics is non-blocking; use idle time with a bounded fallback.
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    }
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(sendAnalytics, { timeout: 1500 })
    } else {
      window.setTimeout(sendAnalytics, 500)
    }
  }, [pathname])

  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <span className="reading-progress__fill" />
      </div>
      <div className="ambient-light" aria-hidden="true" />
    </>
  )
}

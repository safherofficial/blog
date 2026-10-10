'use client'

import { useEffect } from 'react'

/**
 * Dependency-free motion for the public editorial experience.
 * Keeps effects light, respects reduced-motion preferences and avoids
 * doing layout work on every pointer/scroll event.
 */
export default function RevealEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const root = document.documentElement

    let pointerFrame = 0
    let scrollFrame = 0
    let pointerX = window.innerWidth * 0.58
    let pointerY = window.innerHeight * 0.24

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

    const paintScrollProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollableHeight > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
        : 0
      root.style.setProperty('--scroll-progress', String(progress))
      scrollFrame = 0
    }

    const handleScrollOrResize = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScrollProgress)
    }

    let observer: IntersectionObserver | undefined
    const observed = new WeakSet<Element>()

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

    if (!reducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        }
      }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 })
      observeRevealElements(document)
      root.classList.add('has-reveal-motion')
    }

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) observeRevealElements(node)
        })
      }
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    if (finePointer && !reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
      paintPointer()
    }

    window.addEventListener('scroll', handleScrollOrResize, { passive: true })
    window.addEventListener('resize', handleScrollOrResize, { passive: true })
    paintScrollProgress()

    return () => {
      observer?.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScrollOrResize)
      window.removeEventListener('resize', handleScrollOrResize)
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      root.classList.remove('has-reveal-motion')
      root.style.removeProperty('--scroll-progress')
    }
  }, [])

  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <span className="reading-progress__fill" />
      </div>
      <div className="ambient-light" aria-hidden="true" />
    </>
  )
}

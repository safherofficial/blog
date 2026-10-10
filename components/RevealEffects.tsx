'use client'

import { useEffect } from 'react'

/**
 * Small, dependency-free interactions for the public editorial experience.
 * Keeps the visual treatment subtle and respects the user's motion preferences.
 */
export default function RevealEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const root = document.documentElement

    let frame = 0
    let pointerX = window.innerWidth * 0.58
    let pointerY = window.innerHeight * 0.24

    const paintPointer = () => {
      root.style.setProperty('--pointer-x', `${pointerX}px`)
      root.style.setProperty('--pointer-y', `${pointerY}px`)
      frame = 0
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(paintPointer)
    }

    let observer: IntersectionObserver | undefined
    const observed = new WeakSet<Element>()

    const observeRevealElements = (scope: ParentNode) => {
      const elements: Element[] = []
      if (scope instanceof Element && scope.matches('.reveal-on-scroll')) elements.push(scope)
      scope.querySelectorAll?.('.reveal-on-scroll').forEach((element) => elements.push(element))

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

    return () => {
      observer?.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      if (frame) window.cancelAnimationFrame(frame)
      root.classList.remove('has-reveal-motion')
    }
  }, [])

  return <div className="ambient-light" aria-hidden="true" />
}

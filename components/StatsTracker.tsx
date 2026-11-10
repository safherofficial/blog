'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function visitorId(): string {
  const key = 'controluce_visitor'
  let id = localStorage.getItem(key)
  if (!id) {
    id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    localStorage.setItem(key, id)
  }
  return id
}

export default function StatsTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || pathname.startsWith('/stats') || pathname.startsWith('/api/')) return
    const key = `controluce_viewed:${pathname}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    const params = new URLSearchParams(window.location.search)
    fetch('/api/analytics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname, visitorId: visitorId(), referrer: document.referrer,
        utmSource: params.get('utm_source') || '', utmMedium: params.get('utm_medium') || '',
        utmCampaign: params.get('utm_campaign') || '',
      }),
      keepalive: true, credentials: 'same-origin',
    }).catch(() => {})
  }, [pathname])
  return null
}

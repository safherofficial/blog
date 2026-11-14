'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function StatsTracker() {
  const pathname = usePathname()
  const lastPath = useRef('')
  useEffect(() => {
    if (!pathname || pathname.startsWith('/stats') || pathname.startsWith('/api/') || lastPath.current === pathname) return
    lastPath.current = pathname
    const params = new URLSearchParams(window.location.search)
    let referrerHost = ''
    if (document.referrer) {
      try {
        referrerHost = new URL(document.referrer).hostname
      } catch {
        referrerHost = ''
      }
    }
    fetch('/api/analytics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname, referrerHost,
        utmSource: params.get('utm_source') || '', utmMedium: params.get('utm_medium') || '',
        utmCampaign: params.get('utm_campaign') || '',
      }),
      keepalive: true, credentials: 'omit',
    }).catch(() => {})
  }, [pathname])
  return null
}

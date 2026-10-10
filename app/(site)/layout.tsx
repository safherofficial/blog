import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import RevealEffects from '@/components/RevealEffects'
import { getSiteSettings } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null)
  const siteTitle = settings?.siteTitle || 'Controluce'

  return (
    <div className="site-shell">
      <RevealEffects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: siteTitle,
            author: settings?.authorName ? { '@type': 'Person', name: settings.authorName } : undefined,
          }),
        }}
      />
      <Header siteTitle={siteTitle} instagramUrl={settings?.instagramUrl} />
      <div className="site-page-transition">{children}</div>
      <Footer siteTitle={siteTitle} authorName={settings?.authorName} instagramUrl={settings?.instagramUrl} />
      <BackToTop />
    </div>
  )
}

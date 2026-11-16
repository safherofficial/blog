import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import SiteBar from '@/components/SiteBar'
import RevealEffects from '@/components/RevealEffects'
import StatsTracker from '@/components/StatsTracker'
import { getPublishedCategories, getSiteSettings } from '@/lib/db'
import { safeJsonLd } from '@/lib/content/safe-json'
import { siteGraphJsonLd } from '@/lib/seo/jsonld'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSiteSettings().catch(() => null),
    getPublishedCategories().catch(() => []),
  ])
  const siteTitle = settings?.siteTitle || 'Controluce'
  return (
    <div className="site-shell">
      <StatsTracker />
      <RevealEffects />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(siteGraphJsonLd(settings)) }} />
      <a href="#contenuto" className="skip-link">Vai al contenuto</a>
      <Header siteTitle={siteTitle} instagramUrl={settings?.instagramUrl} />
      <SiteBar siteTitle={siteTitle} />
      <main id="contenuto" tabIndex={-1} className="site-page-transition">{children}</main>
      <Footer siteTitle={siteTitle} instagramUrl={settings?.instagramUrl} categories={categories} />
      <BackToTop />
    </div>
  )
}

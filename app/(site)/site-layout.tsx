import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import { getSiteSettings } from '@/lib/sanity/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: settings?.siteTitle || 'Controluce',
            author: { '@type': 'Person', name: settings?.authorName || '[Il tuo nome]' },
          }),
        }}
      />
      <Header instagramUrl={settings?.instagramUrl} />
      {children}
      <Footer authorName={settings?.authorName} instagramUrl={settings?.instagramUrl} />
      <BackToTop />
    </>
  )
}

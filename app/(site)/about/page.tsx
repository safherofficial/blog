import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/db'
import { shortText } from '@/lib/content/article'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd, personJsonLd } from '@/lib/seo/jsonld'
import { absoluteUrl } from '@/lib/seo/site'
import { pageMetadata } from '@/lib/seo/metadata'
import CropFrame from '@/components/CropFrame'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null)
  const name = settings?.authorName?.trim()
  const bio = shortText(settings?.authorBio, 155)
  return pageMetadata({
    title: name ? `Chi sono — ${name}` : 'Chi sono',
    description: bio || `Scopri chi c'è dietro ${settings?.siteTitle || 'Controluce'}: uno spazio di storie, riflessioni e piccoli rituali di vita quotidiana.`,
    path: '/about',
    image: settings?.authorPhoto?.url,
    imageAlt: settings?.authorPhoto?.alt || undefined,
  })
}

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <section className="about-page py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'ProfilePage',
                '@id': absoluteUrl('/about#profile'),
                url: absoluteUrl('/about'),
                name: settings?.authorName ? `Chi sono — ${settings.authorName}` : 'Chi sono',
                inLanguage: 'it-IT',
                ...(personJsonLd(settings) ? { mainEntity: { '@id': absoluteUrl('/#author') } } : {}),
              },
              breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Chi sono', path: '/about' }]),
            ],
          }),
        }}
      />
      <div className="wrap grid grid-cols-1 items-center gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <div className="editorial-media-frame reveal-on-scroll relative aspect-[4/5] overflow-hidden border border-line bg-gradient-to-br from-ochre to-wine">
          <CropFrame />
          <Image
            src={settings?.authorPhoto?.url || '/images/controluce-hero.webp'}
            alt={
              settings?.authorPhoto
                ? settings.authorPhoto.alt || settings.authorName || 'Foto profilo'
                : 'Ritratto in controluce di una donna di profilo, con luce ambrata sui capelli'
            }
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
            unoptimized={Boolean(settings?.authorPhoto)}
            className="object-cover object-[14%_center]"
          />
        </div>
        <div className="reveal-on-scroll">
          <p className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">
            <span className="inline-block h-px w-8 bg-ochre" />
            Chi c&apos;è dietro Controluce
          </p>
          <h1 className="mb-7 max-w-[19ch] font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            {settings?.authorName ? `Ciao, sono ${settings.authorName}.` : 'Uno sguardo personale sulle cose di ogni giorno.'}
          </h1>
          {settings?.authorBio ? (
            <div className="mb-9 max-w-[62ch] space-y-5 font-serif text-lg leading-relaxed text-ink-soft [&_p]:mb-5">
              <PortableText value={settings.authorBio} />
            </div>
          ) : (
            <p className="mb-9 max-w-[54ch] font-serif text-lg leading-relaxed text-ink-soft">
              Controluce è uno spazio dedicato a storie, riflessioni e piccoli rituali della vita quotidiana. Un luogo per rallentare, osservare meglio e trovare significati anche nelle cose più semplici.
            </p>
          )}
          <Link
            href="/#articoli"
            className="editorial-button inline-flex items-center gap-4 border border-wine bg-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-bg hover:border-wine-dark hover:bg-wine-dark"
          >
            Leggi gli articoli <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

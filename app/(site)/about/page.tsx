import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/sanity/queries'
import { urlForImage } from '@/lib/sanity/image'
import CropFrame from '@/components/CropFrame'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Chi sono',
  description: 'Scopri chi c\'è dietro Controluce.',
}

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <section className="py-20 md:py-24">
      <div className="wrap grid grid-cols-1 items-center gap-14 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-ochre to-wine">
          <CropFrame />
          {settings?.authorPhoto && (
            <Image
              src={urlForImage(settings.authorPhoto).width(700).height(875).url()}
              alt={settings.authorName || 'Foto profilo'}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-wine">Chi c&apos;è dietro Controluce</p>
          <h1 className="mb-6 font-display text-4xl md:text-5xl">Ciao, sono {settings?.authorName || '[Il tuo nome]'}.</h1>
          {settings?.authorBio ? (
            <div className="mb-8 max-w-[62ch] space-y-5 font-serif text-lg leading-relaxed text-ink-soft [&_p]:mb-5">
              <PortableText value={settings.authorBio} />
            </div>
          ) : (
            <p className="mb-8 text-ink-soft">
              La biografia si modifica da /studio → Impostazioni del sito → Biografia.
            </p>
          )}
          <Link
            href="/#articoli"
            className="inline-block border border-wine bg-wine px-7 py-3.5 font-mono text-[13px] uppercase tracking-widest text-white hover:bg-wine-dark"
          >
            Leggi gli articoli
          </Link>
        </div>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/sanity/queries'
import { urlForImage } from '@/lib/sanity/image'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Chi sono',
  description: 'Scopri chi c\'è dietro Controluce.',
}

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <section className="py-16 md:py-20">
      <div className="wrap grid grid-cols-1 items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-ochre to-wine">
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
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-wine">Chi c&apos;è dietro Controluce</p>
          <h1 className="mb-5 font-display text-4xl">Ciao, sono {settings?.authorName || '[Il tuo nome]'}.</h1>
          {settings?.authorBio ? (
            <div className="mb-6 space-y-4 text-ink-soft [&_p]:mb-4">
              <PortableText value={settings.authorBio} />
            </div>
          ) : (
            <p className="mb-6 text-ink-soft">
              La biografia si modifica da /studio → Impostazioni del sito → Biografia.
            </p>
          )}
          <Link
            href="/#articoli"
            className="inline-block border border-wine bg-wine px-6 py-3 font-mono text-[13px] uppercase tracking-wider text-white hover:bg-wine-dark"
          >
            Leggi gli articoli
          </Link>
        </div>
      </div>
    </section>
  )
}

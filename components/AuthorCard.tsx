import Image from 'next/image'
import Link from 'next/link'
import { shortText } from '@/lib/content/article'
import type { SiteSettings } from '@/lib/db'

export default function AuthorCard({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.authorName?.trim()
  if (!name) return null
  const bio = shortText(settings?.authorBio)
  return (
    <aside aria-label="L’autrice" className="author-card flex flex-col gap-5 border border-line bg-bg-soft/50 p-6 sm:flex-row sm:items-center">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ochre/50 bg-ink">
        {settings?.authorPhoto?.url ? (
          <Image src={settings.authorPhoto.url} alt={settings.authorPhoto.alt || name} fill unoptimized sizes="80px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-3xl italic text-[#D5B27F]" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Scritto da</p>
        <p className="font-display text-2xl leading-tight">{name}</p>
        {bio && <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">{bio}</p>}
        <Link href="/about" className="nav-link mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-wine">Scopri di più ↗</Link>
      </div>
    </aside>
  )
}

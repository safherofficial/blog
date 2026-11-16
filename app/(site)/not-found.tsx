import type { Metadata } from 'next'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { getLatestPosts } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Pagina non trovata',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const posts = await getLatestPosts(3).catch(() => [])
  return (
    <section className="not-found-page">
      <div className="category-masthead py-20 md:py-28">
        <div className="wrap text-center">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#D9B47F]">Errore 404</p>
          <h1 className="mx-auto max-w-[18ch] font-display text-5xl leading-[1.05] tracking-tight text-[#F5EFE5] md:text-7xl">
            Qui la luce <em className="italic text-[#D9B78A]">non arriva.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] font-serif text-lg leading-relaxed text-[#D9C9B7]">
            La pagina che cerchi non esiste più o non è mai esistita. Puoi tornare alla home oppure scegliere un articolo da leggere.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="hero-cta inline-flex items-center gap-3 border border-[#D3AB76] bg-[#D3AB76] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#211A15]">Torna alla home</Link>
            <Link href="/articoli" className="nav-link font-mono text-[11px] uppercase tracking-[0.18em] text-[#E5D4C0]">Tutti gli articoli ↗</Link>
          </div>
        </div>
      </div>
      {posts.length > 0 && (
        <div className="wrap py-16 md:py-24">
          <h2 className="mb-8 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Forse cercavi uno di questi</h2>
          <div className="grid grid-cols-1 gap-x-9 gap-y-14 md:grid-cols-3">
            {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
          </div>
        </div>
      )}
    </section>
  )
}

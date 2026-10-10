import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import type { PortableTextBlock } from '@/lib/db'
import CropFrame from './CropFrame'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-6">{children}</p>,
    h2: ({ children }) => <h2 className="mt-14 mb-5 font-display text-3xl italic">{children}</h2>,
    blockquote: ({ children }) => (
      <blockquote className="my-12 border-l-[3px] border-ochre py-1 pl-7 font-display text-2xl italic text-wine">
        {children}
      </blockquote>
    ),
  },
  types: {
    image: ({ value }) => (
      <figure className="editorial-media-frame reveal-on-scroll relative my-14 aspect-video overflow-hidden border border-line">
        <CropFrame />
        <Image src={value.url} alt={value.alt || ''} fill unoptimized sizes="(max-width: 760px) 100vw, 720px" className="object-cover" />
        {value.alt && <figcaption className="absolute bottom-4 left-4 z-10 max-w-[80%] bg-ink/75 px-3 py-2 font-mono text-[10px] tracking-wide text-bg">{value.alt}</figcaption>}
      </figure>
    ),
  },
}

export default function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <div className="article-prose font-serif text-[19px] leading-[1.85] text-ink"><PortableText value={value as any} components={components} /></div>
}

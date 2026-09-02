import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import type { PortableTextBlock } from '@/lib/db'
import CropFrame from './CropFrame'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-6">{children}</p>,
    h2: ({ children }) => <h2 className="mt-14 mb-5 font-display text-3xl italic">{children}</h2>,
    blockquote: ({ children }) => <blockquote className="my-12 border-l-[3px] border-ochre py-1 pl-7 font-display text-2xl italic text-wine">{children}</blockquote>,
  },
  types: {
    image: ({ value }) => (
      <div className="relative my-12 aspect-video overflow-hidden">
        <CropFrame />
        <Image src={value.url} alt={value.alt || ''} fill unoptimized className="object-cover" />
      </div>
    ),
  },
}

export default function PostBody({ value }: { value: PortableTextBlock[] }) {
  return <div className="article-prose font-serif text-[19px] leading-[1.85] text-ink"><PortableText value={value as any} components={components} /></div>
}

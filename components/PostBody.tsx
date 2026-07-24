import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/lib/sanity/image'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-6">{children}</p>,
    h2: ({ children }) => <h2 className="mt-12 mb-4 font-display text-3xl">{children}</h2>,
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l-[3px] border-wine py-1 pl-6 font-display text-2xl italic text-wine">
        {children}
      </blockquote>
    ),
  },
  types: {
    image: ({ value }) => (
      <div className="relative my-10 aspect-video overflow-hidden">
        <Image
          src={urlForImage(value).width(1200).url()}
          alt={value.alt || ''}
          fill
          className="object-cover"
        />
      </div>
    ),
  },
}

export default function PostBody({ value }: { value: any[] }) {
  return (
    <div className="article-prose text-lg">
      <PortableText value={value} components={components} />
    </div>
  )
}

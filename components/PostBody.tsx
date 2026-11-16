import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import type { PortableTextBlock } from '@/lib/db'
import { getHeadings } from '@/lib/content/article'
import CropFrame from './CropFrame'
import { isUploadedCoverImageUrl } from '@/lib/content/images'

export default function PostBody({ value }: { value: PortableTextBlock[] }) {
  const idByKey = new Map(getHeadings(value).map((heading) => [heading.key, heading.id]))

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className="mb-6">{children}</p>,
      h2: ({ children, value: block }) => {
        const id = idByKey.get(block._key ?? '')
        return (
          <h2 id={id} className="group relative mt-14 mb-5 font-display text-3xl italic">
            {children}
            {id && <a href={`#${id}`} className="heading-anchor" aria-label="Link diretto a questa sezione">#</a>}
          </h2>
        )
      },
      blockquote: ({ children }) => (
        <blockquote className="my-12 border-l-[3px] border-ochre py-1 pl-7 font-display text-2xl italic text-wine">
          {children}
        </blockquote>
      ),
    },
    types: {
      image: ({ value: image }) => (
        <figure className="article-figure editorial-media-frame reveal-on-scroll relative my-14 aspect-video overflow-hidden border border-line">
          <CropFrame />
          <Image src={image.url} alt={image.alt || ''} fill quality={90} unoptimized={!isUploadedCoverImageUrl(image.url)} sizes="(max-width: 640px) calc(100vw - 44px), (max-width: 767px) calc(100vw - 66px), (max-width: 1099px) 740px, 868px" className="object-cover" />
          {image.alt && <figcaption className="absolute bottom-4 left-4 z-10 max-w-[80%] bg-ink/75 px-3 py-2 font-mono text-[10px] tracking-wide text-bg">{image.alt}</figcaption>}
        </figure>
      ),
    },
  }

  return (
    <div className="article-prose font-serif text-[18px] leading-[1.9] text-ink sm:text-[19px]">
      <PortableText value={value as any} components={components} />
    </div>
  )
}

import type { PortableTextBlock } from '@/lib/db'

export type Category = { id: string; title: string; slug: string }

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url?: string | null
  cover_image_alt?: string | null
  category_id?: string | null
  category_title?: string | null
  published_at: string
  published: boolean
  body?: PortableTextBlock[] | null
  seo_title?: string | null
  seo_description?: string | null
}

export type SiteSettingsRow = {
  site_title?: string | null
  tagline?: string | null
  author_name?: string | null
  author_bio?: PortableTextBlock[] | null
  author_photo_url?: string | null
  author_photo_alt?: string | null
  instagram_url?: string | null
  signature_quote?: string | null
}

export type PostStatus = 'draft' | 'scheduled' | 'published'

export function postStatus(post: Pick<Post, 'published' | 'published_at'>): PostStatus {
  if (!post.published) return 'draft'
  return new Date(post.published_at).getTime() > Date.now() ? 'scheduled' : 'published'
}

export const STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Bozza',
  scheduled: 'Programmato',
  published: 'Pubblicato',
}

export type Notify = (kind: 'success' | 'error' | 'info', text: string) => void

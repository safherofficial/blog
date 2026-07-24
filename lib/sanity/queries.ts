import { client } from './client'

export type PostSummary = {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: any
  publishedAt: string
  category?: { title: string; slug: string } | null
}

export type PostFull = PostSummary & {
  body: any[]
  seoTitle?: string
  seoDescription?: string
}

export type SiteSettings = {
  siteTitle: string
  tagline?: string
  authorName?: string
  authorBio?: any[]
  authorPhoto?: any
  instagramUrl?: string
  signatureQuote?: string
}

const postSummaryFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  "category": category->{ title, "slug": slug.current }
`

export async function getAllPosts(): Promise<PostSummary[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) { ${postSummaryFields} }`
  )
}

export async function getLatestPosts(limit = 3): Promise<PostSummary[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...$limit] { ${postSummaryFields} }`,
    { limit }
  )
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { ${postSummaryFields}, body, seoTitle, seoDescription }`,
    { slug }
  )
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: string[] = await client.fetch(
    `*[_type == "post" && defined(slug.current)][].slug.current`
  )
  return slugs
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(`*[_type == "siteSettings"][0]`)
}

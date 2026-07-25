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

export type CategoryInfo = {
  title: string
  slug: string
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

export async function getAllCategorySlugs(): Promise<string[]> {
  const slugs: string[] = await client.fetch(
    `*[_type == "category" && defined(slug.current)][].slug.current`
  )
  return slugs
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | null> {
  return client.fetch(
    `*[_type == "category" && slug.current == $slug][0]{ title, "slug": slug.current }`,
    { slug }
  )
}

export async function getPostsByCategory(slug: string): Promise<PostSummary[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current) && category->slug.current == $slug] | order(publishedAt desc) { ${postSummaryFields} }`,
    { slug }
  )
}

export async function getRelatedPosts(
  currentId: string,
  categorySlug?: string | null,
  limit = 3
): Promise<PostSummary[]> {
  if (categorySlug) {
    const sameCategory: PostSummary[] = await client.fetch(
      `*[_type == "post" && defined(slug.current) && _id != $currentId && category->slug.current == $categorySlug] | order(publishedAt desc) [0...$limit] { ${postSummaryFields} }`,
      { currentId, categorySlug, limit }
    )
    if (sameCategory.length >= limit) return sameCategory

    const excludeIds = [currentId, ...sameCategory.map((p) => p._id)]
    const fillLimit = limit - sameCategory.length
    const fillers: PostSummary[] = await client.fetch(
      `*[_type == "post" && defined(slug.current) && !(_id in $excludeIds)] | order(publishedAt desc) [0...$fillLimit] { ${postSummaryFields} }`,
      { excludeIds, fillLimit }
    )
    return [...sameCategory, ...fillers]
  }

  return client.fetch(
    `*[_type == "post" && defined(slug.current) && _id != $currentId] | order(publishedAt desc) [0...$limit] { ${postSummaryFields} }`,
    { currentId, limit }
  )
}

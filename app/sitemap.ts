import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/db'
import { absoluteUrl } from '@/lib/seo/site'

// Refresh sitemap entries for newly published and scheduled posts without a new deployment.
export const revalidate = 300

const time = (value?: string) => (value ? new Date(value).getTime() : 0)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts().catch(() => [])

  const lastChange = (list: typeof posts) => {
    const latest = list.reduce((max, post) => Math.max(max, time(post.updatedAt || post.publishedAt)), 0)
    return latest ? new Date(latest) : undefined
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Derive populated categories from the already-fetched public posts.
  // This avoids one additional database query per category while excluding empty archives.
  const postsByCategory = new Map<string, typeof posts>()
  for (const post of posts) {
    const slug = post.category?.slug
    if (!slug) continue
    const categoryPosts = postsByCategory.get(slug)
    if (categoryPosts) categoryPosts.push(post)
    else postsByCategory.set(slug, [post])
  }

  const categoryEntries: MetadataRoute.Sitemap = [...postsByCategory.entries()].map(([slug, categoryPosts]) => ({
    url: absoluteUrl(`/categoria/${slug}`),
    lastModified: lastChange(categoryPosts),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const latest = lastChange(posts)
  return [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/articoli'), lastModified: latest, changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/scrivimi'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/privacy-policy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/rss'), changeFrequency: 'yearly', priority: 0.3 },
    ...postEntries,
    ...categoryEntries,
  ]
}

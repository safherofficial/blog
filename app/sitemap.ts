import type { MetadataRoute } from 'next'
import { getAllPosts, getAllCategorySlugs } from '@/lib/db'

const siteUrl = process.env.SITE_URL?.trim() || 'https://controluce.blog'

// Refresh sitemap entries for newly published and scheduled posts without a new deployment.
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categorySlugs] = await Promise.all([
    getAllPosts().catch(() => []),
    getAllCategorySlugs().catch(() => []),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${siteUrl}/categoria/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/articoli`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/rss`, changeFrequency: 'yearly', priority: 0.3 },
    ...postEntries,
    ...categoryEntries,
  ]
}

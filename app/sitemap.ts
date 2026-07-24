import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/sanity/queries'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.controluce-blog.it'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts().catch(() => [])

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
    ...postEntries,
  ]
}

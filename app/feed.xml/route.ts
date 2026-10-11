import { getAllPosts, getSiteSettings } from '@/lib/db'

export const revalidate = 600

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(request: Request) {
  const requestOrigin = new URL(request.url).origin
  const localRequest = new URL(request.url).hostname === 'localhost' || new URL(request.url).hostname === '127.0.0.1'
  const origin = (process.env.SITE_URL?.trim() || (localRequest ? requestOrigin : 'https://controluce.blog')).replace(/\/$/, '')
  const [posts, settings] = await Promise.all([
    getAllPosts(),
    getSiteSettings().catch(() => null),
  ])
  const title = settings?.siteTitle || 'Controluce'
  const description = settings?.tagline || 'Storie e riflessioni di vita quotidiana.'
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(`${origin}/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${origin}/blog/${post.slug}`)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(description)}</description>
    <language>it-it</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  })
}

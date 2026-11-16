import { getAllPosts, getPostBySlug, getSiteSettings } from '@/lib/db'
import { portableTextToHtml } from '@/lib/content/html'
import { getSiteUrl } from '@/lib/seo/site'
import { AUTHOR_PEN_NAME } from '@/lib/author'

export const revalidate = 600

const FULL_TEXT_ITEMS = 20

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

export async function GET(request: Request) {
  const { origin: requestOrigin, hostname } = new URL(request.url)
  const local = hostname === 'localhost' || hostname === '127.0.0.1'
  const origin = local ? requestOrigin : getSiteUrl()
  const absoluteUrl = (path: string) => origin + path
  const [posts, settings] = await Promise.all([getAllPosts(), getSiteSettings().catch(() => null)])
  const title = settings?.siteTitle || 'Controluce'
  const description = settings?.tagline || 'Storie e riflessioni di vita quotidiana.'
  const author = AUTHOR_PEN_NAME

  // Testo completo per gli articoli più recenti: lettori RSS e sistemi AI non devono tornare sul sito per leggerli.
  const latest = posts.slice(0, FULL_TEXT_ITEMS)
  const bodies = await Promise.all(latest.map((post) => getPostBySlug(post.slug).then((full) => portableTextToHtml(full?.body)).catch(() => '')))

  const items = latest.map((post, index) => {
    const link = absoluteUrl(`/blog/${post.slug}`)
    const cover = post.coverImage?.url?.startsWith('https://') ? `<p><img src="${escapeXml(post.coverImage.url)}" alt="${escapeXml(post.coverImage.alt || post.title)}" /></p>\n` : ''
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      ${bodies[index] ? `<content:encoded>${cdata(cover + bodies[index])}</content:encoded>` : ''}
      ${author ? `<dc:creator>${escapeXml(author)}</dc:creator>` : ''}
      ${post.category ? `<category>${escapeXml(post.category.title)}</category>` : ''}
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`
  }).join('')

  // La data di ultima modifica del feed è quella dell'ultimo contenuto, non l'ora della richiesta.
  const lastBuild = latest.length ? new Date(latest.reduce((max, p) => Math.max(max, new Date(p.updatedAt || p.publishedAt).getTime()), 0)) : new Date()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(origin)}</link>
    <atom:link href="${escapeXml(absoluteUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(description)}</description>
    <language>it-it</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
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

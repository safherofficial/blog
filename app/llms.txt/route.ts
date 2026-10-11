import { shortText } from '@/lib/content/article'
import { getAllPosts, getSiteSettings } from '@/lib/db'
import { absoluteUrl, DEFAULT_DESCRIPTION } from '@/lib/seo/site'

export const revalidate = 600

/**
 * Indice in Markdown pensato per assistenti e crawler AI (convenzione llms.txt):
 * presenta il sito, l'autrice e i contenuti principali con un riassunto per ciascuno.
 */
export async function GET() {
  const [posts, settings] = await Promise.all([getAllPosts().catch(() => []), getSiteSettings().catch(() => null)])
  const name = settings?.siteTitle || 'Controluce'
  const description = settings?.tagline || DEFAULT_DESCRIPTION
  const author = settings?.authorName?.trim()
  const bio = shortText(settings?.authorBio, 400)
  const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim()

  const lines = [
    `# ${name}`,
    '',
    `> ${oneLine(description)}`,
    '',
    `${name} è un blog in lingua italiana${author ? ` scritto da ${author}` : ''}. Gli articoli sono testi originali di lifestyle e vita quotidiana.`,
    ...(bio ? ['', bio] : []),
    '',
    '## Pagine principali',
    '',
    `- [Home](${absoluteUrl('/')}): presentazione e ultimi articoli`,
    `- [Tutti gli articoli](${absoluteUrl('/articoli')}): archivio completo, dal più recente`,
    `- [Chi sono](${absoluteUrl('/about')}): l’autrice e il progetto editoriale`,
    `- [Feed RSS](${absoluteUrl('/feed.xml')}): testo completo degli ultimi articoli`,
    '',
    '## Articoli',
    '',
    ...(posts.length
      ? posts.map((post) => `- [${oneLine(post.title)}](${absoluteUrl(`/blog/${post.slug}`)}): ${oneLine(post.excerpt)}`)
      : ['- Nessun articolo pubblicato al momento.']),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' },
  })
}

import { getPostBySlug } from '@/lib/db'
import { renderOgCard } from '@/lib/seo/og-card'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug).catch(() => null)
  if (!post) return new Response('Not found', { status: 404 })
  const date = new Date(post.publishedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  return renderOgCard({ eyebrow: post.category?.title || 'Dal diario', title: post.title, footer: date })
}

import { renderOgCard } from '@/lib/seo/og-card'

export const dynamic = 'force-static'

export async function GET() {
  return renderOgCard({
    eyebrow: 'Diario editoriale',
    title: 'Piccole cose, guardate meglio.',
    footer: 'Storie, riflessioni e piccoli rituali di vita quotidiana',
  })
}

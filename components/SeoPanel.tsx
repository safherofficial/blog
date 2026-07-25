import React, {useMemo} from 'react'
import {Badge, Box, Card, Flex, Stack, Text} from '@sanity/ui'

type SeoStatus = 'good' | 'warning' | 'error'

interface SeoCheck {
  label: stringimport React, {useMemo} from 'react'
import {Badge, Box, Card, Flex, Stack, Text} from import React, {useMemo} from 'react'
import {Badge, Box, Card, Flex, Stack, Text} from '@sanity/ui'

type SeoStatus = 'good' | 'warning' | 'error'

interface SeoCheck {
  label: string
  status: SeoStatus
  message: string
}

function plainTextFromBody(blocks: any[] = []): string {
  return blocks
    .filter((b) => b && b._type === 'block')
    .map((b) => (b.children || []).map((c: any) => c.text || '').join(''))
    .join('\n\n')
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length
}

function statusTone(status: SeoStatus): 'positive' | 'caution' | 'critical' {
  if (status === 'good') return 'positive'
  if (status === 'warning') return 'caution'
  return 'critical'
}

function statusLabel(status: SeoStatus): string {
  if (status === 'good') return 'OK'
  if (status === 'warning') return 'Da migliorare'
  return 'Manca'
}

export default function SeoPanel(props: any) {
  const doc = (props && props.document && props.document.displayed) || {}

  const checks: SeoCheck[] = useMemo(() => {
    const result: SeoCheck[] = []

    const seoTitle = doc.seoTitle || doc.title || ''
    if (!seoTitle) {
      result.push({
        label: 'Titolo SEO',
        status: 'error',
        message: 'Manca sia il titolo che il titolo SEO.',
      })
    } else if (seoTitle.length < 40) {
      result.push({
        label: 'Titolo SEO',
        status: 'warning',
        message: seoTitle.length + ' caratteri: un po corto, punta a 40-60.',
      })
    } else if (seoTitle.length > 60) {
      result.push({
        label: 'Titolo SEO',
        status: 'warning',
        message: seoTitle.length + ' caratteri: Google potrebbe tagliarlo, punta a 40-60.',
      })
    } else {
      result.push({
        label: 'Titolo SEO',
        status: 'good',
        message: seoTitle.length + ' caratteri: lunghezza ideale.',
      })
    }

    const metaDesc = doc.seoDescription || doc.excerpt || ''
    if (!metaDesc) {
      result.push({
        label: 'Meta description',
        status: 'error',
        message: 'Manca sia l anteprima che la descrizione SEO.',
      })
    } else if (metaDesc.length < 120) {
      result.push({
        label: 'Meta description',
        status: 'warning',
        message: metaDesc.length + ' caratteri: un po corta, punta a 120-160.',
      })
    } else if (metaDesc.length > 160) {
      result.push({
        label: 'Meta description',
        status: 'warning',
        message: metaDesc.length + ' caratteri: verra tagliata nei risultati Google, punta a 120-160.',
      })
    } else {
      result.push({
        label: 'Meta description',
        status: 'good',
        message: metaDesc.length + ' caratteri: lunghezza ideale.',
      })
    }

    const slug = doc.slug && doc.slug.current
    if (!slug) {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'error',
        message: 'Non ancora generato: apri il campo Titolo e genera lo slug.',
      })
    } else if (slug.length > 75) {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'warning',
        message: 'Molto lungo, se possibile accorcialo.',
      })
    } else {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'good',
        message: 'Presente e di lunghezza corretta.',
      })
    }

    if (!doc.coverImage) {
      result.push({
        label: 'Immagine di copertina',
        status: 'warning',
        message: 'Manca: gli articoli con immagine ottengono piu clic.',
      })
    } else if (!doc.coverImage.alt) {
      result.push({
        label: 'Immagine di copertina',
        status: 'warning',
        message: 'Aggiungi un testo alternativo: aiuta SEO e accessibilita.',
      })
    } else {
      result.push({
        label: 'Immagine di copertina',
        status: 'good',
        message: 'Presente, con testo alternativo.',
      })
    }

    const bodyImages = (doc.body || []).filter((b: any) => b && b._type === 'image')
    const missingAlt = bodyImages.filter((img: any) => !img.alt)
    if (bodyImages.length > 0 && missingAlt.length > 0) {
      result.push({
        label: 'Testo alternativo immagini',
        status: 'warning',
        message: missingAlt.length + ' di ' + bodyImages.length + ' immagini nel testo senza testo alternativo.',
      })
    } else if (bodyImages.length > 0) {
      result.push({
        label: 'Testo alternativo immagini',
        status: 'good',
        message: 'Tutte le immagini nel testo hanno un testo alternativo.',
      })
    }

    const plainText = plainTextFromBody(doc.body)
    const wordCount = countWords(plainText)
    if (wordCount === 0) {
      result.push({
        label: 'Lunghezza articolo',
        status: 'error',
        message: 'Il corpo dell articolo e vuoto.',
      })
    } else if (wordCount < 300) {
      result.push({
        label: 'Lunghezza articolo',
        status: 'warning',
        message: wordCount + ' parole: per la SEO conviene superare le 300.',
      })
    } else {
      result.push({
        label: 'Lunghezza articolo',
        status: 'good',
        message: wordCount + ' parole: lunghezza adeguata.',
      })
    }

    if (wordCount > 0) {
      const sentenceCount = countSentences(plainText) || 1
      const avgWordsPerSentence = Math.round(wordCount / sentenceCount)
      if (avgWordsPerSentence > 25) {
        result.push({
          label: 'Leggibilita',
          status: 'warning',
          message: 'In media ' + avgWordsPerSentence + ' parole per frase: prova a spezzare le frasi piu lunghe.',
        })
      } else {
        result.push({
          label: 'Leggibilita',
          status: 'good',
          message: 'In media ' + avgWordsPerSentence + ' parole per frase: scorrevole.',
        })
      }
    }

    if (wordCount >= 300) {
      const hasH2 = (doc.body || []).some((b: any) => b && b._type === 'block' && b.style === 'h2')
      if (!hasH2) {
        result.push({
          label: 'Sottotitoli (H2)',
          status: 'warning',
          message: 'Articolo lungo senza sottotitoli: aggiungine per la lettura e la SEO.',
        })
      } else {
        result.push({
          label: 'Sottotitoli (H2)',
          status: 'good',
          message: 'Il testo e suddiviso con sottotitoli.',
        })
      }
    }

    if (!doc.category) {
      result.push({
        label: 'Categoria',
        status: 'warning',
        message: 'Nessuna categoria assegnata.',
      })
    } else {
      result.push({
        label: 'Categoria',
        status: 'good',
        message: 'Categoria assegnata.',
      })
    }

    return result
  }, [doc])

  const goodCount = checks.filter((c) => c.status === 'good').length

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Card padding={3} radius={2} tone="primary">
          <Text size={1} weight="semibold">
            {goodCount} di {checks.length} controlli superati
          </Text>
          <Box marginTop={2}>
            <Text size={1} muted>
              Questi sono suggerimenti: puoi pubblicare l articolo anche se qualcosa non e a posto.
            </Text>
          </Box>
        </Card>

        <Stack space={3}>
          {checks.map((check) => (
            <Card key={check.label} padding={3} radius={2} border>
              <Flex align="center" justify="space-between" marginBottom={2}>
                <Text size={1} weight="semibold">
                  {check.label}
                </Text>
                <Badge tone={statusTone(check.status)}>{statusLabel(check.status)}</Badge>
              </Flex>
              <Text size={1} muted>
                {check.message}
              </Text>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
'@sanity/ui'

type SeoStatus = 'good' | 'warning' | 'error'

interface SeoCheck {
  label: string
  status: SeoStatus
  message: string
}

function plainTextFromBody(blocks: any[] = []): string {
  return blocks
    .filter((b) => b && b._type === 'block')
    .map((b) => (b.children || []).map((c: any) => c.text || '').join(''))
    .join('\n\n')
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length
}

function statusTone(status: SeoStatus): 'positive' | 'caution' | 'critical' {
  if (status === 'good') return 'positive'
  if (status === 'warning') return 'caution'
  return 'critical'
}

function statusLabel(status: SeoStatus): string {
  if (status === 'good') return 'OK'
  if (status === 'warning') return 'Da migliorare'
  return 'Manca'
}

export default function SeoPanel(props: any) {
  const doc = (props && props.document && props.document.displayed) || {}

  const checks: SeoCheck[] = useMemo(() => {
    const result: SeoCheck[] = []

    const seoTitle = doc.seoTitle || doc.title || ''
    if (!seoTitle) {
      result.push({
        label: 'Titolo SEO',
        status: 'error',
        message: 'Manca sia il titolo che il titolo SEO.',
      })
    } else if (seoTitle.length < 40) {
      result.push({
        label: 'Titolo SEO',
        status: 'warning',
        message: seoTitle.length + ' caratteri: un po corto, punta a 40-60.',
      })
    } else if (seoTitle.length > 60) {
      result.push({
        label: 'Titolo SEO',
        status: 'warning',
        message: seoTitle.length + ' caratteri: Google potrebbe tagliarlo, punta a 40-60.',
      })
    } else {
      result.push({
        label: 'Titolo SEO',
        status: 'good',
        message: seoTitle.length + ' caratteri: lunghezza ideale.',
      })
    }

    const metaDesc = doc.seoDescription || doc.excerpt || ''
    if (!metaDesc) {
      result.push({
        label: 'Meta description',
        status: 'error',
        message: 'Manca sia l anteprima che la descrizione SEO.',
      })
    } else if (metaDesc.length < 120) {
      result.push({
        label: 'Meta description',
        status: 'warning',
        message: metaDesc.length + ' caratteri: un po corta, punta a 120-160.',
      })
    } else if (metaDesc.length > 160) {
      result.push({
        label: 'Meta description',
        status: 'warning',
        message: metaDesc.length + ' caratteri: verra tagliata nei risultati Google, punta a 120-160.',
      })
    } else {
      result.push({
        label: 'Meta description',
        status: 'good',
        message: metaDesc.length + ' caratteri: lunghezza ideale.',
      })
    }

    const slug = doc.slug && doc.slug.current
    if (!slug) {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'error',
        message: 'Non ancora generato: apri il campo Titolo e genera lo slug.',
      })
    } else if (slug.length > 75) {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'warning',
        message: 'Molto lungo, se possibile accorcialo.',
      })
    } else {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'good',
        message: 'Presente e di lunghezza corretta.',
      })
    }

    if (!doc.coverImage) {
      result.push({
        label: 'Immagine di copertina',
        status: 'warning',
        message: 'Manca: gli articoli con immagine ottengono piu clic.',
      })
    } else if (!doc.coverImage.alt) {
      result.push({
        label: 'Immagine di copertina',
        status: 'warning',
        message: 'Aggiungi un testo alternativo: aiuta SEO e accessibilita.',
      })
    } else {
      result.push({
        label: 'Immagine di copertina',
        status: 'good',
        message: 'Presente, con testo alternativo.',
      })
    }

    const bodyImages = (doc.body || []).filter((b: any) => b && b._type === 'image')
    const missingAlt = bodyImages.filter((img: any) => !img.alt)
    if (bodyImages.length > 0 && missingAlt.length > 0) {
      result.push({
        label: 'Testo alternativo immagini',
        status: 'warning',
        message: missingAlt.length + ' di ' + bodyImages.length + ' immagini nel testo senza testo alternativo.',
      })
    } else if (bodyImages.length > 0) {
      result.push({
        label: 'Testo alternativo immagini',
        status: 'good',
        message: 'Tutte le immagini nel testo hanno un testo alternativo.',
      })
    }

    const plainText = plainTextFromBody(doc.body)
    const wordCount = countWords(plainText)
    if (wordCount === 0) {
      result.push({
        label: 'Lunghezza articolo',
        status: 'error',
        message: 'Il corpo dell articolo e vuoto.',
      })
    } else if (wordCount < 300) {
      result.push({
        label: 'Lunghezza articolo',
        status: 'warning',
        message: wordCount + ' parole: per la SEO conviene superare le 300.',
      })
    } else {
      result.push({
        label: 'Lunghezza articolo',
        status: 'good',
        message: wordCount + ' parole: lunghezza adeguata.',
      })
    }

    if (wordCount > 0) {
      const sentenceCount = countSentences(plainText) || 1
      const avgWordsPerSentence = Math.round(wordCount / sentenceCount)
      if (avgWordsPerSentence > 25) {
        result.push({
          label: 'Leggibilita',
          status: 'warning',
          message: 'In media ' + avgWordsPerSentence + ' parole per frase: prova a spezzare le frasi piu lunghe.',
        })
      } else {
        result.push({
          label: 'Leggibilita',
          status: 'good',
          message: 'In media ' + avgWordsPerSentence + ' parole per frase: scorrevole.',
        })
      }
    }

    if (wordCount >= 300) {
      const hasH2 = (doc.body || []).some((b: any) => b && b._type === 'block' && b.style === 'h2')
      if (!hasH2) {
        result.push({
          label: 'Sottotitoli (H2)',
          status: 'warning',
          message: 'Articolo lungo senza sottotitoli: aggiungine per la lettura e la SEO.',
        })
      } else {
        result.push({
          label: 'Sottotitoli (H2)',
          status: 'good',
          message: 'Il testo e suddiviso con sottotitoli.',
        })
      }
    }

    if (!doc.category) {
      result.push({
        label: 'Categoria',
        status: 'warning',
        message: 'Nessuna categoria assegnata.',
      })
    } else {
      result.push({
        label: 'Categoria',
        status: 'good',
        message: 'Categoria assegnata.',
      })
    }

    return result
  }, [doc])

  const goodCount = checks.filter((c) => c.status === 'good').length

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Card padding={3} radius={2} tone="primary">
          <Text size={1} weight="semibold">
            {goodCount} di {checks.length} controlli superati
          </Text>
          <Box marginTop={2}>
            <Text size={1} muted>
              Questi sono suggerimenti: puoi pubblicare l articolo anche se qualcosa non e a posto.
            </Text>
          </Box>
        </Card>

        <Stack space={3}>
          {checks.map((check) => (
            <Card key={check.label} padding={3} radius={2} border>
              <Flex align="center" justify="space-between" marginBottom={2}>
                <Text size={1} weight="semibold">
                  {check.label}
                </Text>
                <Badge tone={statusTone(check.status)}>{statusLabel(check.status)}</Badge>
              </Flex>
              <Text size={1} muted>
                {check.message}
              </Text>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

  status: SeoStatus
  message: string
}

function plainTextFromBody(blocks: any[] = []): string {
  return blocks
    .filter((b) => b && b._type === 'block')
    .map((b) => (b.children || []).map((c: any) => c.text || '').join(''))
    .join('\n\n')
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length
}

function statusTone(status: SeoStatus): 'positive' | 'caution' | 'critical' {
  if (status === 'good') return 'positive'
  if (status === 'warning') return 'caution'
  return 'critical'
}

function statusLabel(status: SeoStatus): string {
  if (status === 'good') return 'OK'
  if (status === 'warning') return 'Da migliorare'
  return 'Manca'
}

export default function SeoPanel(props: any) {
  const doc = (props && props.document && props.document.displayed) || {}

  const checks: SeoCheck[] = useMemo(() => {
    const result: SeoCheck[] = []

    const seoTitle = doc.seoTitle || doc.title || ''
    if (!seoTitle) {
      result.push({
        label: 'Titolo SEO',
        status: 'error',
        message: 'Manca sia il titolo che il titolo SEO.',
      })
    } else if (seoTitle.length < 40) {
      result.push({
        label: 'Titolo SEO',
        status: 'warning',
        message: seoTitle.length + ' caratteri: un po corto, punta a 40-60.',
      })
    } else if (seoTitle.length > 60) {
      result.push({
        label: 'Titolo SEO',
        status: 'warning',
        message: seoTitle.length + ' caratteri: Google potrebbe tagliarlo, punta a 40-60.',
      })
    } else {
      result.push({
        label: 'Titolo SEO',
        status: 'good',
        message: seoTitle.length + ' caratteri: lunghezza ideale.',
      })
    }

    const metaDesc = doc.seoDescription || doc.excerpt || ''
    if (!metaDesc) {
      result.push({
        label: 'Meta description',
        status: 'error',
        message: 'Manca sia l anteprima che la descrizione SEO.',
      })
    } else if (metaDesc.length < 120) {
      result.push({
        label: 'Meta description',
        status: 'warning',
        message: metaDesc.length + ' caratteri: un po corta, punta a 120-160.',
      })
    } else if (metaDesc.length > 160) {
      result.push({
        label: 'Meta description',
        status: 'warning',
        message: metaDesc.length + ' caratteri: verra tagliata nei risultati Google, punta a 120-160.',
      })
    } else {
      result.push({
        label: 'Meta description',
        status: 'good',
        message: metaDesc.length + ' caratteri: lunghezza ideale.',
      })
    }

    const slug = doc.slug && doc.slug.current
    if (!slug) {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'error',
        message: 'Non ancora generato: apri il campo Titolo e genera lo slug.',
      })
    } else if (slug.length > 75) {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'warning',
        message: 'Molto lungo, se possibile accorcialo.',
      })
    } else {
      result.push({
        label: 'Indirizzo web (slug)',
        status: 'good',
        message: 'Presente e di lunghezza corretta.',
      })
    }

    if (!doc.coverImage) {
      result.push({
        label: 'Immagine di copertina',
        status: 'warning',
        message: 'Manca: gli articoli con immagine ottengono piu clic.',
      })
    } else if (!doc.coverImage.alt) {
      result.push({
        label: 'Immagine di copertina',
        status: 'warning',
        message: 'Aggiungi un testo alternativo: aiuta SEO e accessibilita.',
      })
    } else {
      result.push({
        label: 'Immagine di copertina',
        status: 'good',
        message: 'Presente, con testo alternativo.',
      })
    }

    const bodyImages = (doc.body || []).filter((b: any) => b && b._type === 'image')
    const missingAlt = bodyImages.filter((img: any) => !img.alt)
    if (bodyImages.length > 0 && missingAlt.length > 0) {
      result.push({
        label: 'Testo alternativo immagini',
        status: 'warning',
        message: missingAlt.length + ' di ' + bodyImages.length + ' immagini nel testo senza testo alternativo.',
      })
    } else if (bodyImages.length > 0) {
      result.push({
        label: 'Testo alternativo immagini',
        status: 'good',
        message: 'Tutte le immagini nel testo hanno un testo alternativo.',
      })
    }

    const plainText = plainTextFromBody(doc.body)
    const wordCount = countWords(plainText)
    if (wordCount === 0) {
      result.push({
        label: 'Lunghezza articolo',
        status: 'error',
        message: 'Il corpo dell articolo e vuoto.',
      })
    } else if (wordCount < 300) {
      result.push({
        label: 'Lunghezza articolo',
        status: 'warning',
        message: wordCount + ' parole: per la SEO conviene superare le 300.',
      })
    } else {
      result.push({
        label: 'Lunghezza articolo',
        status: 'good',
        message: wordCount + ' parole: lunghezza adeguata.',
      })
    }

    if (wordCount > 0) {
      const sentenceCount = countSentences(plainText) || 1
      const avgWordsPerSentence = Math.round(wordCount / sentenceCount)
      if (avgWordsPerSentence > 25) {
        result.push({
          label: 'Leggibilita',
          status: 'warning',
          message: 'In media ' + avgWordsPerSentence + ' parole per frase: prova a spezzare le frasi piu lunghe.',
        })
      } else {
        result.push({
          label: 'Leggibilita',
          status: 'good',
          message: 'In media ' + avgWordsPerSentence + ' parole per frase: scorrevole.',
        })
      }
    }

    if (wordCount >= 300) {
      const hasH2 = (doc.body || []).some((b: any) => b && b._type === 'block' && b.style === 'h2')
      if (!hasH2) {
        result.push({
          label: 'Sottotitoli (H2)',
          status: 'warning',
          message: 'Articolo lungo senza sottotitoli: aggiungine per la lettura e la SEO.',
        })
      } else {
        result.push({
          label: 'Sottotitoli (H2)',
          status: 'good',
          message: 'Il testo e suddiviso con sottotitoli.',
        })
      }
    }

    if (!doc.category) {
      result.push({
        label: 'Categoria',
        status: 'warning',
        message: 'Nessuna categoria assegnata.',
      })
    } else {
      result.push({
        label: 'Categoria',
        status: 'good',
        message: 'Categoria assegnata.',
      })
    }

    return result
  }, [doc])

  const goodCount = checks.filter((c) => c.status === 'good').length

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Card padding={3} radius={2} tone="primary">
          <Text size={1} weight="semibold">
            {goodCount} di {checks.length} controlli superati
          </Text>
          <Box marginTop={2}>
            <Text size={1} muted>
              Questi sono suggerimenti: puoi pubblicare l articolo anche se qualcosa non e a posto.
            </Text>
          </Box>
        </Card>

        <Stack space={3}>
          {checks.map((check) => (
            <Card key={check.label} padding={3} radius={2} border>
              <Flex align="center" justify="space-between" marginBottom={2}>
                <Text size={1} weight="semibold">
                  {check.label}
                </Text>
                <Badge tone={statusTone(check.status)}>{statusLabel(check.status)}</Badge>
              </Flex>
              <Text size={1} muted>
                {check.message}
              </Text>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

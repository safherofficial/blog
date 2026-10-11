import { absoluteUrl, getSiteUrl } from './site'

const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && KEY_PATTERN.test(key) ? key : null
}

/**
 * Avvisa i motori che aderiscono a IndexNow (Bing, Yandex, Seznam, Naver) che alcune pagine
 * sono nuove, modificate o rimosse. Non solleva mai errori: la pubblicazione non deve dipendere da questo.
 */
export async function pingIndexNow(paths: string[]): Promise<boolean> {
  const key = getIndexNowKey()
  if (!key || paths.length === 0) return false
  try {
    const siteUrl = getSiteUrl()
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key,
        keyLocation: absoluteUrl('/indexnow.txt'),
        urlList: [...new Set(paths)].map((path) => absoluteUrl(path)),
      }),
      signal: AbortSignal.timeout(4000),
    })
    return res.ok
  } catch {
    return false
  }
}

export const isPubliclyLive = (published: boolean, publishedAt: string | Date): boolean =>
  published && new Date(publishedAt).getTime() <= Date.now()

/** Pagine da segnalare ai motori dopo la modifica di un articolo (nuova, aggiornata, rimossa o con slug cambiato). */
export function postChangePaths(input: { slug: string; live: boolean; previous?: { slug: string; live: boolean } | null }): string[] {
  const paths: string[] = []
  if (input.live) paths.push(`/blog/${input.slug}`)
  if (input.previous?.live && (!input.live || input.previous.slug !== input.slug)) paths.push(`/blog/${input.previous.slug}`)
  return paths.length ? [...paths, '/', '/articoli'] : []
}

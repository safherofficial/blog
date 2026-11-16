import { LIMITS, SEVERITY_WEIGHT, TITLE_SUFFIX } from './constants'
import { isValidCoverImageUrl } from '@/lib/content/images'
import { countOccurrences, countWords, norm, parseEditorText } from './text'
import type {
  AnalysisContext,
  AnalysisResult,
  IssueCategory,
  PostDraft,
  PostField,
  Severity,
  SeoIssue,
} from './types'

const EXAMPLE_ALT = /\.(jpe?g|png|webp|gif|avif)$|^(img|image|foto|dsc|screenshot)[_\-\s]?\d*$/i

/**
 * Analisi SEO di un articolo. Funzione pura: nessun accesso a rete o database,
 * quindi identica in tempo reale nel browser e nell'audit lato server.
 */
export function analyzePost(draft: PostDraft, ctx: AnalysisContext = { others: [] }): AnalysisResult {
  const issues: SeoIssue[] = []
  const add = (
    severity: Severity,
    category: IssueCategory,
    id: string,
    message: string,
    hint?: string,
    field?: PostField,
  ) => issues.push({ id, severity, category, message, hint, field })

  const now = ctx.now ?? Date.now()
  const others = ctx.others.filter((other) => other.id !== draft.id)
  const blocks = parseEditorText(draft.bodyText)
  const bodyBlocks = blocks.filter((b) => b.type !== 'image')
  const bodyPlain = bodyBlocks.map((b) => b.text).join(' ')
  const words = countWords(bodyPlain)
  const h2 = blocks.filter((b) => b.type === 'h2')
  const images = blocks.filter((b) => b.type === 'image')

  // ---------- Titolo ----------
  const title = draft.title.trim()
  const rawTitle = (draft.seoTitle.trim() || title)
  const fullTitle = rawTitle ? rawTitle + TITLE_SUFFIX : ''
  if (!title) {
    add('error', 'title', 'title-missing', 'Manca il titolo dell’articolo.', 'Il titolo è il primo elemento che Google e i lettori vedono.', 'title')
  } else {
    if (fullTitle.length < LIMITS.titleMin) {
      add('info', 'title', 'title-short', `Titolo breve (${fullTitle.length} caratteri, incluso il nome del sito).`, 'È un’indicazione editoriale, non una soglia di Google: verifica che il titolo descriva chiaramente il contenuto.', draft.seoTitle.trim() ? 'seoTitle' : 'title')
    } else if (fullTitle.length > LIMITS.titleMax) {
      add('info', 'title', 'title-long', `Titolo lungo (${fullTitle.length} caratteri, incluso il nome del sito).`, 'Google non impone un limite fisso: il link del titolo può essere abbreviato in base allo spazio disponibile. Metti le parole più distintive all’inizio.', draft.seoTitle.trim() ? 'seoTitle' : 'title')
    } else {
      add('good', 'title', 'title-length', `Titolo nell’intervallo editoriale indicativo (${fullTitle.length} caratteri).`, undefined, 'title')
    }
    const letters = rawTitle.replace(/[^A-Za-zÀ-ÿ]/g, '')
    if (letters.length > 8 && letters === letters.toUpperCase()) {
      add('warning', 'title', 'title-caps', 'Il titolo è tutto in maiuscolo.', 'Il maiuscolo continuo riduce la leggibilità e i clic nei risultati di ricerca.', 'title')
    }
    if (others.some((o) => norm((o.seoTitle || o.title).trim()) === norm(rawTitle))) {
      add('error', 'title', 'title-duplicate', 'Un altro articolo ha lo stesso titolo.', 'Titoli duplicati confondono Google su quale pagina mostrare e competono tra loro.', draft.seoTitle.trim() ? 'seoTitle' : 'title')
    }
  }

  // ---------- Meta description ----------
  const description = (draft.seoDescription.trim() || draft.excerpt.trim())
  if (!draft.seoDescription.trim() && draft.excerpt.trim()) {
    add('info', 'description', 'description-fallback', 'Nessuna descrizione SEO: Google userà l’anteprima dell’articolo.', 'Una descrizione dedicata ti permette di scriverla pensando ai clic dalla ricerca.', 'seoDescription')
  }
  if (!description) {
    add('error', 'description', 'description-missing', 'Manca la descrizione (anteprima o descrizione SEO).', 'Senza descrizione Google sceglie un frammento a caso del testo.', 'excerpt')
  } else {
    if (description.length < LIMITS.descriptionMin) {
      add('info', 'description', 'description-short', `Descrizione breve (${description.length} caratteri).`, 'È un’indicazione editoriale: punta a un riepilogo specifico e utile, senza allungarlo solo per raggiungere una soglia.', draft.seoDescription.trim() ? 'seoDescription' : 'excerpt')
    } else if (description.length > LIMITS.descriptionMax) {
      add('info', 'description', 'description-long', `Descrizione lunga (${description.length} caratteri).`, 'Google non impone un limite fisso: può abbreviare lo snippet in base al dispositivo o scegliere un estratto della pagina. Metti subito le informazioni più importanti.', draft.seoDescription.trim() ? 'seoDescription' : 'excerpt')
    } else {
      add('good', 'description', 'description-length', `Descrizione nell’intervallo editoriale indicativo (${description.length} caratteri).`, undefined, 'seoDescription')
    }
    if (norm(description) === norm(title)) {
      add('warning', 'description', 'description-equals-title', 'La descrizione è identica al titolo.', 'Aggiungi un dettaglio o un beneficio che il titolo non dice.', 'seoDescription')
    }
    if (others.some((o) => norm((o.seoDescription || o.excerpt).trim()) === norm(description))) {
      add('warning', 'description', 'description-duplicate', 'Un altro articolo usa la stessa descrizione.', 'Ogni pagina dovrebbe avere una descrizione unica.', 'seoDescription')
    }
  }

  // ---------- URL ----------
  const slug = draft.slug.trim()
  if (!slug) {
    add('error', 'url', 'slug-missing', 'Manca lo slug (la parte finale dell’indirizzo).', undefined, 'slug')
  } else {
    let slugOk = true
    if (others.some((o) => o.slug === slug)) {
      slugOk = false
      add('error', 'url', 'slug-duplicate', 'Lo slug è già usato da un altro articolo.', 'Cambialo per poter salvare.', 'slug')
    }
    if (ctx.wasPublished && ctx.originalSlug && ctx.originalSlug !== slug) {
      slugOk = false
      add('error', 'url', 'slug-changed', 'Stai cambiando l’indirizzo di un articolo già pubblico.', 'Il sito non crea redirect automatici: i vecchi link, i social e Google porteranno a una pagina 404 e il posizionamento si perde. Meglio non modificarlo.', 'slug')
    }
    if (slug.length > LIMITS.slugMax) {
      slugOk = false
      add('warning', 'url', 'slug-long', `Lo slug è lungo (${slug.length} caratteri).`, 'Indirizzi brevi e descrittivi funzionano meglio: tieni solo le parole chiave.', 'slug')
    }
    if (slugOk) add('good', 'url', 'slug-ok', 'Slug di lunghezza adeguata.', undefined, 'slug')
    if (/(^|-)(19|20)\d{2}(-|$)/.test(slug)) {
      add('info', 'url', 'slug-year', 'Lo slug contiene un anno.', 'Gli anni nell’indirizzo fanno invecchiare l’articolo: valuta di toglierlo.', 'slug')
    }
    const titleWords = norm(title).split(/[^a-z0-9]+/).filter((w) => w.length > 3)
    if (titleWords.length > 0 && !titleWords.some((w) => slug.includes(w))) {
      add('info', 'url', 'slug-unrelated', 'Lo slug non contiene nessuna parola significativa del titolo.', 'Uno slug coerente con il titolo aiuta i motori a capire l’argomento.', 'slug')
    }
  }

  // ---------- Indicizzazione ----------
  const publishedAtMs = Date.parse(draft.publishedAt)
  if (!draft.published) {
    add('info', 'indexing', 'status-draft', 'Bozza: l’articolo non è visibile a Google né ai lettori.', undefined, 'publishedAt')
  } else if (Number.isNaN(publishedAtMs)) {
    add('error', 'indexing', 'date-invalid', 'La data di pubblicazione non è valida.', undefined, 'publishedAt')
  } else if (publishedAtMs > now) {
    add('info', 'indexing', 'status-scheduled', 'Programmato: diventerà pubblico e indicizzabile alla data impostata.', 'Compare nella sitemap entro 5 minuti dalla pubblicazione.', 'publishedAt')
  } else {
    add('good', 'indexing', 'status-live', 'Articolo pubblico e indicizzabile.', undefined, 'publishedAt')
  }
  if (!draft.categoryId) {
    add('warning', 'content', 'category-missing', 'L’articolo non ha una categoria.', 'Le categorie creano pagine tematiche e link interni che aiutano Google a capire il sito.', 'categoryId')
  }

  // ---------- Contenuto ----------
  if (words === 0) {
    add('error', 'content', 'content-empty', 'Il testo dell’articolo è vuoto.', 'Inserisci il contenuto dell’articolo prima di pubblicarlo.', 'bodyText')
  } else if (words < 300) {
    add('info', 'content', 'content-short', `Testo breve (${words} parole).`, 'Google non stabilisce un numero minimo di parole. Verifica che il testo risponda in modo completo e utile all’argomento; amplia solo quando serve al lettore.', 'bodyText')
  }
  if (h2.length === 0 && words >= 300) {
    add('warning', 'content', 'headings-missing', 'Nel testo non ci sono sottotitoli (H2).', 'Dividi l’articolo in sezioni con «## Titolo»: migliorano lettura e comprensione dei motori.', 'bodyText')
  } else if (h2.length > 0) {
    add('good', 'content', 'headings-ok', `Struttura con ${h2.length} sottotitol${h2.length === 1 ? 'o' : 'i'} (H2).`, undefined, 'bodyText')
  }
  if (h2.some((h) => !h.text)) {
    add('error', 'content', 'heading-empty', 'C’è un sottotitolo (##) vuoto.', undefined, 'bodyText')
  }
  const h2Norm = h2.map((h) => norm(h.text)).filter(Boolean)
  if (new Set(h2Norm).size < h2Norm.length) {
    add('warning', 'content', 'heading-duplicate', 'Alcuni sottotitoli sono ripetuti.', 'Ogni sezione dovrebbe avere un titolo distinto.', 'bodyText')
  }

  // ---------- Leggibilità ----------
  const longParagraphs = blocks.filter((b) => b.type === 'p' && countWords(b.text) > LIMITS.paragraphWords).length
  if (longParagraphs > 0) {
    add('info', 'readability', 'paragraph-long', `${longParagraphs} paragraf${longParagraphs === 1 ? 'o è' : 'i sono'} molto lung${longParagraphs === 1 ? 'o' : 'hi'} (oltre ${LIMITS.paragraphWords} parole).`, 'Spezzali con una riga vuota: sul telefono un muro di testo fa abbandonare la pagina.', 'bodyText')
  }
  const sentences = bodyBlocks.filter((b) => b.type === 'p').flatMap((b) => b.text.split(/[.!?…]+\s+/)).filter((s) => countWords(s) > 0)
  if (sentences.length >= 5) {
    const avg = sentences.reduce((sum, s) => sum + countWords(s), 0) / sentences.length
    if (avg > LIMITS.sentenceWords) {
      add('warning', 'readability', 'sentences-long', `Le frasi sono lunghe in media ${Math.round(avg)} parole.`, `Cerca di stare sotto le ${LIMITS.sentenceWords}: frasi più corte si leggono meglio, soprattutto da mobile.`, 'bodyText')
    }
  }

  // ---------- Immagini ----------
  const cover = draft.coverImageUrl.trim()
  if (!cover) {
    add('warning', 'images', 'cover-missing', 'Manca l’immagine di copertina.', 'Senza copertina le condivisioni social e Google Discover mostrano un’anteprima povera.', 'coverImageUrl')
  } else {
    const valid = isValidCoverImageUrl(cover)
    if (!valid) {
      add('error', 'images', 'cover-url', 'L’URL della copertina non è valido: usa HTTPS o carica il file dal pannello.', undefined, 'coverImageUrl')
    }
    const coverAlt = draft.coverImageAlt.trim()
    if (!coverAlt) {
      add('error', 'images', 'cover-alt-missing', 'La copertina non ha testo alternativo.', 'L’alt serve all’accessibilità e a Google Immagini: descrivi cosa si vede.', 'coverImageAlt')
    } else if (EXAMPLE_ALT.test(coverAlt)) {
      add('warning', 'images', 'cover-alt-filename', 'Il testo alternativo della copertina sembra un nome di file.', 'Scrivi una breve descrizione dell’immagine.', 'coverImageAlt')
    } else if (coverAlt.length > LIMITS.altMax) {
      add('info', 'images', 'cover-alt-long', `L’alt della copertina è lungo (${coverAlt.length} caratteri).`, `Meglio sotto i ${LIMITS.altMax}.`, 'coverImageAlt')
    } else if (valid) {
      add('good', 'images', 'cover-ok', 'Copertina con testo alternativo.', undefined, 'coverImageAlt')
    }
  }
  const noAlt = images.filter((img) => !img.text.trim()).length
  if (noAlt > 0) {
    add('error', 'images', 'inline-alt-missing', `${noAlt} immagin${noAlt === 1 ? 'e' : 'i'} nel testo senza testo alternativo.`, 'Scrivilo tra le parentesi quadre: ![descrizione](https://…).', 'bodyText')
  }
  const insecure = images.filter((img) => img.url?.startsWith('http://')).length
  if (insecure > 0) {
    add('error', 'images', 'inline-http', `${insecure} immagin${insecure === 1 ? 'e usa' : 'i usano'} http:// invece di https://.`, 'I browser bloccano o segnalano i contenuti non sicuri: usa indirizzi HTTPS.', 'bodyText')
  }
  if (images.some((img) => img.text.trim() && EXAMPLE_ALT.test(img.text.trim()))) {
    add('warning', 'images', 'inline-alt-filename', 'Qualche immagine nel testo ha come alt un nome di file.', 'Descrivi l’immagine con parole tue.', 'bodyText')
  }

  // ---------- Parola chiave principale ----------
  const keyword = (draft.focusKeyword || '').trim()
  if (!keyword) {
    add('info', 'keyword', 'keyword-unset', 'Imposta una parola chiave principale per attivare i controlli di ottimizzazione.', 'È la frase con cui vuoi essere trovata su Google (non viene salvata).', 'focusKeyword')
  } else {
    const k = norm(keyword)
    const kSlug = k.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const kWords = Math.max(1, k.split(/\s+/).length)
    const check = (ok: boolean, id: string, label: string, hint: string, field: PostField, level: Severity = 'warning') => {
      if (ok) add('good', 'keyword', id, `La parola chiave è ${label}.`, undefined, field)
      else add(level, 'keyword', id, `La parola chiave non è ${label}.`, hint, field)
    }
    check(norm(rawTitle).includes(k), 'keyword-title', 'nel titolo', 'Inseriscila, meglio se verso l’inizio.', draft.seoTitle.trim() ? 'seoTitle' : 'title')
    check(norm(description).includes(k), 'keyword-description', 'nella descrizione', 'Google la evidenzia in grassetto quando corrisponde alla ricerca.', draft.seoDescription.trim() ? 'seoDescription' : 'excerpt')
    check(slug.includes(kSlug), 'keyword-slug', 'nello slug', 'Uno slug con la parola chiave aiuta a capire l’argomento.', 'slug', 'info')
    const first100 = norm(bodyPlain.split(/\s+/).slice(0, 100).join(' '))
    check(first100.includes(k), 'keyword-intro', 'nelle prime 100 parole', 'Nominala presto, già nell’introduzione.', 'bodyText')
    if (h2.length > 0) {
      check(h2.some((h) => norm(h.text).includes(k)), 'keyword-h2', 'in almeno un sottotitolo', 'Usala in un H2 dove è naturale.', 'bodyText', 'info')
    }
    const occurrences = countOccurrences(norm(bodyPlain), k)
    if (occurrences === 0) {
      add('info', 'keyword', 'keyword-body', 'La frase chiave esatta non compare nel testo.', 'Controlla che l’argomento sia trattato chiaramente: non è necessario ripetere la stessa formulazione se sinonimi e contesto esprimono già il tema.', 'bodyText')
    } else if (words > 0) {
      const density = (occurrences * kWords / words) * 100
      if (density > LIMITS.keywordReviewDensity) {
        add('info', 'keyword', 'keyword-stuffing', `La frase chiave compare con frequenza elevata (${occurrences} volte).`, 'È un controllo euristico interno, non una percentuale usata da Google. Rileggi il testo e verifica che le ripetizioni siano naturali e davvero utili.', 'bodyText')
      } else {
        add('good', 'keyword', 'keyword-density', `Frequenza della frase chiave senza segnali di ripetizione eccessiva (${occurrences} occorrenze).`, undefined, 'bodyText')
      }
    }
  }

  const penalty = issues.reduce((sum, issue) => sum + SEVERITY_WEIGHT[issue.severity], 0)
  return {
    score: Math.max(0, 100 - penalty),
    issues,
    stats: {
      words,
      readingMinutes: Math.max(1, Math.round(words / 200)),
      h2: h2.length,
      images: images.length + (cover ? 1 : 0),
      titleLength: fullTitle.length,
      descriptionLength: description.length,
    },
  }
}

export const SEVERITY_ORDER: Severity[] = ['error', 'warning', 'info', 'good']

export function countBySeverity(issues: SeoIssue[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { error: 0, warning: 0, info: 0, good: 0 }
  for (const issue of issues) counts[issue.severity] += 1
  return counts
}

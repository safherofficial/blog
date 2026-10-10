/** Soglie e pesi del motore SEO. Un'unica fonte di verità per client e server. */

// Il layout radice applica il template '%s — Controluce' a ogni titolo di pagina.
export const TITLE_SUFFIX = ' — Controluce'

export const LIMITS = {
  titleMin: 30,
  titleMax: 60,
  descriptionMin: 70,
  descriptionMax: 160,
  slugMax: 60,
  wordsThin: 150,
  wordsShort: 300,
  paragraphWords: 150,
  sentenceWords: 25,
  keywordDensityMax: 3,
  altMax: 125,
  staleDays: 90,
  slowResponseMs: 2500,
} as const

/** Penalità sul punteggio (0-100) per ogni problema. */
export const SEVERITY_WEIGHT = { error: 15, warning: 5, info: 0, good: 0 } as const

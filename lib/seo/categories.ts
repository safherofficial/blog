/**
 * Editorial taxonomy for public category archives.
 * This describes the existing categories; it does not change article content or assignments.
 */
export type CategoryEditorialInfo = {
  label: string
  seoTitle: string
  description: string
  intro: string
  related: string[]
}

const CATEGORY_INFO: Record<string, CategoryEditorialInfo> = {
  benessere: {
    label: 'Benessere',
    seoTitle: 'Benessere: alimentazione e rapporto con il corpo',
    description: 'Articoli su benessere, alimentazione e rapporto con il corpo: riflessioni sul dimagrimento, il percorso nutrizionale e la cura di sé.',
    intro: 'Il rapporto con il peso e con il cibo non si esaurisce in una dieta. Qui raccogliamo riflessioni sul dimagrimento, sul confronto con la bilancia e sul ruolo di un percorso nutrizionale seguito con consapevolezza. Uno spazio per guardare al benessere personale senza scorciatoie e senza giudizio.',
    related: ['salute-mentale', 'salute-e-societa'],
  },
  'salute-e-societa': {
    label: 'Salute e società',
    seoTitle: 'Salute e società: relazioni e tecnologia',
    description: 'Riflessioni su salute e società: solitudine, relazioni, supporto psicologico e impatto dell’intelligenza artificiale nella vita quotidiana.',
    intro: 'Il benessere non dipende soltanto dall’individuo: si intreccia con relazioni, contesto sociale e strumenti che usiamo ogni giorno. Gli articoli di questa sezione interrogano solitudine, accesso al supporto psicologico, intelligenza artificiale e cambiamenti nel modo di stare insieme.',
    related: ['salute-mentale', 'societa', 'benessere'],
  },
  'salute-mentale': {
    label: 'Salute mentale',
    seoTitle: 'Salute mentale: disagio, ascolto e comprensione',
    description: 'Storie sulla salute mentale, il disagio psicologico e la difficoltà di spiegare ciò che si prova, tra ascolto, comprensione e pregiudizi.',
    intro: 'Il disagio psicologico non è sempre visibile e spesso chi lo vive deve trovare le parole per spiegare ciò che prova. Questa sezione raccoglie riflessioni sull’esperienza della sofferenza mentale, sul peso dei pregiudizi e sull’importanza di ascolto, comprensione e vicinanza.',
    related: ['salute-e-societa', 'benessere'],
  },
  societa: {
    label: 'Società',
    seoTitle: 'Società: social network e autenticità',
    description: 'Articoli su social network, identità digitale e perdita di autenticità: come i social influenzano aspettative, comportamenti e relazioni.',
    intro: 'I social network influenzano il modo in cui ci presentiamo, ci confrontiamo con gli altri e misuriamo il nostro valore. In questa sezione osserviamo la perdita di autenticità, l’emulazione, il timore del giudizio e le aspettative che la vita digitale alimenta.',
    related: ['salute-e-societa', 'salute-mentale'],
  },
}

export function getCategoryEditorialInfo(slug: string, fallbackTitle: string): CategoryEditorialInfo {
  return CATEGORY_INFO[slug] || {
    label: fallbackTitle,
    seoTitle: fallbackTitle,
    description: `Articoli e riflessioni sul tema ${fallbackTitle.toLocaleLowerCase('it-IT')} pubblicati su Controluce.`,
    intro: `Una raccolta di articoli e riflessioni sul tema ${fallbackTitle.toLocaleLowerCase('it-IT')}, con lo sguardo editoriale di Controluce.`,
    related: [],
  }
}

export function getRelatedCategorySlugs(slug: string): string[] {
  return CATEGORY_INFO[slug]?.related || []
}

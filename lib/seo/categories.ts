/**
 * Editorial taxonomy for public category archives.
 * This describes the existing categories; it does not change article content or assignments.
 */
export type CategoryEditorialInfo = {
  label: string
  seoTitle: string
  description: string
  related: string[]
}

const CATEGORY_INFO: Record<string, CategoryEditorialInfo> = {
  benessere: {
    label: 'Benessere',
    seoTitle: 'Benessere: alimentazione e rapporto con il corpo',
    description: 'Articoli su benessere, alimentazione e rapporto con il corpo: riflessioni sul dimagrimento, il percorso nutrizionale e la cura di sé.',
    related: ['salute-mentale', 'salute-e-societa'],
  },
  'salute-e-societa': {
    label: 'Salute e società',
    seoTitle: 'Salute e società: relazioni e tecnologia',
    description: 'Riflessioni su salute e società: solitudine, relazioni, supporto psicologico e impatto dell’intelligenza artificiale nella vita quotidiana.',
    related: ['salute-mentale', 'societa', 'benessere'],
  },
  'salute-mentale': {
    label: 'Salute mentale',
    seoTitle: 'Salute mentale: disagio, ascolto e comprensione',
    description: 'Storie sulla salute mentale, il disagio psicologico e la difficoltà di spiegare ciò che si prova, tra ascolto, comprensione e pregiudizi.',
    related: ['salute-e-societa', 'benessere'],
  },
  societa: {
    label: 'Società',
    seoTitle: 'Società: social network e autenticità',
    description: 'Articoli su social network, identità digitale e perdita di autenticità: come i social influenzano aspettative, comportamenti e relazioni.',
    related: ['salute-e-societa', 'salute-mentale'],
  },
}

export function getCategoryEditorialInfo(slug: string, fallbackTitle: string): CategoryEditorialInfo {
  return CATEGORY_INFO[slug] || {
    label: fallbackTitle,
    seoTitle: fallbackTitle,
    description: `Articoli e riflessioni sul tema ${fallbackTitle.toLocaleLowerCase('it-IT')} pubblicati su Controluce.`,
    related: [],
  }
}

export function getRelatedCategorySlugs(slug: string): string[] {
  return CATEGORY_INFO[slug]?.related || []
}

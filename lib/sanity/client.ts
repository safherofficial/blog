import { createClient } from 'next-sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2024-07-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // useCdn a false: i nuovi articoli pubblicati da /studio compaiono subito,
  // senza cache. Con traffico alto si può passare a true per performance.
  useCdn: false,
})

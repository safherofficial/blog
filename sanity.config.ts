import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'controluce',
  title: 'Controluce — pannello articoli',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenuti')
          .items([
            S.listItem()
              .title('Articoli')
              .child(S.documentTypeList('post').title('Articoli')),
            S.listItem()
              .title('Categorie')
              .child(S.documentTypeList('category').title('Categorie')),
            S.divider(),
            S.listItem()
              .title('Impostazioni del sito')
              .child(
                S.document().schemaType('siteSettings').documentId('siteSettings')
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})

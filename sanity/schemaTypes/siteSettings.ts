import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Impostazioni del sito',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Nome del blog', type: 'string', initialValue: 'Controluce' }),
    defineField({ name: 'tagline', title: 'Frase sotto il titolo (hero)', type: 'string' }),
    defineField({ name: 'authorName', title: 'Il tuo nome', type: 'string' }),
    defineField({ name: 'authorBio', title: 'Biografia (pagina Chi sono)', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'authorPhoto', title: 'Foto profilo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'instagramUrl', title: 'Link Instagram', type: 'url' }),
    defineField({ name: 'signatureQuote', title: 'Citazione in evidenza (homepage)', type: 'text', rows: 3 }),
  ],
  preview: { prepare: () => ({ title: 'Impostazioni del sito' }) },
})

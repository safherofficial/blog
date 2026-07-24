import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Articolo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Indirizzo web (slug)',
      type: 'slug',
      description: "Generato dal titolo. È l'indirizzo della pagina, es. /blog/questo-indirizzo",
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Anteprima (per homepage e SEO)',
      type: 'text',
      rows: 3,
      description: 'Un breve riassunto: appare nelle card e come descrizione per Google.',
      validation: (Rule) => Rule.max(220).required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Testo alternativo (descrivi l\'immagine)', type: 'string' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data di pubblicazione',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'body',
      title: 'Testo dell\'articolo',
      type: 'array',
      of: [
        { type: 'block', styles: [
          { title: 'Testo', value: 'normal' },
          { title: 'Titolo H2', value: 'h2' },
          { title: 'Citazione', value: 'blockquote' },
        ]},
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', title: 'Testo alternativo', type: 'string' }],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      title: 'Titolo SEO (opzionale)',
      type: 'string',
      description: 'Se vuoto, viene usato il titolo dell\'articolo.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Descrizione SEO (opzionale)',
      type: 'text',
      rows: 2,
      description: 'Se vuota, viene usata l\'anteprima.',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', subtitle: 'excerpt' },
  },
})

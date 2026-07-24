# Controluce

Next.js 14 (App Router, TypeScript, Tailwind) + **Sanity** come CMS headless,
con lo Studio incorporato in `/studio`. Lei scrive e pubblica da lì, senza
toccare codice o Git. Tu gestisci deploy/dominio da Vercel come al solito.

## Setup (tuo, una tantum)

1. **Crea il progetto Sanity** (gratuito): `npx sanity@latest init` dentro
   questa cartella, oppure crealo da sanity.io/manage. Ti dà un `projectId`.
2. Copia `.env.local.example` in `.env.local` e compila:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SITE_URL=https://www.tuodominio.it
   ```
3. `npm install`
4. `npm run dev` → sito su `localhost:3000`, pannello su `localhost:3000/studio`.
5. In `/studio`, apri **Impostazioni del sito** e compila nome del blog,
   nome autrice, bio, foto, link Instagram — sono i campi che alimentano
   header, footer e pagina "Chi sono".
6. Push su GitHub, importa il repo su Vercel, aggiungi le stesse variabili
   d'ambiente nel pannello Vercel (Settings → Environment Variables),
   collega il dominio.
7. In Sanity → Manage → API → CORS Origins, aggiungi l'URL del sito in
   produzione (e `http://localhost:3000` per lo sviluppo) perché lo Studio
   possa salvare i contenuti.
8. In **Manage → Members**, invita lei come utente Sanity (email) così ha
   accesso a `/studio` con il suo account: fa login e può scrivere subito.

## Uso quotidiano (per lei)

1. Vai su `tuosito.it/studio` e accedi.
2. **Articoli → Crea nuovo**: titolo, immagine di copertina (trascina il
   file), anteprima, categoria, testo dell'articolo con l'editor visuale
   (titoli, citazioni, immagini inline).
3. **Pubblica** in alto a destra. L'articolo appare sul sito entro un minuto
   (nessun bisogno di redeploy).
4. Per modificare nome, bio, foto o link social: **Impostazioni del sito**.

Non serve mai aprire codice, GitHub o Vercel per pubblicare un articolo.

## SEO

- Meta title/description per pagina, generati dai campi SEO di ogni
  articolo (o dall'anteprima, se li lasci vuoti).
- Open Graph + Twitter Card automatici, con l'immagine di copertina.
- `sitemap.xml` e `robots.txt` generati dinamicamente da `app/sitemap.ts`
  e `app/robots.ts` — si aggiornano da soli a ogni nuovo articolo.
- JSON-LD (`Blog` e `BlogPosting`) per i rich results di Google.
- Dopo il primo deploy: registra il sito su Google Search Console e
  invia `https://tuodominio.it/sitemap.xml`.

## Struttura

```
app/(site)/           → homepage, /about, /blog/[slug] — pagine pubbliche
app/studio/            → pannello di pubblicazione (Sanity Studio)
app/sitemap.ts, robots.ts → SEO tecnica, generata dai contenuti
sanity/schemaTypes/    → definizione dei campi che lei vede nel pannello
lib/sanity/             → client, query GROQ, utility immagini
components/             → Header, Footer, card articolo, rendering testo
```

## Estensioni future

- Newsletter: collega il form in homepage a Brevo/MailerLite (piano gratuito).
- Bozze/anteprima: Sanity supporta la modalità "Draft" nativamente, si
  può attivare il Draft Mode di Next.js per farle vedere l'anteprima prima
  di pubblicare, se ti serve te lo aggiungo.

# Controluce

Blog editoriale realizzato con Next.js 14 (App Router, TypeScript, Tailwind CSS) e Vercel Postgres.

Articoli, categorie e impostazioni vengono gestiti dal database PostgreSQL collegato a Vercel.

## Configurazione

Imposta le seguenti variabili d'ambiente nel progetto Vercel:

```env
POSTGRES_URL=...
ADMIN_PASSWORD=una-password-lunga-e-casuale
ADMIN_SESSION_SECRET=una-chiave-casuale-distinta-dalla-password
NEXT_PUBLIC_SITE_URL=https://www.tuodominio.it
```

`ADMIN_SESSION_SECRET` dovrebbe essere un segreto casuale indipendente dalla password amministrativa. Se non è impostato, il codice usa `ADMIN_PASSWORD` come fallback per mantenere la compatibilità con le installazioni esistenti.

Esegui integralmente `db/schema.sql` nel SQL editor del database Vercel Postgres. Lo script crea le tabelle `posts`, `categories` e `site_settings`, gli indici e i trigger per `updated_at`.

## Sviluppo, build e controlli

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

La GitHub Action esegue lint, controllo TypeScript e build su push e pull request. Il repository dovrebbe versionare anche il lockfile npm generato dal team per rendere riproducibili le installazioni.

## Pannello editoriale

Il pannello è disponibile su `/admin`. L'accesso è protetto da `ADMIN_PASSWORD` e da un cookie HTTP-only firmato, con scadenza lato server dopo otto ore. È disponibile anche il logout. La protezione anti-tentativi ripetuti in memoria è best-effort: per un sito pubblico configura anche il rate limiting a livello di piattaforma.

Il pannello permette di creare, modificare e cancellare articoli, salvare le bozze, pubblicare contenuti, assegnare categorie e modificare le impostazioni del sito. I nuovi articoli vengono salvati come bozze per impostazione predefinita.

### Formato del corpo articolo

- Testo normale: paragrafi separati da una riga vuota.
- `## Titolo`: intestazione H2.
- `> Citazione`: citazione.
- `![Testo alternativo](https://...)`: immagine inline (URL HTTPS).

Le immagini sono salvate come URL, non come file binari.

## Feed e SEO

- Homepage: `/`
- Articoli: `/blog/[slug]`
- Categorie: `/categoria/[slug]`
- Pagina autore: `/about`
- Privacy Policy: `/privacy-policy`
- Feed RSS: `/feed.xml`
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`

La newsletter email non è attiva: la homepage propone il feed RSS, senza raccogliere indirizzi email. Prima di introdurre newsletter, analytics o marketing, aggiorna la privacy policy e implementa i controlli di consenso necessari.

## Struttura

```text
app/(site)/        → pagine pubbliche
app/admin/         → pannello editoriale
app/api/admin/     → API amministrative
app/feed.xml/      → feed RSS
app/sitemap.ts     → sitemap dinamica
app/robots.ts      → robots.txt
components/        → componenti UI
lib/db/            → accesso Postgres e query contenuti
lib/content/       → editor, validazione e contenuti
lib/admin-auth.ts  → sessione amministrativa
db/schema.sql      → schema database
```

# Controluce

Next.js 14 (App Router, TypeScript, Tailwind) + **Vercel Postgres**.
Contenuti, categorie e impostazioni sono gestiti nel database Postgres collegato a Vercel.

## 1. Configurazione Vercel

Imposta queste variabili d'ambiente:

```env
POSTGRES_URL=...
ADMIN_PASSWORD=una-password-lunga-e-casuale
NEXT_PUBLIC_SITE_URL=https://www.tuodominio.it
```

`POSTGRES_URL` deve essere quella fornita dall'integrazione Postgres collegata
al progetto Vercel.

## 2. Crea le tabelle

Apri il SQL editor del database Vercel Postgres ed esegui integralmente:

```text
db/schema.sql
```

Lo script crea:

- `posts`
- `categories`
- `site_settings`

con indici, relazioni e trigger per `updated_at`.

## 3. Installazione e deploy

```bash
npm install
npm run build
```

Poi fai push su GitHub e deploya su Vercel.

## 4. Pannello editoriale

Il pannello editoriale è disponibile su:

```text
/admin
```

L'accesso è protetto da `ADMIN_PASSWORD` e da un cookie HTTP-only firmato.

Dal pannello puoi:

- creare, modificare e cancellare articoli;
- pubblicare o lasciare un articolo come bozza;
- gestire titolo, slug, anteprima e SEO;
- assegnare categorie;
- impostare URL e alt delle immagini;
- modificare le impostazioni del sito e la biografia.

### Formato del corpo articolo

L'editor usa un formato testuale semplice che viene convertito in Portable
Text e salvato nel campo JSONB `posts.body`:

- testo normale: paragrafi separati da una riga vuota;
- `## Titolo`: H2;
- `> Citazione`: citazione;
- `![Testo alternativo](https://...)`: immagine inline.

Le immagini sono quindi memorizzate come URL nel database. Il database non
contiene i file binari delle immagini.

## Struttura

```text
app/(site)/       → sito pubblico
app/admin/        → pannello editoriale Postgres
app/api/admin/    → API protette del pannello
app/sitemap.ts    → sitemap dinamica da Postgres
app/robots.ts     → robots.txt
components/       → componenti UI
lib/db/           → accesso Vercel Postgres e query contenuti
lib/content/     → conversione immagini/editor
lib/admin-auth.ts → autenticazione pannello
 db/schema.sql    → schema database
```

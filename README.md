# Controluce

Blog editoriale realizzato con Next.js 16 (App Router, TypeScript, Tailwind CSS) e Neon Postgres.

Articoli, categorie e impostazioni vengono gestiti dal database PostgreSQL collegato a Vercel.

## Configurazione

Il progetto usa Node.js 26.13.1 e npm 11.20.0. La versione Node locale è indicata in `.nvmrc`, mentre `package.json` dichiara il package manager npm richiesto. La CI verifica entrambe le versioni e installa le dipendenze esclusivamente dal lockfile con `npm ci`.

L'accesso al database usa il driver serverless ufficiale di Neon tramite richieste HTTP. Per mantenere la compatibilità con gli ambienti già configurati, il codice usa `POSTGRES_URL` quando presente e ripiega su `DATABASE_URL` in sua assenza. Non sono richieste modifiche allo schema né una copia dei dati per questo aggiornamento del driver. Non rimuovere la variabile esistente da Vercel senza aver prima verificato quella effettivamente utilizzata dall'ambiente.

Imposta le seguenti variabili d'ambiente nel progetto Vercel:

```env
POSTGRES_URL=... # connessione già usata dalle installazioni esistenti
DATABASE_URL=... # fallback per nuove integrazioni Neon su Vercel
ADMIN_PASSWORD=una-password-lunga-e-casuale
ADMIN_SESSION_SECRET=una-chiave-casuale-distinta-dalla-password
SITE_URL=https://controluce.blog

# Facoltative, consigliate per l'indicizzazione
GOOGLE_SITE_VERIFICATION=codice-da-google-search-console
BING_SITE_VERIFICATION=codice-da-bing-webmaster-tools
INDEXNOW_KEY=una-chiave-casuale-di-almeno-16-caratteri
```

`ADMIN_SESSION_SECRET` dovrebbe essere un segreto casuale indipendente dalla password amministrativa. Se non è impostato, il codice usa `ADMIN_PASSWORD` come fallback per mantenere la compatibilità con le installazioni esistenti.

Esegui integralmente `db/schema.sql` nel SQL editor del database Neon. Lo script crea le tabelle `posts`, `categories` e `site_settings`, gli indici e i trigger per `updated_at`.

## Sviluppo, build e controlli

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
```

La GitHub Action esegue `npm ci`, lint, controllo TypeScript e build su push e pull request. `package-lock.json` deve restare versionato: aggiorna le dipendenze intenzionalmente con npm 11.20.0 e committa insieme `package.json` il lockfile risultante.

## Pannello editoriale

Il pannello è disponibile su `/admin`. L'accesso è protetto da `ADMIN_PASSWORD` e da un cookie HTTP-only firmato, con scadenza lato server dopo otto ore. È disponibile anche il logout. La protezione anti-tentativi ripetuti in memoria è best-effort: per un sito pubblico configura anche il rate limiting a livello di piattaforma.

Il pannello permette di creare, modificare e cancellare articoli, salvare le bozze, pubblicare contenuti, assegnare categorie e modificare le impostazioni del sito. I nuovi articoli vengono salvati come bozze per impostazione predefinita.

### Controlli SEO

Il pannello include un motore di analisi SEO (`lib/seo/`), pensato per intercettare gli errori che penalizzano il posizionamento su Google, Bing e altri motori.

- **Editor articolo:** punteggio 0-100 in tempo reale, anteprima del risultato Google (desktop e mobile), contatori di lunghezza e un elenco di problemi cliccabili (titolo e descrizione fuori misura, duplicati, slug, thin content, sottotitoli, alt mancanti, immagini `http://`, leggibilità, parola chiave principale). Se cambi lo slug di un articolo già pubblico ricevi un avviso, perché il sito non crea redirect automatici.
- **Salute SEO:** analisi degli articoli e della configurazione (`SITE_URL`, dominio canonico, categorie vuote, pagina «Chi sono», credenziali di sessione). Le categorie vuote sono escluse dalla sitemap e impostate `noindex`.
- **Scansione del sito pubblicato:** controlla `robots.txt`, sitemap, feed e un campione fino a 32 pagine pubbliche. Scansiona il dominio canonico definito in `SITE_URL`, non necessariamente l'host da cui è stato aperto il pannello; controlla stato HTTP, title, description, canonical, `noindex`, H1, alt delle immagini e tempi di risposta.
- La presenza di un token meta non certifica che la proprietà sia stata verificata nei servizi esterni. La verifica via DNS TXT non è rilevabile dal pannello.
- Il pannello non legge impression, clic, query o posizioni medie di Google Search Console: per questi dati occorre consultare Search Console o integrare separatamente la sua API.
- La parola chiave principale serve solo ai controlli e non viene salvata nel database. Le regole sono funzioni pure in `lib/seo/post-analyzer.ts` e `lib/seo/site-audit.ts`.
- Mentre scrivi, una copia di sicurezza del testo viene conservata nel browser: se la sessione scade o chiudi la scheda, l'editor propone di ripristinarla.

### Indicizzazione e ricerca AI

- **Metadati su ogni pagina:** title, description, canonical, Open Graph e Twitter; direttive `max-image-preview:large` e `max-snippet:-1` per anteprime grandi e snippet completi.
- **Anteprime social:** `/og` e `/blog/<slug>/og` generano un'immagine 1200×630 di marca, usata quando un articolo non ha la copertina.
- **Dati strutturati (JSON-LD):** `WebSite`, `Blog`, `Organization` e `Person` collegati; `BlogPosting` con autore, editore, `wordCount` e `timeRequired`; `BreadcrumbList`, `CollectionPage` e `ProfilePage`.
- **Feed RSS** con il testo completo degli ultimi 20 articoli, e **`/llms.txt`**, un indice in Markdown per assistenti AI.
- **Sitemap** con `lastmod` reale; le categorie vuote non vengono incluse e sono `noindex`.
- **IndexNow:** con `INDEXNOW_KEY` impostata, a ogni pubblicazione, modifica o eliminazione Bing e gli altri motori compatibili vengono avvisati. Il file di verifica è servito su `/indexnow.txt`.
- **Verifica proprietà:** `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` aggiungono i tag di verifica alle pagine. Non sostituiscono la verifica effettiva nel pannello Google/Bing.
- `/admin` e `/api` non sono mai indicizzabili (header `X-Robots-Tag` e meta `noindex`).

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

La newsletter email non è attiva: la homepage propone il feed RSS, senza raccogliere indirizzi email. Il sito utilizza statistiche proprietarie di prima parte sulle visualizzazioni: registra percorso, timestamp, sorgente, eventuali UTM e hostname del referrer, senza IP, cookie analytics o identificatori persistenti nella tabella statistica. Il periodo di conservazione previsto è di 12 mesi; la pulizia viene eseguita durante le chiamate alle API analytics/statistiche e può quindi slittare se non ci sono richieste. I dettagli sono descritti nella Privacy Policy. Prima di introdurre newsletter, pubblicità, profilazione o strumenti di analytics di terze parti, aggiorna l’informativa e valuta gli eventuali consensi necessari.

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

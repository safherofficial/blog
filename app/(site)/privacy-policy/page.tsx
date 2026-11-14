import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/db'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Informativa sul trattamento dei dati personali da parte di Controluce.',
  path: '/privacy-policy',
})

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings().catch(() => null)
  const owner = settings?.authorName?.trim() || 'il titolare del sito Controluce'
  const instagramUrl = settings?.instagramUrl

  return (
    <section className="privacy-page py-16 md:py-24">
      <div className="wrap max-w-[800px]">
        <div className="reveal-on-scroll mb-10">
          <p className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">
            <span className="inline-block h-px w-8 bg-ochre" />
            Informazioni legali
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Ultimo aggiornamento: 14 novembre 2026</p>
        </div>

        <div className="legal-panel reveal-on-scroll bg-bg-soft p-6 md:p-10">
          <div className="space-y-8 font-serif text-lg leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:not-italic [&_h2]:text-ink [&_p]:mb-3 [&_a]:underline [&_a]:decoration-ochre/70 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-wine">
            <p>
              Questa informativa descrive come Controluce tratta i dati personali durante la consultazione del blog
              e quando una persona invia un messaggio tramite la pagina «Parliamone». Il sito non offre una newsletter,
              non utilizza pubblicità comportamentale e non vende i dati personali.
            </p>

            <div>
              <h2>Titolare del trattamento e contatti</h2>
              <p>
                Il titolare del trattamento è {owner}. Per domande sull’informativa o per esercitare i diritti descritti
                più avanti, puoi utilizzare la <Link href="/scrivimi">pagina Parliamone</Link>, indicando che si tratta
                di una richiesta relativa alla privacy e inserendo solo le informazioni necessarie.
              </p>
              {instagramUrl && (
                <p>
                  È disponibile anche il canale pubblico di contatto: <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>.
                </p>
              )}
            </div>

            <div>
              <h2>Dati tecnici di navigazione e sicurezza</h2>
              <p>
                Quando una pagina viene richiesta, l’infrastruttura che ospita il sito può trattare dati tecnici necessari
                a trasmettere la risposta, mantenere il servizio sicuro e prevenire abusi. Questi dati possono comprendere
                indirizzo IP, data e ora della richiesta, pagina richiesta, informazioni sul browser e intestazioni HTTP.
                Tali informazioni possono essere presenti nei log tecnici dei fornitori anche se non vengono salvate nella
                tabella delle statistiche di Controluce.
              </p>
              <p>
                Alcune API utilizzano temporaneamente l’indirizzo IP, o un suo hash, in memoria per limitare invii ripetuti
                e tentativi di accesso. Il codice applicativo non salva questo dato nei record dei messaggi o delle
                visualizzazioni; i log dell’infrastruttura restano soggetti alle regole di conservazione dei rispettivi
                fornitori.
              </p>
            </div>

            <div>
              <h2>Statistiche di utilizzo del sito</h2>
              <p>
                Controluce utilizza uno strumento statistico proprietario di prima parte, ospitato insieme al sito e al
                database. Serve a capire quali contenuti vengono consultati e da quali canali arrivano le visite.
                Non è un servizio pubblicitario e non viene usato per creare profili individuali o seguire le persone
                su siti diversi.
              </p>
              <p>
                A ogni navigazione pubblica il browser invia al sito il percorso della pagina, l’eventuale sorgente,
                mezzo e campagna indicati nei parametri UTM e il solo nome host del sito di provenienza. Il sistema
                registra la data e l’ora e una riga per ciascuna visualizzazione. Il percorso è registrato senza la
                stringa di query; l’URL completo di provenienza non viene inviato né conservato.
              </p>
              <p>
                La tabella delle statistiche non contiene indirizzi IP, User-Agent, cookie identificativi, identificatori
                persistenti o ID di visitatore/sessione. L’User-Agent della richiesta può essere letto momentaneamente
                dall’API per escludere alcuni bot, ma non viene scritto nella tabella. Il pannello mostra conteggi
                aggregati di visualizzazioni: non misura persone uniche e non ricostruisce la navigazione individuale
                tra sessioni.
              </p>
              <p>
                Gli eventi statistici sono conservati per un massimo di 12 mesi. La pulizia automatica elimina gli eventi
                più vecchi durante l’utilizzo periodico delle API di analytics e statistiche. Le protezioni del browser,
                gli ad blocker e le impostazioni di privacy possono impedire la registrazione di alcune visualizzazioni.
              </p>
            </div>

            <div>
              <h2>Messaggi inviati tramite «Parliamone»</h2>
              <p>
                Se scegli di inviare un messaggio, vengono trattati il testo, la categoria selezionata, l’eventuale nome
                o nickname e la data di invio. L’indirizzo email viene richiesto soltanto quando selezioni l’opzione
                per ricevere una risposta personale. Il sistema registra inoltre lo stato necessario a gestire il messaggio
                e il fatto che hai dichiarato di aver letto questa informativa.
              </p>
              <p>
                Il messaggio viene archiviato nel database e può essere consultato dall’amministrazione autorizzata.
                Non viene pubblicato automaticamente né trasformato in un articolo. Il flag di lettura dell’informativa
                non costituisce un consenso a ricevere marketing o a pubblicare il contenuto. Per utilizzare una storia
                o un estratto in un contenuto pubblico verrà chiesto un consenso separato.
              </p>
              <p>
                Il testo e gli eventuali recapiti sono conservati finché servono a gestire la comunicazione e l’eventuale
                risposta, quindi vengono eliminati dall’amministrazione quando non sono più necessari, fatti salvi
                obblighi di legge o la necessità di tutelare un diritto. Al momento non è configurata una cancellazione
                automatica a scadenza dei messaggi. Evita di inserire password, dati finanziari o informazioni
                particolarmente delicate che non siano necessarie.
              </p>
            </div>

            <div>
              <h2>Finalità e basi giuridiche</h2>
              <p>
                I dati tecnici sono trattati per rendere disponibile il sito, garantirne la sicurezza, prevenire abusi
                e adempiere agli obblighi applicabili. La base giuridica è il legittimo interesse del titolare alla
                gestione e protezione del servizio e, quando necessario, l’adempimento di obblighi di legge.
              </p>
              <p>
                Le statistiche di prima parte sono utilizzate per valutare l’interesse verso i contenuti e migliorare
                il blog, sulla base del legittimo interesse del titolare, limitato a misurazioni interne e minimizzate.
                Questa base richiede una valutazione documentata del bilanciamento con i diritti e le libertà degli
                interessati. I messaggi sono trattati per gestire la comunicazione volontariamente inviata e l’eventuale
                risposta richiesta, nonché per il legittimo interesse a mantenere una corrispondenza ordinata e sicura.
              </p>
              <p>
                Il conferimento del testo del messaggio è necessario per inviarlo; nome e categoria sono facoltativi.
                L’email è necessaria soltanto se chiedi una risposta personale. Se non fornisci l’email, puoi comunque
                inviare il messaggio senza richiedere una risposta.
              </p>
            </div>

            <div>
              <h2>Cookie e strumenti analoghi</h2>
              <p>
                Lo strumento statistico non utilizza cookie, Local Storage, fingerprinting o identificatori persistenti
                per riconoscere il browser. Non vengono installati cookie analytics, pubblicitari o di profilazione.
              </p>
              <p>
                I cookie di sessione sono utilizzati soltanto quando si accede alle aree riservate: «controluce_admin»
                per la sessione amministrativa, con durata massima di 8 ore, e «controluce_stats» per la sessione delle
                statistiche, con durata massima di 12 ore. Sono cookie HTTP-only, SameSite Lax e Secure in produzione,
                limitati ai rispettivi endpoint API; servono esclusivamente ad autenticare l’accesso e non sono usati
                per le statistiche dei lettori.
              </p>
            </div>

            <div>
              <h2>Destinatari e fornitori</h2>
              <p>
                I dati possono essere trattati dal titolare e dai fornitori tecnici necessari a gestire il sito:
                Vercel per hosting, esecuzione e distribuzione dell’applicazione, e Neon per il database PostgreSQL.
                Questi fornitori e i rispettivi subfornitori possono trattare dati per erogare, proteggere e mantenere
                i servizi secondo i contratti e gli accordi sul trattamento applicabili. Controluce non utilizza
                piattaforme esterne di web analytics.
              </p>
              <p>
                Per maggiori informazioni consulta le <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">informazioni privacy di Vercel</a>,
                il <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer">Data Processing Addendum di Vercel</a>
                e le <a href="https://neon.com/security" target="_blank" rel="noopener noreferrer">informazioni di sicurezza e conformità di Neon</a>.
              </p>
              <p>
                Le regioni effettive di conservazione e trattamento dipendono dalla configurazione dei progetti e dagli
                accordi attivi con i fornitori. Qualora si verifichino trasferimenti di dati fuori dallo Spazio economico
                europeo, questi devono essere regolati dai meccanismi previsti dal GDPR, come una decisione di adeguatezza
                o garanzie appropriate. Il titolare deve verificare la regione configurata e gli accordi applicabili
                nei propri account Vercel e Neon.
              </p>
            </div>

            <div>
              <h2>Conservazione dei dati</h2>
              <p>
                Le statistiche di navigazione sono cancellate automaticamente oltre il limite di 12 mesi. I messaggi
                inviati vengono conservati fino a quando sono necessari per la gestione della comunicazione e poi
                eliminati dall’amministrazione; non è al momento attiva una scadenza automatica per questa categoria.
                I log tecnici dei fornitori seguono invece i tempi e i criteri definiti dai rispettivi servizi e contratti.
              </p>
            </div>

            <div>
              <h2>Diritti dell’interessato</h2>
              <p>
                Nei casi previsti dal Regolamento (UE) 2016/679 puoi chiedere accesso ai dati, rettifica, cancellazione,
                limitazione del trattamento e opporti ai trattamenti basati sul legittimo interesse. Puoi inoltre
                proporre reclamo al Garante per la protezione dei dati personali. Per esercitare i tuoi diritti,
                utilizza la <Link href="/scrivimi">pagina Parliamone</Link> indicando chiaramente la natura della richiesta.
              </p>
              <p>
                Le informazioni e i contatti dell’Autorità sono disponibili su
                <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer"> garanteprivacy.it</a>.
              </p>
            </div>
          </div>
        </div>

        <p className="reveal-on-scroll mt-8 text-sm leading-relaxed text-ink-soft">
          Questa informativa descrive il funzionamento applicativo osservato al 14 novembre 2026 e non costituisce
          consulenza legale. Il titolare deve verificare e completare la propria identità, i recapiti, la valutazione
          del legittimo interesse, le regioni dei fornitori e gli accordi effettivamente attivi.
        </p>

        <Link href="/" className="nav-link mt-10 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-wine">
          {'← Torna alla home'}
        </Link>
      </div>
    </section>
  )
}

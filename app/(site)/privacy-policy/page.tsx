import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Informativa sul trattamento dei dati personali da parte di Controluce.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  const owner = 'CONTROLUCE'

  return (
    <section className="privacy-page py-16 md:py-24">
      <div className="wrap max-w-[800px]">
        <div className="reveal-on-scroll mb-10">
          <p className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">
            <span className="inline-block h-px w-8 bg-ochre" />
            Informazioni
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Ultimo aggiornamento: 18 novembre 2026</p>
        </div>

        <div className="legal-panel reveal-on-scroll bg-bg-soft p-6 md:p-10">
          <div className="space-y-7 font-serif text-lg leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:not-italic [&_h2]:text-ink [&_p]:mb-3 [&_a]:underline [&_a]:decoration-ochre/70 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-wine">
            <p>
              Questa informativa spiega in modo semplice quali dati possono essere trattati quando visiti Controluce
              o decidi di inviare un messaggio tramite «Parliamone». Il blog è gratuito: non vende prodotti o servizi,
              non ha una newsletter attiva, non mostra pubblicità e non utilizza strumenti di profilazione.
            </p>

            <div>
              <h2>Titolare e contatti</h2>
              <p>
                Il titolare del trattamento è {owner}. Per domande su questa informativa o per esercitare i tuoi diritti,
                puoi utilizzare la <Link href="/scrivimi">pagina Parliamone</Link>, specificando che la richiesta riguarda
                la privacy e condividendo soltanto le informazioni necessarie.
              </p>
            </div>

            <div>
              <h2>Statistiche di navigazione</h2>
              <p>
                Controluce utilizza statistiche interne per capire quali pagine vengono lette e da quali canali arrivano
                le visite. Quando navighi nelle pagine pubbliche, il sito può registrare il percorso della pagina visitata,
                la data e l’ora, la provenienza della visita e, quando presenti, la sorgente, il mezzo e la campagna
                indicati nei parametri UTM.
              </p>
              <p>
                Se arrivi da un altro sito viene registrato soltanto il suo nome di dominio, non l’indirizzo completo
                della pagina di provenienza. Anche il percorso della pagina visitata viene registrato senza i parametri
                successivi al punto interrogativo. Non inserire dati personali nei parametri UTM dei link.
              </p>
              <p>
                Nel database delle statistiche di Controluce non vengono salvati indirizzi IP, indirizzi email, nomi,
                cookie identificativi o codici che permettano di riconoscere una persona nelle visite successive. L’informazione tecnica sul
                browser (User-Agent) viene letta momentaneamente per riconoscere ed escludere alcuni bot, ma non viene
                salvata nella tabella delle statistiche. I dati servono soltanto a produrre conteggi aggregati delle
                visualizzazioni: non misurano le persone uniche e non creano profili individuali.
              </p>
              <p>
                Gli eventi statistici sono conservati per un periodo previsto di 12 mesi. Il sistema avvia la pulizia
                dei dati più vecchi quando vengono utilizzate le funzioni di statistiche; se tali funzioni non vengono
                chiamate per un certo periodo, la cancellazione può avvenire alla chiamata successiva.
              </p>
            </div>

            <div>
              <h2>Messaggi inviati tramite «Parliamone»</h2>
              <p>
                Se scegli di scrivere, il sito salva il messaggio, la data di invio e la categoria eventualmente
                selezionata. Puoi anche indicare un nome o nickname, ma è facoltativo. L’indirizzo email viene richiesto
                soltanto se selezioni l’opzione per ricevere una risposta personale; in quel caso viene usato per gestire
                la risposta e non per inviarti comunicazioni promozionali.
              </p>
              <p>
                Il messaggio non viene pubblicato automaticamente né condiviso come contenuto del blog. La conferma
                di aver letto questa informativa serve a poter inviare il modulo e non equivale a un’iscrizione
                a comunicazioni commerciali. Non chiediamo dati particolari e ti invitiamo a non inserire nel testo
                informazioni sensibili, password o dati che non siano necessari.
              </p>
              <p>
                Il messaggio non è pubblico ed è consultabile dal pannello soltanto dall’amministrazione del blog. Al momento
                non è attiva una cancellazione automatica: i messaggi vengono eliminati dall’amministrazione quando
                non sono più necessari per gestire la comunicazione, fatti salvi eventuali obblighi di legge.
              </p>
            </div>

            <div>
              <h2>Dati tecnici e sicurezza</h2>
              <p>
                Come avviene normalmente quando si visita un sito, i fornitori tecnici che lo rendono disponibile
                possono trattare informazioni necessarie a trasmettere le pagine, garantire la sicurezza e prevenire
                abusi. Queste informazioni possono comprendere indirizzo IP, data e ora della richiesta, pagina richiesta,
                browser e intestazioni tecniche. Sono dati trattati a livello di infrastruttura e non vengono inseriti
                nella tabella delle statistiche di Controluce.
              </p>
              <p>
                Per limitare invii ripetuti e tentativi di accesso, alcune funzioni utilizzano temporaneamente
                l’indirizzo IP o il suo hash in memoria. L’applicazione non lo salva nei record delle visualizzazioni
                o dei messaggi.
              </p>
            </div>

            <div>
              <h2>Cookie e memoria del browser</h2>
              <p>
                Le pagine pubbliche non utilizzano cookie di profilazione o cookie per le statistiche e non impiegano
                strumenti di fingerprinting per riconoscere i visitatori. Non viene utilizzato Local Storage per
                tracciare la navigazione.
              </p>
              <p>
                I cookie tecnici «controluce_admin» e «controluce_stats» vengono creati soltanto dopo l’accesso,
                rispettivamente, alle funzioni amministrative e alle statistiche riservate. Servono a mantenere
                l’autenticazione: il primo dura al massimo 8 ore, il secondo al massimo 12 ore. Non sono usati
                per tracciare i lettori.
              </p>
              <p>
                Il pannello editoriale può utilizzare la memoria locale del browser per conservare temporaneamente
                una copia di ripristino delle bozze mentre vengono modificate. Questa funzione riguarda l’area
                amministrativa e non serve a monitorare i visitatori.
              </p>
            </div>

            <div>
              <h2>Fornitori tecnici</h2>
              <p>
                Per funzionare, Controluce utilizza Vercel per ospitare e distribuire il sito e Neon per il database
                in cui sono conservati articoli, impostazioni, statistiche e messaggi inviati tramite Parliamone.
                Questi fornitori possono trattare dati tecnici necessari a erogare, proteggere e mantenere i rispettivi
                servizi, secondo le proprie condizioni e informative.
              </p>
              <p>
                Puoi consultare le <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">informazioni privacy di Vercel</a>
                e le <a href="https://neon.com/security" target="_blank" rel="noopener noreferrer">informazioni di sicurezza di Neon</a>.
                I tempi di conservazione dei log tecnici dipendono dai servizi e dalle impostazioni dei fornitori.
              </p>
            </div>

            <div>
              <h2>Perché vengono trattati i dati</h2>
              <p>
                I dati tecnici servono a rendere disponibile e sicuro il sito. Le statistiche sono utilizzate per
                comprendere l’interesse verso gli articoli e migliorare il blog, con una raccolta limitata e senza
                identificatori persistenti. I dati inviati tramite Parliamone servono a ricevere il messaggio e,
                soltanto quando richiesto, a poter rispondere.
              </p>
              <p>
                I dati non vengono venduti né utilizzati da Controluce per creare profili pubblicitari o inviare
                newsletter. Non vengono raccolte informazioni ulteriori rispetto a quelle descritte in questa pagina
                attraverso i moduli pubblici del sito.
              </p>
            </div>

            <div>
              <h2>I tuoi diritti</h2>
              <p>
                Nei casi previsti dalla normativa sulla protezione dei dati puoi chiedere di sapere quali dati ti
                riguardano, ottenerne la rettifica o la cancellazione, limitarne il trattamento oppure opporti
                al trattamento nei casi previsti. Per farlo, scrivi tramite la <Link href="/scrivimi">pagina Parliamone</Link>
                indicando chiaramente che si tratta di una richiesta relativa alla privacy.
              </p>
            </div>
          </div>
        </div>

        <Link href="/" className="nav-link mt-10 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-wine">
          ← Torna alla home
        </Link>
      </div>
    </section>
  )
}

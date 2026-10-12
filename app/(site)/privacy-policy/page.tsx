import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo/metadata'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/db'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Informativa sulla privacy di Controluce.',
  path: '/privacy-policy',
})

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings().catch(() => null)
  const owner = settings?.authorName || 'il titolare del sito'
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
        </div>

        <div className="legal-panel reveal-on-scroll bg-bg-soft p-6 md:p-10">
          <div className="space-y-8 font-serif text-lg leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:not-italic [&_h2]:text-ink [&_p]:mb-3 [&_a]:underline [&_a]:decoration-ochre/70 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-wine">
            <p>
              Questa informativa descrive il trattamento dei dati personali connesso alla visita del sito Controluce.
              Il sito non offre una newsletter via email; la pagina «Parliamone» consente invece di inviare volontariamente
              un messaggio privato per condividere pensieri ed esperienze. L&apos;indirizzo email viene richiesto soltanto se desideri ricevere una risposta.
            </p>

            <div>
              <h2>Titolare del trattamento</h2>
              <p>Il titolare del trattamento è {owner}. Prima della pubblicazione, il titolare deve verificare che le informazioni identificative e i recapiti per le richieste privacy siano completi e aggiornati.</p>
              {instagramUrl && (
                <p>
                  È disponibile anche il seguente canale pubblico di contatto: <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>.
                </p>
              )}
            </div>

            <div>
              <h2>Dati tecnici e hosting</h2>
              <p>
                Il fornitore di hosting e i servizi infrastrutturali utilizzati dal sito possono trattare dati tecnici
                necessari alla consegna delle pagine, alla sicurezza e alla prevenzione degli abusi, come indirizzo IP,
                informazioni sul browser, data e ora delle richieste e risorse richieste. Il sito usa Vercel e Vercel Postgres
                per hosting e gestione dei contenuti.
              </p>
            </div>

            <div>
              <h2>Finalità e base giuridica</h2>
              <p>
                I dati tecnici vengono trattati nella misura necessaria al funzionamento, alla sicurezza e alla manutenzione
                del sito, nonché per adempiere agli obblighi di legge applicabili. L&apos;eventuale attivazione futura di newsletter,
                analytics o strumenti di marketing richiederà l&apos;aggiornamento di questa informativa e l&apos;implementazione degli
                eventuali consensi necessari prima della raccolta dei relativi dati.
              </p>
            </div>

            <div>
              <h2>Messaggi inviati tramite «Parliamone»</h2>
              <p>
                Se invii un messaggio, il sito tratta il testo, l&apos;eventuale nome o nickname, la categoria scelta e,
                soltanto se chiedi una risposta, il tuo indirizzo email. Questi dati sono utilizzati per leggere e gestire
                la comunicazione e, quando richiesto e possibile, risponderti. I messaggi sono archiviati nel database
                del sito e sono accessibili esclusivamente all&apos;amministrazione autorizzata.
              </p>
              <p>
                I messaggi non vengono pubblicati automaticamente né trasformati in articoli. Per utilizzare una storia
                o un estratto in un contenuto pubblico verrà chiesto un consenso separato. Evita di includere password,
                dati finanziari o informazioni particolarmente delicate che non siano necessarie. I messaggi vengono
                cancellati quando non sono più necessari alla gestione della comunicazione, fatti salvi eventuali obblighi
                di legge. Puoi chiedere la cancellazione o esercitare i diritti applicabili utilizzando i recapiti diretti
                del titolare indicati sul sito.
              </p>
            </div>

            <div>
              <h2>Conservazione e destinatari</h2>
              <p>
                I dati tecnici possono essere trattati dai fornitori infrastrutturali secondo i rispettivi termini, misure
                di sicurezza e tempi di conservazione. Per informazioni aggiornate, consulta anche le informative dei
                fornitori effettivamente utilizzati dal titolare.
              </p>
            </div>

            <div>
              <h2>Diritti dell&apos;interessato</h2>
              <p>
                Nei casi previsti dal Regolamento (UE) 2016/679, puoi richiedere accesso, rettifica, cancellazione,
                limitazione del trattamento o opporti al trattamento, e puoi proporre reclamo al Garante per la protezione
                dei dati personali. Per esercitare i tuoi diritti, contatta il titolare utilizzando un recapito diretto
                pubblicato sul sito.
              </p>
              <p>
                Informazioni sul Garante sono disponibili su <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>.
              </p>
            </div>

            <div>
              <h2>Cookie</h2>
              <p>
                L&apos;applicazione non implementa intenzionalmente cookie pubblicitari o di profilazione. I cookie tecnici
                e gli eventuali cookie impostati dai fornitori infrastrutturali devono essere verificati nell&apos;ambiente
                effettivamente pubblicato e descritti in modo coerente con la configurazione reale.
              </p>
            </div>
          </div>
        </div>

        <p className="reveal-on-scroll mt-8 text-sm leading-relaxed text-ink-soft">
          Questo testo descrive l&apos;implementazione attuale e non costituisce consulenza legale. Prima del lancio,
          completa l&apos;identità e i recapiti del titolare e verifica i trattamenti effettivi, i fornitori e gli obblighi
          applicabili al tuo caso.
        </p>

        <Link href="/" className="nav-link mt-10 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-wine">
          {'← Torna alla home'}
        </Link>
      </div>
    </section>
  )
}

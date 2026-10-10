import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/db'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sulla privacy di Controluce.',
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings().catch(() => null)
  const owner = settings?.authorName || 'il titolare del sito'
  const instagramUrl = settings?.instagramUrl

  return (
    <section className="py-20 md:py-24">
      <div className="wrap max-w-[760px]">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Informazioni legali</p>
        <h1 className="mb-10 font-display text-4xl md:text-5xl">Privacy Policy</h1>

        <div className="space-y-8 font-serif text-lg leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:not-italic [&_h2]:text-ink [&_p]:mb-3">
          <p>
            Questa informativa descrive il trattamento dei dati personali connesso alla visita del sito Controluce.
            La versione attuale del sito non offre un modulo di iscrizione alla newsletter e non raccoglie indirizzi email
            tramite un form di iscrizione.
          </p>

          <div>
            <h2>Titolare del trattamento</h2>
            <p>Il titolare del trattamento è {owner}. Prima della pubblicazione, il titolare deve verificare che le informazioni identificative e i recapiti per le richieste privacy siano completi e aggiornati.</p>
            {instagramUrl && (
              <p>
                È disponibile anche il seguente canale pubblico di contatto: <a className="underline hover:text-wine" href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>.
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
              del sito, nonché per adempiere agli obblighi di legge applicabili. L'eventuale attivazione futura di newsletter,
              analytics o strumenti di marketing richiederà l'aggiornamento di questa informativa e l'implementazione degli
              eventuali consensi necessari prima della raccolta dei relativi dati.
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
            <h2>Diritti dell'interessato</h2>
            <p>
              Nei casi previsti dal Regolamento (UE) 2016/679, puoi richiedere accesso, rettifica, cancellazione,
              limitazione del trattamento o opporti al trattamento, e puoi proporre reclamo al Garante per la protezione
              dei dati personali. Per esercitare i tuoi diritti, contatta il titolare utilizzando un recapito diretto
              pubblicato sul sito.
            </p>
            <p>
              Informazioni sul Garante sono disponibili su <a className="underline hover:text-wine" href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>.
            </p>
          </div>

          <div>
            <h2>Cookie</h2>
            <p>
              L'applicazione non implementa intenzionalmente cookie pubblicitari o di profilazione. I cookie tecnici
              e gli eventuali cookie impostati dai fornitori infrastrutturali devono essere verificati nell'ambiente
              effettivamente pubblicato e descritti in modo coerente con la configurazione reale.
            </p>
          </div>
        </div>

        <p className="mt-12 text-sm text-ink-soft">
          Questo testo descrive l'implementazione attuale e non costituisce consulenza legale. Prima del lancio,
          completa l'identità e i recapiti del titolare e verifica i trattamenti effettivi, i fornitori e gli obblighi
          applicabili al tuo caso.
        </p>

        <Link
          href="/"
          className="nav-link mt-10 inline-block font-mono text-[11px] uppercase tracking-widest text-ink-soft hover:text-wine"
        >
          {'<- Torna alla home'}
        </Link>
      </div>
    </section>
  )
}

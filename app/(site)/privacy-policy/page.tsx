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
  const owner = settings?.authorName || '[Il tuo nome]'

  return (
    <section className="py-20 md:py-24">
      <div className="wrap max-w-[760px]">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Informazioni legali</p>
        <h1 className="mb-10 font-display text-4xl md:text-5xl">Privacy Policy</h1>

        <div className="space-y-8 font-serif text-lg leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:not-italic [&_h2]:text-ink [&_p]:mb-3">
          <p>
            Questa informativa descrive come vengono trattati i dati personali di chi visita questo sito
            e di chi si iscrive alla newsletter, in conformita al Regolamento (UE) 2016/679 (GDPR).
          </p>

          <div>
            <h2>Titolare del trattamento</h2>
            <p>Il titolare del trattamento e {owner}, autore/autrice del blog Controluce.</p>
          </div>

          <div>
            <h2>Dati raccolti</h2>
            <p>
              Se ti iscrivi alla newsletter, raccogliamo il tuo indirizzo email al solo scopo di inviarti
              i nuovi articoli pubblicati. Non raccogliamo altri dati personali tramite moduli su questo sito.
            </p>
            <p>
              Come per la maggior parte dei siti web, il fornitore di hosting e i servizi infrastrutturali
              usati dal sito (Vercel e Vercel Postgres) possono trattare automaticamente dati tecnici di
              navigazione (indirizzo IP, tipo di browser, pagine visitate) per finalita di sicurezza e
              funzionamento del servizio.
            </p>
          </div>

          <div>
            <h2>Finalita e base giuridica</h2>
            <p>
              L&apos;indirizzo email raccolto tramite il modulo di iscrizione viene trattato sulla base del
              consenso liberamente fornito al momento dell&apos;iscrizione (art. 6.1.a GDPR).
            </p>
          </div>

          <div>
            <h2>Conservazione dei dati</h2>
            <p>
              I dati vengono conservati finche l&apos;iscrizione alla newsletter resta attiva, o fino a
              richiesta di cancellazione da parte dell&apos;interessato.
            </p>
          </div>

          <div>
            <h2>Diritti dell&apos;interessato</h2>
            <p>
              In qualsiasi momento puoi richiedere l&apos;accesso ai tuoi dati, la rettifica, la cancellazione,
              la limitazione del trattamento o opporti al trattamento, scrivendo a {owner}. Puoi inoltre
              disiscriverti dalla newsletter tramite il link presente in ogni email ricevuta.
            </p>
            <p>
              Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali
              (www.garanteprivacy.it) se ritieni che il trattamento dei tuoi dati violi la normativa vigente.
            </p>
          </div>

          <div>
            <h2>Cookie</h2>
            <p>
              Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento, senza cookie di
              profilazione di terze parti al momento attivi. Se in futuro verranno aggiunti strumenti di
              analisi o marketing, questa informativa sara aggiornata di conseguenza.
            </p>
          </div>
        </div>

        <p className="mt-12 text-sm text-ink-soft">
          Questo testo e un modello generico e non sostituisce una consulenza legale. Se raccogli dati
          personali in modo strutturato, e consigliabile far verificare l&apos;informativa da un
          professionista.
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

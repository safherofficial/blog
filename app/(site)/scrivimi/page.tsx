import type { Metadata } from 'next'
import ReaderMessageForm from '@/components/ReaderMessageForm'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Parliamone — Uno spazio di condivisione',
  description: 'Uno spazio privato per dare voce ai pensieri e condividere esperienze, senza giudizi né aspettative di risposta.',
  path: '/scrivimi',
})

export default function ScrivimiPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="wrap max-w-[900px]">
        <header className="reveal-on-scroll mb-12 border-b border-line pb-9 md:mb-14">
          <p className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">
            <span className="inline-block h-px w-8 bg-ochre" />
            Uno spazio per te
          </p>
          <h1 className="mb-6 max-w-[16ch] font-display text-4xl leading-tight tracking-tight md:text-6xl">
            C&apos;è qualcosa che ti va di raccontare?
          </h1>
          <p className="max-w-[62ch] font-serif text-xl leading-relaxed text-ink-soft">
            A volte abbiamo solo bisogno di mettere i pensieri in parole e condividerli con qualcuno.
            Qui puoi raccontare ciò che stai vivendo, senza dover trovare per forza le parole perfette.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <aside className="reveal-on-scroll">
            <p className="mb-4 font-display text-2xl">Parliamone.</p>
            <div className="space-y-4 font-serif text-base leading-relaxed text-ink-soft">
              <p>Uno spazio per i tuoi pensieri, le tue emozioni e le esperienze che magari non hai ancora avuto occasione di condividere.</p>
              <p>Puoi raccontarmi un&apos;esperienza, liberare un pensiero che ti accompagna o condividere un tema che vorresti vedere affrontato su Controluce.</p>
              <p>Non devi avere tutto chiaro. Puoi semplicemente cominciare da dove vuoi.</p>
            </div>
            <p className="mt-7 font-display text-xl italic text-wine">Dall&apos;altra parte ci sono io. Ti leggo con attenzione.</p>
          </aside>

          <div className="reveal-on-scroll">
            <ReaderMessageForm />
          </div>
        </div>
      </div>
    </section>
  )
}

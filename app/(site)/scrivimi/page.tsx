import type { Metadata } from 'next'
import ReaderMessageForm from '@/components/ReaderMessageForm'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Raccontamelo — Scrivi a Lea',
  description: 'Uno spazio privato per condividere un pensiero, chiedere un consiglio o suggerire un argomento a Lea di Controluce.',
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
            A volte abbiamo bisogno di un consiglio, altre volte soltanto di qualcuno a cui raccontare quello che stiamo vivendo.
            Qui puoi farlo, senza dover trovare per forza le parole perfette.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <aside className="reveal-on-scroll">
            <p className="mb-4 font-display text-2xl">Raccontamelo.</p>
            <div className="space-y-4 font-serif text-base leading-relaxed text-ink-soft">
              <p>Uno spazio per i tuoi pensieri, i tuoi dubbi, le tue esperienze e quelle domande che magari non hai ancora avuto occasione di condividere.</p>
              <p>Puoi chiedermi un parere, raccontarmi qualcosa che ti è successo o suggerirmi un argomento per Controluce.</p>
              <p>Non devi avere tutto chiaro. Puoi semplicemente cominciare da dove vuoi.</p>
            </div>
            <p className="mt-7 font-display text-xl italic text-wine">Sono Lea. Ti leggo volentieri.</p>
          </aside>

          <div className="reveal-on-scroll">
            <ReaderMessageForm />
          </div>
        </div>
      </div>
    </section>
  )
}

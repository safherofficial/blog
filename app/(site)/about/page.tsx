import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import CropFrame from '@/components/CropFrame'
import { AUTHOR_DESCRIPTION, AUTHOR_PEN_NAME } from '@/lib/author'
import { safeJsonLd } from '@/lib/content/safe-json'
import { breadcrumbJsonLd } from '@/lib/seo/jsonld'
import { absoluteUrl } from '@/lib/seo/site'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: 'Chi sono',
  description: 'La storia dietro Controluce: una voce editoriale personale, la passione per la scrittura e il desiderio di raccontare storie per lettori di tutte le età.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <article className="about-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'ProfilePage',
                '@id': absoluteUrl('/about#profile'),
                url: absoluteUrl('/about'),
                name: `Chi sono — ${AUTHOR_PEN_NAME}`,
                description: AUTHOR_DESCRIPTION,
                inLanguage: 'it-IT',
                mainEntity: { '@id': absoluteUrl('/#author') },
              },
              breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Chi sono', path: '/about' }]),
            ],
          }),
        }}
      />

      <header className="relative overflow-hidden border-b border-[#4E3B2B] bg-ink py-14 text-bg md:py-20">
        <div className="wrap grid grid-cols-1 items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          <div className="reveal-on-scroll">
            <p className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#D9B47F]">
              <span className="inline-block h-px w-8 bg-[#D9B47F]" />
              Dietro la firma
            </p>
            <h1 className="mb-7 max-w-[18ch] font-display text-4xl leading-tight tracking-tight text-[#F5EFE5] sm:text-5xl md:text-6xl">
              Ciao, sono <em className="font-normal italic text-[#D9B78A]">{AUTHOR_PEN_NAME}.</em>
            </h1>
            <p className="mb-6 max-w-[54ch] font-serif text-xl leading-relaxed text-[#F0E5D7]">
              Una voce, tante storie e la voglia di guardare un po’ più a fondo.
            </p>
            <p className="max-w-[58ch] text-[15px] leading-relaxed text-[#D9C9B7]">
              Controluce è lo pseudonimo con cui ho scelto di condividere ciò che scrivo. Preferisco mantenere privata la mia identità personale e lasciare che siano le parole, le idee e i temi affrontati a presentarmi. Non è un personaggio costruito: è una firma dentro cui sentirmi libera di raccontare.
            </p>
          </div>

          <div className="editorial-media-frame reveal-on-scroll relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden border border-[#A17A45]/50 bg-gradient-to-br from-ochre to-wine">
            <CropFrame />
            <Image
              src="/images/controluce-hero.webp"
              alt="Figura femminile in controluce, immagine simbolica dell’identità editoriale di Controluce"
              fill
              priority
              unoptimized
              sizes="(max-width: 767px) 100vw, 42vw"
              className="object-cover object-[14%_center]"
            />
          </div>
        </div>
      </header>

      <section className="wrap py-16 md:py-24">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">La scrittura, prima di tutto</p>
          <h2 className="mb-8 max-w-[22ch] font-display text-3xl leading-tight tracking-tight text-ink md:text-5xl">
            La passione c’era da sempre. Il coraggio di pubblicare è arrivato dopo.
          </h2>
          <div className="article-prose max-w-[760px] font-serif text-lg leading-[1.9] text-ink-soft">
            <p>
              Sono italiana e la scrittura è una passione che mi accompagna da sempre. Mi ha sempre attirata in particolare la sua dimensione giornalistica ed editoriale: osservare ciò che accade, approfondire le domande, cercare prospettive diverse e provare a trasformare pensieri e intuizioni in parole che possano arrivare a qualcuno.
            </p>
            <p>
              Per molto tempo ho scritto soprattutto per me. Solo da poco ho trovato il coraggio di pubblicare i miei testi e di farli uscire dal mio spazio personale. È un passaggio importante: esporsi attraverso le proprie parole richiede una forma di fiducia, prima di tutto in ciò che si ha da dire. Controluce nasce anche da questo desiderio di cominciare, senza aspettare che tutto sia perfetto.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-bg-soft py-16 md:py-20">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-start lg:gap-20">
          <div className="reveal-on-scroll">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Storie da immaginare</p>
            <h2 className="mb-6 max-w-[18ch] font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              Dai libri per bambini alle storie per adulti.
            </h2>
            <div className="space-y-5 font-serif text-lg leading-relaxed text-ink-soft">
              <p>
                Ho già pubblicato su Amazon il mio primo libro per bambini. È stata una tappa speciale: dare forma a una storia, accompagnarla fino alla pubblicazione e sapere che può raggiungere piccoli lettori.
              </p>
              <p>
                Mi piacerebbe continuare questo percorso con altri libri per bambini, ma anche esplorare storie e temi pensati per un pubblico adulto. Non voglio chiudermi in un solo genere: mi interessa la possibilità di cambiare prospettiva e trovare, ogni volta, la forma giusta per raccontare.
              </p>
            </div>
          </div>

          <aside className="reveal-on-scroll border-l border-ochre px-6 py-2 md:px-8">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Anche fuori dalle pagine</p>
            <p className="mb-5 font-serif text-lg leading-relaxed text-ink-soft">
              Amo fare sport: è uno spazio di energia, disciplina e libertà che fa parte della mia quotidianità.
            </p>
            <p className="font-serif text-lg leading-relaxed text-ink-soft">
              E poi c’è Lily, il mio gatto. Dire che è importante per me sarebbe riduttivo: è una presenza speciale, una piccola parte enorme della mia vita.
            </p>
          </aside>
        </div>
      </section>

      <section className="wrap py-16 md:py-24">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Perché Controluce</p>
          <h2 className="mb-6 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
            Perché non tutto si vede al primo sguardo.
          </h2>
          <p className="mx-auto mb-10 max-w-[60ch] font-serif text-lg leading-relaxed text-ink-soft">
            Mi piace l’idea di fermarmi un momento, cambiare angolazione e osservare quello che spesso resta ai margini. È lo spirito con cui vorrei scrivere qui: con curiosità, sensibilità e rispetto per la complessità delle cose. Se in una pagina troverai una domanda nuova, un pensiero in cui riconoscerti o semplicemente un motivo per guardare diversamente qualcosa, allora Controluce avrà già trovato il suo senso.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/articoli"
              className="editorial-button inline-flex items-center gap-4 border border-wine bg-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-bg hover:border-wine-dark hover:bg-wine-dark"
            >
              Leggi gli articoli <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/scrivimi"
              className="editorial-button inline-flex items-center gap-4 border border-wine px-7 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-wine hover:bg-wine hover:text-bg"
            >
              Parliamone <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}

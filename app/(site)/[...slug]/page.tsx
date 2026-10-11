import { notFound } from 'next/navigation'

// Ogni indirizzo sconosciuto passa da qui, così la 404 mantiene testata, footer e stile del sito.
export default function CatchAll() {
  notFound()
}

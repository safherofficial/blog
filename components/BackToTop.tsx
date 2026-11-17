export default function BackToTop() {
  return (
    <a
      href="#top"
      data-back-to-top
      data-visible="false"
      aria-label="Torna all'inizio della pagina"
      title="Torna su"
      className="scroll-top-control fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center border border-ochre bg-ink text-bg"
    >
      <span aria-hidden="true" className="font-mono text-xs">↑</span>
    </a>
  )
}

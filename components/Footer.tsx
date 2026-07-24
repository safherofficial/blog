export default function Footer({ authorName }: { authorName?: string }) {
  return (
    <footer className="border-t border-line py-11">
      <div className="wrap flex flex-wrap items-center justify-between gap-5">
        <span className="font-display italic text-xl">
          Contro<em className="text-wine not-italic italic">luce</em>
        </span>
        <small className="text-sm text-ink-soft">
          © {new Date().getFullYear()} Controluce — {authorName || '[Il tuo nome]'}. Tutti i diritti riservati.
        </small>
      </div>
    </footer>
  )
}

'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

const fieldClass = 'w-full border border-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-wine focus:ring-1 focus:ring-wine/25'
const categories = [
  { value: '', label: 'Scegli un tema (facoltativo)' },
  { value: 'racconto', label: 'Ho qualcosa da condividere' },
  { value: 'argomento', label: 'Vorrei suggerirti un tema per Controluce' },
  { value: 'altro', label: 'Altro' },
]

export default function ReaderMessageForm() {
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [wantsReply, setWantsReply] = useState(false)
  const [email, setEmail] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/reader-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message, name, wantsReply, email, privacyAccepted, companyWebsite }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Non è stato possibile inviare il messaggio. Riprova.')
      setSubmitted(true)
      setCategory('')
      setMessage('')
      setName('')
      setWantsReply(false)
      setEmail('')
      setPrivacyAccepted(false)
      setCompanyWebsite('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Non è stato possibile inviare il messaggio. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  if (submitted) {
    return (
      <section className="border border-line bg-bg-soft p-6 md:p-9" aria-live="polite">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ochre">Messaggio ricevuto</p>
        <h2 className="mb-4 font-display text-3xl">Grazie per aver condiviso i tuoi pensieri.</h2>
        <div className="space-y-4 font-serif text-lg leading-relaxed text-ink-soft">
          <p>Ho ricevuto il tuo messaggio.</p>
          <p>Leggerò quello che mi hai scritto con attenzione. Non sempre sarà possibile rispondere personalmente, ma ciò che condividi verrà trattato con rispetto.</p>
          <p className="font-display text-xl italic text-wine">Grazie per la fiducia.</p>
        </div>
        <button type="button" onClick={() => setSubmitted(false)} className="nav-link mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:text-wine">
          Invia un altro messaggio
        </button>
      </section>
    )
  }

  return (
    <form onSubmit={submit} className="border border-line bg-bg-soft p-5 md:p-8">
      <div className="mb-7">
        <label htmlFor="reader-category" className="mb-2 block text-sm font-medium text-ink">Di cosa vuoi parlarmi?</label>
        <select id="reader-category" className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      <div className="mb-7">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor="reader-message" className="block text-sm font-medium text-ink">Raccontami quello che vuoi</label>
          <span className="shrink-0 font-mono text-[10px] text-ink-soft">{message.length}/5000</span>
        </div>
        <textarea
          id="reader-message"
          className={`${fieldClass} min-h-60 resize-y leading-relaxed`}
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, 5000))}
          minLength={10}
          maxLength={5000}
          required
          placeholder="Prenditi il tuo tempo. Puoi iniziare da dove vuoi…"
          aria-describedby="reader-message-hint"
        />
        <p id="reader-message-hint" className="mt-2 text-xs leading-relaxed text-ink-soft">Da 10 a 5.000 caratteri. Non è necessario condividere più di quanto ti faccia sentire a tuo agio.</p>
      </div>

      <div className="mb-7">
        <label htmlFor="reader-name" className="mb-2 block text-sm font-medium text-ink">Come vuoi che ti chiami? <span className="font-normal text-ink-soft">(facoltativo)</span></label>
        <input id="reader-name" className={fieldClass} value={name} onChange={(event) => setName(event.target.value.slice(0, 80))} maxLength={80} autoComplete="nickname" placeholder="Nome o nickname" />
      </div>

      <div className="mb-7 border-t border-line pt-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink" htmlFor="reader-wants-reply">
          <input id="reader-wants-reply" type="checkbox" checked={wantsReply} onChange={(event) => { setWantsReply(event.target.checked); if (!event.target.checked) setEmail('') }} className="mt-1 accent-[#765338]" />
          <span>Mi piacerebbe ricevere una risposta personale.</span>
        </label>
        {wantsReply && (
          <div className="mt-4">
            <label htmlFor="reader-email" className="mb-2 block text-sm font-medium text-ink">La tua email</label>
            <input id="reader-email" type="email" className={fieldClass} value={email} onChange={(event) => setEmail(event.target.value.slice(0, 254))} maxLength={254} autoComplete="email" required placeholder="nome@esempio.it" />
            <p className="mt-2 text-xs text-ink-soft">L&apos;email viene usata soltanto per gestire la risposta al tuo messaggio.</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink" htmlFor="reader-privacy">
          <input id="reader-privacy" type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} className="mt-1 accent-[#765338]" required />
          <span>Ho letto l&apos;<Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline decoration-ochre underline-offset-4 hover:text-wine">informativa sulla privacy</Link> e desidero inviare il messaggio.</span>
        </label>
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="reader-company-website">Non compilare questo campo</label>
        <input id="reader-company-website" name="companyWebsite" tabIndex={-1} autoComplete="off" value={companyWebsite} onChange={(event) => setCompanyWebsite(event.target.value)} />
      </div>

      {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button type="submit" disabled={busy || message.trim().length < 10 || !privacyAccepted || (wantsReply && !email.trim())} className="editorial-button inline-flex w-full items-center justify-center gap-4 border border-wine bg-wine px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bg hover:bg-wine-dark disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? 'Invio in corso…' : 'Parliamone'}
        {!busy && <span aria-hidden="true" className="text-lg leading-none">→</span>}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-ink-soft">Il tuo messaggio non viene pubblicato sul blog. Se chiedi una risposta, farò il possibile per leggere e rispondere quando riesco; la risposta non è garantita.</p>
    </form>
  )
}

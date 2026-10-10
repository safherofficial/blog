'use client'

import { useState } from 'react'
import { portableTextToEditorText } from '@/lib/content/editor'
import type { Notify, SiteSettingsRow } from './types'
import { Card, Counter, Field, inputClass, primaryButton } from './ui'

export default function SettingsForm({ settings, notify, onSaved, onUnauthorized }: { settings: SiteSettingsRow; notify: Notify; onSaved: () => void; onUnauthorized: () => void }) {
  const [form, setForm] = useState({
    siteTitle: settings.site_title || 'Controluce',
    tagline: settings.tagline || '',
    authorName: settings.author_name || '',
    authorBioText: portableTextToEditorText(settings.author_bio),
    authorPhotoUrl: settings.author_photo_url || '',
    authorPhotoAlt: settings.author_photo_alt || '',
    instagramUrl: settings.instagram_url || '',
    signatureQuote: settings.signature_quote || '',
  })
  const [busy, setBusy] = useState(false)
  const [photoBroken, setPhotoBroken] = useState(false)
  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }))
  const photoValid = /^https:\/\//i.test(form.authorPhotoUrl.trim())

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.status === 401) return onUnauthorized()
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return notify('error', data.error || 'Errore nel salvataggio.')
      notify('success', 'Impostazioni salvate.')
      onSaved()
    } catch {
      notify('error', 'Impossibile salvare le impostazioni. Controlla la connessione.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="grid max-w-4xl gap-6">
      <Card title="Identità del blog" description="Nome e tagline compaiono nel sito e nei risultati di ricerca.">
        <div className="grid gap-5">
          <Field id="site-title" label="Nome del blog" counter={<Counter value={form.siteTitle.length} max={120} />}>
            <input id="site-title" value={form.siteTitle} onChange={(e) => set('siteTitle', e.target.value)} maxLength={120} className={inputClass} />
          </Field>
          <Field id="site-tagline" label="Tagline" hint="Una frase che spiega di cosa parla il blog." counter={<Counter value={form.tagline.length} max={300} />}>
            <input id="site-tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} maxLength={300} className={inputClass} />
          </Field>
          <Field id="signature-quote" label="Citazione in evidenza" counter={<Counter value={form.signatureQuote.length} max={1000} />}>
            <textarea id="signature-quote" value={form.signatureQuote} onChange={(e) => set('signatureQuote', e.target.value)} maxLength={1000} className={`${inputClass} min-h-24`} />
          </Field>
        </div>
      </Card>

      <Card title="Pagina «Chi sono»" description="Un autore riconoscibile e una biografia vera rendono la pagina più autorevole per Google e più credibile per chi legge.">
        <div className="grid gap-5">
          <Field id="author-name" label="Nome autrice/autore" hint="Diventa il titolo della pagina: «Ciao, sono …».">
            <input id="author-name" value={form.authorName} onChange={(e) => set('authorName', e.target.value)} className={inputClass} />
          </Field>
          <Field id="author-bio" label="Biografia" hint="Paragrafi separati da una riga vuota. Evita testi generici: racconta chi sei e di cosa scrivi.">
            <textarea id="author-bio" value={form.authorBioText} onChange={(e) => set('authorBioText', e.target.value)} maxLength={20000} className={`${inputClass} min-h-48`} />
          </Field>
          <div className="grid gap-5 md:grid-cols-[1fr_160px]">
            <div className="grid content-start gap-5">
              <Field id="author-photo-url" label="URL foto profilo (HTTPS)" hint="Se vuoto, la pagina usa l’immagine editoriale predefinita.">
                <input id="author-photo-url" type="url" value={form.authorPhotoUrl} onChange={(e) => { setPhotoBroken(false); set('authorPhotoUrl', e.target.value) }} className={inputClass} placeholder="https://…" />
              </Field>
              <Field id="author-photo-alt" label="Testo alternativo foto" hint="Descrivi la foto in una frase." counter={<Counter value={form.authorPhotoAlt.length} max={300} />}>
                <input id="author-photo-alt" value={form.authorPhotoAlt} onChange={(e) => set('authorPhotoAlt', e.target.value)} maxLength={300} className={inputClass} />
              </Field>
            </div>
            <div className="flex aspect-[4/5] items-center justify-center overflow-hidden border border-dashed border-line bg-bg-soft p-2 text-center text-xs text-ink-soft">
              {photoValid && !photoBroken ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.authorPhotoUrl.trim()} alt={form.authorPhotoAlt || 'Anteprima foto profilo'} onError={() => setPhotoBroken(true)} className="h-full w-full object-cover" />
              ) : photoBroken ? 'Immagine non caricabile' : 'Anteprima'}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Social">
        <Field id="instagram-url" label="Profilo Instagram (HTTPS)">
          <input id="instagram-url" type="url" value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} className={inputClass} placeholder="https://www.instagram.com/…" />
        </Field>
      </Card>

      <div><button disabled={busy} className={primaryButton}>{busy ? 'Salvataggio…' : 'Salva impostazioni'}</button></div>
    </form>
  )
}

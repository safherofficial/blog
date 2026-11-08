'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { portableTextToEditorText } from '@/lib/content/editor'
import { isValidCoverImageUrl } from '@/lib/content/images'
import { LIMITS, TITLE_SUFFIX } from '@/lib/seo/constants'
import { analyzePost, countBySeverity } from '@/lib/seo/post-analyzer'
import { slugify } from '@/lib/seo/text'
import type { PostDraft, SeoIssue } from '@/lib/seo/types'
import SerpPreview from './SerpPreview'
import { postStatus, STATUS_LABEL, type Category, type Notify, type Post } from './types'
import { Card, Counter, Field, IssueGroups, ScoreRing, inputClass, primaryButton, secondaryButton } from './ui'
import { scoreLabel } from '@/lib/seo/types'

const MAX_COVER_UPLOAD_BYTES = 4 * 1024 * 1024
const COVER_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type FormState = {
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string
  coverImageAlt: string
  categoryId: string
  publishedAtLocal: string
  seoTitle: string
  seoDescription: string
  bodyText: string
  focusKeyword: string
}

function toLocalInput(value?: string): string {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formFromPost(post: Post | null): FormState {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    coverImageUrl: post?.cover_image_url ?? '',
    coverImageAlt: post?.cover_image_alt ?? '',
    categoryId: post?.category_id ?? '',
    publishedAtLocal: toLocalInput(post?.published_at),
    seoTitle: post?.seo_title ?? '',
    seoDescription: post?.seo_description ?? '',
    bodyText: post ? portableTextToEditorText(post.body) : '',
    focusKeyword: '',
  }
}

const isDirty = (a: FormState, b: FormState) => (Object.keys(a) as Array<keyof FormState>).some((k) => k !== 'focusKeyword' && a[k] !== b[k])

type Props = {
  post: Post | null
  posts: Post[]
  categories: Category[]
  notify: Notify
  onSaved: (id: string) => void
  onDeleted: () => void
  onDirtyChange: (dirty: boolean) => void
  onCategoryCreated: (category: Category) => void
  onUnauthorized: () => void
}

export default function PostEditor({ post, posts, categories, notify, onSaved, onDeleted, onDirtyChange, onCategoryCreated, onUnauthorized }: Props) {
  const initial = useMemo(() => formFromPost(post), [post])
  const [form, setForm] = useState<FormState>(initial)
  const [busy, setBusy] = useState(false)
  const [restorable, setRestorable] = useState<FormState | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [coverBroken, setCoverBroken] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverDragActive, setCoverDragActive] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const slugTouched = useRef(Boolean(post))
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const draftKey = `controluce:draft:${post?.id ?? 'new'}`

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value })), [])
  const dirty = isDirty(form, initial)

  // ---- Bozza locale: protegge dal lavoro perso se la sessione scade o la scheda si chiude ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const stored = { ...formFromPost(null), ...JSON.parse(raw) } as FormState
      if (isDirty(stored, initial)) setRestorable(stored)
      else localStorage.removeItem(draftKey)
    } catch { /* storage non disponibile: si prosegue senza */ }
  }, [draftKey, initial])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (dirty) localStorage.setItem(draftKey, JSON.stringify(form))
        else localStorage.removeItem(draftKey)
      } catch { /* ignora */ }
    }, 700)
    return () => window.clearTimeout(timer)
  }, [dirty, form, draftKey])

  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => { setCoverBroken(false) }, [form.coverImageUrl])

  // Lo slug segue il titolo finché non lo modifichi a mano (solo per i nuovi articoli).
  function onTitleChange(value: string) {
    setForm((prev) => ({ ...prev, title: value, slug: slugTouched.current ? prev.slug : slugify(value) }))
  }

  // ---- Caricamento copertina dal dispositivo ----
  async function uploadCover(file: File) {
    if (file.size <= 0) return notify('error', 'Il file selezionato è vuoto.')
    if (file.size > MAX_COVER_UPLOAD_BYTES) return notify('error', 'La copertina non può superare 4 MB.')
    if (file.type && !COVER_MIME_TYPES.includes(file.type)) {
      return notify('error', 'Formato non supportato. Usa un’immagine JPG, PNG o WebP.')
    }

    setUploadingCover(true)
    try {
      const upload = new FormData()
      upload.append('file', file)
      const response = await fetch('/api/admin/covers', { method: 'POST', body: upload })
      const data = await response.json().catch(() => null) as { url?: unknown; error?: string } | null

      if (response.status === 401) {
        notify('error', 'Sessione scaduta: accedi di nuovo.')
        onUnauthorized()
        return
      }
      if (!response.ok || !data || typeof data.url !== 'string' || !isValidCoverImageUrl(data.url)) {
        notify('error', data?.error || 'Impossibile caricare la copertina.')
        return
      }

      set('coverImageUrl', data.url)
      notify('success', 'Copertina caricata. Salva l’articolo per applicarla.')
    } catch {
      notify('error', 'Caricamento non riuscito. Controlla la connessione e riprova.')
    } finally {
      setUploadingCover(false)
    }
  }

  // ---- Analisi SEO in tempo reale ----
  const deferred = useDeferredValue(form)
  const others = useMemo(
    () => posts.filter((p) => p.id !== post?.id).map((p) => ({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, seoTitle: p.seo_title, seoDescription: p.seo_description })),
    [posts, post],
  )
  const analysis = useMemo(() => {
    const date = deferred.publishedAtLocal ? new Date(deferred.publishedAtLocal) : null
    const draft: PostDraft = {
      id: post?.id ?? null,
      title: deferred.title, slug: deferred.slug, excerpt: deferred.excerpt,
      coverImageUrl: deferred.coverImageUrl, coverImageAlt: deferred.coverImageAlt,
      categoryId: deferred.categoryId,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : '',
      published: true,
      seoTitle: deferred.seoTitle, seoDescription: deferred.seoDescription,
      bodyText: deferred.bodyText, focusKeyword: deferred.focusKeyword,
    }
    return analyzePost(draft, { others, originalSlug: post?.slug ?? null, wasPublished: post ? postStatus(post) === 'published' : false })
  }, [deferred, others, post])
  const counts = countBySeverity(analysis.issues)

  function jump(issue: SeoIssue) {
    const el = document.getElementById(`post-${issue.field}`)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    ;(el as HTMLElement).focus({ preventScroll: true })
  }

  // ---- Barra strumenti del testo ----
  function format(kind: 'h2' | 'quote' | 'image') {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const selected = form.bodyText.slice(start, end)
    const templates = {
      h2: { text: `\n\n## ${selected || 'Titolo della sezione'}\n\n`, from: 5, len: (selected || 'Titolo della sezione').length },
      quote: { text: `\n\n> ${selected || 'Una frase da mettere in evidenza'}\n\n`, from: 4, len: (selected || 'Una frase da mettere in evidenza').length },
      image: { text: `\n\n![${selected || 'descrizione dell’immagine'}](https://)\n\n`, from: 4, len: (selected || 'descrizione dell’immagine').length },
    }[kind]
    set('bodyText', form.bodyText.slice(0, start) + templates.text + form.bodyText.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + templates.from, start + templates.from + templates.len)
    })
  }

  // ---- Categoria inline ----
  async function createCategory() {
    const title = newCategory.trim()
    if (!title) return
    const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, slug: slugify(title, 100) }) }).catch(() => null)
    if (!res) return notify('error', 'Impossibile creare la categoria. Controlla la connessione.')
    if (res.status === 401) return onUnauthorized()
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return notify('error', data.error || 'Impossibile creare la categoria.')
    onCategoryCreated(data as Category)
    set('categoryId', (data as Category).id)
    setNewCategory('')
    notify('success', `Categoria «${title}» creata.`)
  }

  // ---- Salvataggio ----
  function focusField(field: string) { document.getElementById(`post-${field}`)?.focus() }

  async function save(publish: boolean) {
    const date = new Date(form.publishedAtLocal)
    const problems: Array<[string, string]> = []
    if (!form.title.trim()) problems.push(['title', 'Scrivi il titolo.'])
    else if (!form.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) problems.push(['slug', 'Lo slug può contenere solo lettere minuscole, numeri e trattini.'])
    else if (!form.excerpt.trim()) problems.push(['excerpt', 'Scrivi un breve riassunto dell’articolo.'])
    else if (Number.isNaN(date.getTime())) problems.push(['publishedAt', 'Imposta una data di pubblicazione valida.'])
    if (problems.length) { notify('error', problems[0][1]); focusField(problems[0][0]); return }

    if (publish) {
      const blocking = analysis.issues.filter((i) => i.severity === 'error')
      if (blocking.length > 0) {
        const list = blocking.slice(0, 4).map((i) => `• ${i.message}`).join('\n')
        if (!confirm(`Ci sono ${blocking.length} problemi SEO da correggere:\n\n${list}${blocking.length > 4 ? '\n…' : ''}\n\nVuoi pubblicare lo stesso?`)) return
      }
    } else if (post && postStatus(post) !== 'draft' && !confirm('L’articolo non sarà più visibile ai lettori né a Google. Riportarlo in bozza?')) return

    setBusy(true)
    const payload = {
      title: form.title.trim(), slug: form.slug.trim(), excerpt: form.excerpt.trim(),
      coverImageUrl: form.coverImageUrl.trim(), coverImageAlt: form.coverImageAlt.trim(),
      categoryId: form.categoryId || null, publishedAt: date.toISOString(), published: publish,
      seoTitle: form.seoTitle.trim(), seoDescription: form.seoDescription.trim(), bodyText: form.bodyText,
    }
    try {
      const res = await fetch(post ? `/api/admin/posts/${post.id}` : '/api/admin/posts', { method: post ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) { notify('error', 'Sessione scaduta: accedi di nuovo. Il testo è stato conservato su questo dispositivo.'); onUnauthorized(); return }
      if (!res.ok) { notify('error', data.error || 'Errore nel salvataggio.'); if (res.status === 409) focusField('slug'); return }
      try { localStorage.removeItem(draftKey) } catch { /* ignora */ }
      const scheduled = publish && date.getTime() > Date.now()
      notify('success', !publish ? 'Bozza salvata.' : scheduled ? 'Articolo programmato.' : post && post.published ? 'Articolo aggiornato.' : 'Articolo pubblicato.')
      onSaved(post?.id ?? (data.id as string))
    } catch {
      notify('error', 'Impossibile salvare: controlla la connessione. Il testo resta nell’editor.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!post || !confirm(`Eliminare definitivamente «${post.title}»? L’operazione non si può annullare.${post.published ? '\n\nAttenzione: l’indirizzo pubblico smetterà di funzionare (errore 404).' : ''}`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' })
      if (res.status === 401) return onUnauthorized()
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return notify('error', data.error || 'Impossibile eliminare l’articolo.')
      try { localStorage.removeItem(draftKey) } catch { /* ignora */ }
      notify('success', 'Articolo eliminato.')
      onDeleted()
    } catch {
      notify('error', 'Errore durante l’eliminazione.')
    } finally {
      setBusy(false)
    }
  }

  const status = post ? postStatus(post) : null
  const live = status === 'published' || status === 'scheduled'
  const futureDate = form.publishedAtLocal ? new Date(form.publishedAtLocal).getTime() > Date.now() : false
  const serpTitle = (form.seoTitle.trim() || form.title.trim()) + (form.seoTitle.trim() || form.title.trim() ? TITLE_SUFFIX : '')
  const serpDescription = form.seoDescription.trim() || form.excerpt.trim()
  const coverValid = isValidCoverImageUrl(form.coverImageUrl)

  return (
    <div onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!busy && !uploadingCover) void save(live) } }}>
      {restorable && (
        <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>Ho trovato modifiche non salvate di una sessione precedente.</span>
          <span className="flex gap-2">
            <button type="button" className={secondaryButton} onClick={() => { setForm(restorable); slugTouched.current = true; setRestorable(null) }}>Ripristina</button>
            <button type="button" className={secondaryButton} onClick={() => { try { localStorage.removeItem(draftKey) } catch { /* ignora */ } setRestorable(null) }}>Scarta</button>
          </span>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl">{post ? 'Modifica articolo' : 'Nuovo articolo'}</h2>
        {status && <span className="border border-line bg-bg-soft px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">{STATUS_LABEL[status]}</span>}
        {dirty && <span className="font-mono text-[11px] text-amber-700">● Modifiche non salvate</span>}
        {post && status === 'published' && <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="ml-auto font-mono text-xs uppercase tracking-widest text-wine hover:underline">Apri articolo ↗</a>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card title="Contenuto">
            <div className="grid gap-5">
              <Field id="post-title" label="Titolo" counter={<Counter value={form.title.length} max={180} />}>
                <input id="post-title" value={form.title} onChange={(e) => onTitleChange(e.target.value)} maxLength={180} className={inputClass} placeholder="Un titolo che promette qualcosa di preciso" />
              </Field>
              <Field id="post-slug" label="Indirizzo (slug)" hint={post && live ? 'Articolo già pubblico: cambiare lo slug rompe i link esistenti.' : `Indirizzo finale: /blog/${form.slug || 'slug-articolo'}`}>
                <input id="post-slug" value={form.slug} onChange={(e) => { slugTouched.current = true; set('slug', e.target.value.toLowerCase()) }} maxLength={120} className={`${inputClass} font-mono`} placeholder="titolo-dell-articolo" />
              </Field>
              <Field id="post-excerpt" label="Riassunto" hint="Compare nelle card del sito e, se manca la descrizione SEO, anche su Google." counter={<Counter value={form.excerpt.length} max={220} />}>
                <textarea id="post-excerpt" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} maxLength={220} className={`${inputClass} min-h-24`} />
              </Field>
              <Field id="post-bodyText" label="Testo dell’articolo" counter={<span className="font-mono text-[11px] text-ink-soft">{analysis.stats.words} parole · ~{analysis.stats.readingMinutes} min</span>}>
                <div className="flex flex-wrap gap-2 border border-b-0 border-line bg-bg-soft px-2 py-1.5">
                  <button type="button" onClick={() => format('h2')} className="px-2 py-1 font-mono text-xs hover:bg-white" title="Sottotitolo (H2)">H2 Sottotitolo</button>
                  <button type="button" onClick={() => format('quote')} className="px-2 py-1 font-mono text-xs hover:bg-white" title="Citazione">❝ Citazione</button>
                  <button type="button" onClick={() => format('image')} className="px-2 py-1 font-mono text-xs hover:bg-white" title="Immagine nel testo">▣ Immagine</button>
                </div>
                <textarea id="post-bodyText" ref={bodyRef} value={form.bodyText} onChange={(e) => set('bodyText', e.target.value)} maxLength={150000} className={`${inputClass} min-h-[420px] font-mono leading-relaxed`} placeholder="Scrivi qui. Una riga vuota separa i paragrafi." />
              </Field>
            </div>
          </Card>

          <Card title="Immagine di copertina" description="Appare in testa all’articolo, nelle card e nelle anteprime social.">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid content-start gap-5">
                <Field id="post-coverImageUpload" label="Carica dal computer" hint="JPG, PNG o WebP · massimo 4 MB. Il file viene salvato nel blog e usato anche nelle anteprime social.">
                  <div
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setCoverDragActive(true) }}
                    onDragLeave={(event) => {
                      const nextTarget = event.relatedTarget as Node | null
                      if (!nextTarget || !event.currentTarget.contains(nextTarget)) setCoverDragActive(false)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      setCoverDragActive(false)
                      const files = Array.from(event.dataTransfer.files)
                      if (files.length !== 1) {
                        notify('error', 'Trascina un solo file alla volta.')
                        return
                      }
                      void uploadCover(files[0])
                    }}
                    className={coverDragActive
                      ? 'border border-dashed border-wine bg-bg-soft px-4 py-5 text-center ring-2 ring-wine/20'
                      : 'border border-dashed border-line bg-bg-soft px-4 py-5 text-center transition-colors hover:border-wine/60'}
                  >
                    <p className="text-sm font-medium text-ink">{coverDragActive ? 'Rilascia qui la copertina' : 'Trascina qui il file della copertina'}</p>
                    <p className="mt-1 text-xs text-ink-soft">Oppure selezionalo dal tuo dispositivo.</p>
                    <button
                      type="button"
                      disabled={busy || uploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      className={secondaryButton + ' mt-3'}
                    >
                      {uploadingCover ? 'Caricamento…' : 'Sfoglia file'}
                    </button>
                    <input
                      ref={coverInputRef}
                      id="post-coverImageUpload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={busy || uploadingCover}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0]
                        event.currentTarget.value = ''
                        if (file) void uploadCover(file)
                      }}
                    />
                  </div>
                  {uploadingCover && <p role="status" className="mt-2 text-xs text-ink-soft">Caricamento della copertina in corso…</p>}
                </Field>
                <Field id="post-coverImageUrl" label="Oppure inserisci un URL HTTPS" hint="Facoltativo: puoi continuare a usare un’immagine già ospitata online.">
                  <input id="post-coverImageUrl" type="text" value={form.coverImageUrl} onChange={(e) => set('coverImageUrl', e.target.value)} className={inputClass} placeholder="https://…" />
                </Field>
                <Field id="post-coverImageAlt" label="Testo alternativo" hint="Descrivi cosa si vede: serve ai non vedenti e a Google Immagini." counter={<Counter value={form.coverImageAlt.length} max={300} />}>
                  <input id="post-coverImageAlt" value={form.coverImageAlt} onChange={(e) => set('coverImageAlt', e.target.value)} maxLength={300} className={inputClass} />
                </Field>
              </div>
              <div className="flex aspect-video items-center justify-center overflow-hidden border border-dashed border-line bg-bg-soft text-xs text-ink-soft">
                {coverValid && !coverBroken ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverImageUrl.trim()} alt={form.coverImageAlt || 'Anteprima copertina'} onError={() => setCoverBroken(true)} className="h-full w-full object-cover" />
                ) : coverBroken ? 'Impossibile caricare l’immagine: controlla l’URL.' : 'Anteprima della copertina'}
              </div>
            </div>
          </Card>

          <Card title="SEO e anteprima Google" description="Opzionale: se lasci vuoti i campi SEO, il sito usa titolo e riassunto.">
            <div className="grid gap-5">
              <Field id="post-focusKeyword" label="Parola chiave principale" hint="La ricerca con cui vuoi essere trovata. Serve solo per i controlli, non viene salvata.">
                <input id="post-focusKeyword" value={form.focusKeyword} onChange={(e) => set('focusKeyword', e.target.value)} className={inputClass} placeholder="es. rituali del mattino" />
              </Field>
              <Field id="post-seoTitle" label="Titolo SEO" hint={`Il sito aggiunge in automatico «${TITLE_SUFFIX.trim()}».`} counter={<Counter value={analysis.stats.titleLength} ideal={[LIMITS.titleMin, LIMITS.titleMax]} />}>
                <input id="post-seoTitle" value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} maxLength={180} className={inputClass} placeholder={form.title || 'Se vuoto usa il titolo dell’articolo'} />
              </Field>
              <Field id="post-seoDescription" label="Descrizione SEO" counter={<Counter value={serpDescription.length} ideal={[LIMITS.descriptionMin, LIMITS.descriptionMax]} />}>
                <textarea id="post-seoDescription" value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} maxLength={320} className={`${inputClass} min-h-20`} placeholder={form.excerpt || 'Se vuota usa il riassunto'} />
              </Field>
              <SerpPreview title={serpTitle} description={serpDescription} slug={form.slug} />
            </div>
          </Card>

          <Card title="Pubblicazione">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid content-start gap-3">
                <Field id="post-categoryId" label="Categoria">
                  <select id="post-categoryId" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputClass}>
                    <option value="">Nessuna</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </Field>
                <div className="flex gap-2">
                  <input aria-label="Nome nuova categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void createCategory() } }} maxLength={100} className={inputClass} placeholder="Crea nuova categoria" />
                  <button type="button" onClick={() => void createCategory()} disabled={!newCategory.trim()} className={secondaryButton}>Crea</button>
                </div>
              </div>
              <Field id="post-publishedAt" label="Data e ora di pubblicazione" hint={futureDate ? 'Data futura: l’articolo sarà programmato.' : 'Ora locale del tuo dispositivo.'}>
                <input id="post-publishedAt" type="datetime-local" value={form.publishedAtLocal} onChange={(e) => set('publishedAtLocal', e.target.value)} className={inputClass} />
              </Field>
            </div>
          </Card>

          <div className="sticky bottom-0 z-20 -mx-2 flex flex-wrap items-center gap-3 border border-line bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(33,26,21,0.06)] backdrop-blur">
            {live ? (
              <>
                <button type="button" disabled={busy || uploadingCover} onClick={() => void save(true)} className={primaryButton}>{busy ? 'Salvataggio…' : 'Aggiorna'}</button>
                <button type="button" disabled={busy || uploadingCover} onClick={() => void save(false)} className={secondaryButton}>Torna in bozza</button>
              </>
            ) : (
              <>
                <button type="button" disabled={busy || uploadingCover} onClick={() => void save(true)} className={primaryButton}>{busy ? 'Salvataggio…' : futureDate ? 'Programma' : 'Pubblica'}</button>
                <button type="button" disabled={busy || uploadingCover} onClick={() => void save(false)} className={secondaryButton}>Salva bozza</button>
              </>
            )}
            {post && <button type="button" disabled={busy || uploadingCover} onClick={() => void remove()} className="ml-auto px-3 py-2 font-mono text-xs uppercase tracking-widest text-red-800 hover:underline disabled:opacity-50">Elimina</button>}
            <span className="hidden font-mono text-[11px] text-ink-soft md:inline">Ctrl/⌘ + S per salvare</span>
          </div>
        </div>

        <aside className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto" aria-label="Analisi SEO">
          <div className="border border-line bg-white p-5">
            <div className="mb-4 flex items-center gap-4">
              <ScoreRing score={analysis.score} />
              <div>
                <p className="font-display text-xl">Punteggio SEO</p>
                <p className="text-sm text-ink-soft">{scoreLabel(analysis.score)}</p>
                <p className="mt-1 flex gap-2 text-xs"><span className="text-red-800">{counts.error} da correggere</span><span className="text-amber-800">{counts.warning} da migliorare</span></p>
              </div>
            </div>
            <p className="mb-4 text-xs text-ink-soft">Il punteggio si aggiorna mentre scrivi. Clicca un problema per andare al campo da modificare.</p>
            <IssueGroups issues={analysis.issues} onJump={jump} />
          </div>
        </aside>
      </div>
    </div>
  )
}


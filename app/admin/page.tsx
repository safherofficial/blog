'use client'

import { useEffect, useState } from 'react'
import { portableTextToEditorText } from '@/lib/content/editor'

type Category = { id: string; title: string; slug: string }
type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url?: string | null
  cover_image_alt?: string | null
  category_id?: string | null
  category_title?: string | null
  published_at?: string
  published: boolean
  body?: any[]
  seo_title?: string | null
  seo_description?: string | null
}

const input = 'w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-wine'

function toLocalDateTimeInput(value?: string): string {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'posts' | 'settings'>('posts')
  const [settings, setSettings] = useState<any>({})
  const [busy, setBusy] = useState(false)

  async function load() {
    const [p, c, s] = await Promise.all([
      fetch('/api/admin/posts', { cache: 'no-store' }),
      fetch('/api/admin/categories', { cache: 'no-store' }),
      fetch('/api/admin/settings', { cache: 'no-store' }),
    ])
    if (p.status === 401 || c.status === 401 || s.status === 401) {
      setAuthed(false)
      return
    }
    if (!p.ok || !c.ok || !s.ok) throw new Error('Impossibile caricare i dati. Verifica il database e riprova.')
    const [postData, categoryData, settingsData] = await Promise.all([p.json(), c.json(), s.json()])
    setPosts(Array.isArray(postData) ? postData : [])
    setCategories(Array.isArray(categoryData) ? categoryData : [])
    setSettings(settingsData || {})
    setAuthed(true)
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Errore durante il caricamento.'))
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(result.error || 'Accesso non riuscito.')
        return
      }
      setPassword('')
      await load()
      setMessage('Accesso effettuato.')
    } catch {
      setMessage('Impossibile raggiungere il server. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setAuthed(false)
      setSelected(null)
      setPosts([])
      setCategories([])
      setMessage('Sessione terminata.')
    } finally {
      setBusy(false)
    }
  }

  async function savePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form.entries()) as Record<string, any>
    data.published = form.get('published') === 'on'
    data.categoryId = data.categoryId || null
    // Interpret datetime-local in the browser's local timezone, then send UTC.
    if (typeof data.publishedAt === 'string' && data.publishedAt) {
      const date = new Date(data.publishedAt)
      if (Number.isNaN(date.getTime())) {
        setMessage('Data di pubblicazione non valida.')
        setBusy(false)
        return
      }
      data.publishedAt = date.toISOString()
    }

    const method = selected ? 'PUT' : 'POST'
    const url = selected ? `/api/admin/posts/${selected.id}` : '/api/admin/posts'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json().catch(() => ({}))
      setMessage(res.ok ? (data.published ? 'Articolo salvato e pubblicato.' : 'Bozza salvata.') : result.error || 'Errore nel salvataggio.')
      if (res.ok) {
        await load()
        setSelected(null)
      }
    } catch {
      setMessage('Impossibile salvare l’articolo. Verifica la connessione e riprova.')
    } finally {
      setBusy(false)
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Eliminare definitivamente questo articolo?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(result.error || 'Impossibile eliminare l’articolo.')
        return
      }
      setMessage('Articolo eliminato.')
      setSelected(null)
      await load()
    } catch {
      setMessage('Errore durante l’eliminazione.')
    } finally {
      setBusy(false)
    }
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form.entries())
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json().catch(() => ({}))
      setMessage(res.ok ? 'Impostazioni salvate.' : result.error || 'Errore nel salvataggio.')
      if (res.ok) await load()
    } catch {
      setMessage('Impossibile salvare le impostazioni.')
    } finally {
      setBusy(false)
    }
  }

  if (!authed) return (
    <main className="min-h-screen bg-bg py-20">
      <div className="mx-auto max-w-md px-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Controluce</p>
        <h1 className="mb-8 font-display text-4xl">Pannello editoriale</h1>
        <form onSubmit={login} className="border border-line bg-white p-6">
          <label className="mb-2 block text-sm" htmlFor="admin-password">Password amministratore</label>
          <input
            id="admin-password"
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            autoFocus
          />
          <button disabled={busy} className="mt-4 border border-wine bg-wine px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white disabled:opacity-50">
            {busy ? 'Accesso...' : 'Accedi'}
          </button>
          {message && <p role="status" className="mt-3 text-sm text-wine">{message}</p>}
        </form>
        <p className="mt-4 text-xs text-ink-soft">Le sessioni amministrative scadono automaticamente dopo otto ore.</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-bg py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine">Controluce</p>
            <h1 className="font-display text-4xl">Pannello editoriale</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-wine">← Sito</a>
            <button type="button" onClick={logout} disabled={busy} className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-wine disabled:opacity-50">Esci</button>
          </div>
        </div>

        <div className="mb-8 flex gap-4 border-b border-line">
          <button onClick={() => setTab('posts')} className={`pb-3 font-mono text-xs uppercase tracking-widest ${tab === 'posts' ? 'border-b-2 border-wine text-wine' : 'text-ink-soft'}`}>Articoli</button>
          <button onClick={() => setTab('settings')} className={`pb-3 font-mono text-xs uppercase tracking-widest ${tab === 'settings' ? 'border-b-2 border-wine text-wine' : 'text-ink-soft'}`}>Impostazioni</button>
        </div>
        {message && <p role="status" className="mb-5 text-sm text-wine">{message}</p>}

        {tab === 'posts' ? (
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="border border-line bg-white p-4">
              <button onClick={() => setSelected(null)} className="mb-4 w-full border border-wine bg-wine px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-white">+ Nuovo articolo</button>
              <div className="space-y-2">
                {posts.map((post) => (
                  <button key={post.id} onClick={() => setSelected(post)} className="block w-full border-b border-line p-3 text-left hover:bg-bg-soft">
                    <span className="block font-display text-lg">{post.title}</span>
                    <span className="text-xs text-ink-soft">{post.category_title || 'Blog'} · {post.published ? 'Pubblicato' : 'Bozza'}</span>
                  </button>
                ))}
                {posts.length === 0 && <p className="p-3 text-sm text-ink-soft">Non ci sono ancora articoli.</p>}
              </div>
            </aside>

            <section className="border border-line bg-white p-6">
              <h2 className="mb-6 font-display text-3xl">{selected ? 'Modifica articolo' : 'Nuovo articolo'}</h2>
              <form key={selected?.id || 'new'} onSubmit={savePost} className="grid gap-5">
                <div><label className="mb-1 block text-sm" htmlFor="post-title">Titolo</label><input id="post-title" name="title" required maxLength={180} defaultValue={selected?.title || ''} className={input} /></div>
                <div><label className="mb-1 block text-sm" htmlFor="post-slug">Slug</label><input id="post-slug" name="slug" required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Usa lettere minuscole, numeri e trattini." defaultValue={selected?.slug || ''} className={input} placeholder="titolo-dell-articolo" /></div>
                <div><label className="mb-1 block text-sm" htmlFor="post-excerpt">Anteprima (max 220 caratteri)</label><textarea id="post-excerpt" name="excerpt" required maxLength={220} defaultValue={selected?.excerpt || ''} className={`${input} min-h-24`} /></div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div><label className="mb-1 block text-sm" htmlFor="post-cover">URL immagine copertina (HTTPS)</label><input id="post-cover" name="coverImageUrl" type="url" pattern="https://.*" defaultValue={selected?.cover_image_url || ''} className={input} placeholder="https://..." /></div>
                  <div><label className="mb-1 block text-sm" htmlFor="post-alt">Testo alternativo immagine</label><input id="post-alt" name="coverImageAlt" maxLength={300} defaultValue={selected?.cover_image_alt || ''} className={input} /></div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div><label className="mb-1 block text-sm" htmlFor="post-category">Categoria</label><select id="post-category" name="categoryId" defaultValue={selected?.category_id || ''} className={input}><option value="">Nessuna</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
                  <div><label className="mb-1 block text-sm" htmlFor="post-published-at">Data e ora di pubblicazione (ora locale)</label><input id="post-published-at" name="publishedAt" type="datetime-local" required defaultValue={toLocalDateTimeInput(selected?.published_at)} className={input} /></div>
                </div>
                <div><label className="mb-1 block text-sm" htmlFor="post-seo-title">Titolo SEO</label><input id="post-seo-title" name="seoTitle" maxLength={180} defaultValue={selected?.seo_title || ''} className={input} /></div>
                <div><label className="mb-1 block text-sm" htmlFor="post-seo-description">Descrizione SEO</label><textarea id="post-seo-description" name="seoDescription" maxLength={320} defaultValue={selected?.seo_description || ''} className={`${input} min-h-20`} /></div>
                <div><label className="mb-1 block text-sm" htmlFor="post-body">Testo articolo</label><p className="mb-2 text-xs text-ink-soft">Paragrafi separati da una riga vuota. Usa <code>## Titolo</code> per H2, <code>&gt; Citazione</code> per citazioni e <code>![alt](https://...)</code> per immagini.</p><textarea id="post-body" name="bodyText" maxLength={150000} defaultValue={selected ? portableTextToEditorText(selected.body) : ''} className={`${input} min-h-[360px] font-mono text-sm`} /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={selected?.published === true} /> Pubblica articolo (altrimenti salva come bozza)</label>
                <div className="flex flex-wrap gap-3">
                  <button disabled={busy} className="border border-wine bg-wine px-6 py-3 font-mono text-xs uppercase tracking-widest text-white disabled:opacity-50">{busy ? 'Salvataggio...' : 'Salva articolo'}</button>
                  {selected && <button type="button" disabled={busy} onClick={() => deletePost(selected.id)} className="border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest text-wine disabled:opacity-50">Elimina</button>}
                </div>
              </form>
            </section>
          </div>
        ) : (
          <section className="max-w-3xl border border-line bg-white p-6">
            <h2 className="mb-6 font-display text-3xl">Impostazioni del sito</h2>
            <form onSubmit={saveSettings} className="grid gap-5">
              <div><label className="mb-1 block text-sm" htmlFor="site-title">Nome blog</label><input id="site-title" name="siteTitle" defaultValue={settings.site_title || 'Controluce'} className={input} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="site-tagline">Tagline</label><input id="site-tagline" name="tagline" defaultValue={settings.tagline || ''} className={input} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="author-name">Nome autore/autrice</label><input id="author-name" name="authorName" defaultValue={settings.author_name || ''} className={input} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="author-bio">Biografia</label><textarea id="author-bio" name="authorBioText" defaultValue={portableTextToEditorText(settings.author_bio)} className={`${input} min-h-48`} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="author-photo-url">URL foto profilo (HTTPS)</label><input id="author-photo-url" name="authorPhotoUrl" type="url" pattern="https://.*" defaultValue={settings.author_photo_url || ''} className={input} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="author-photo-alt">Alt foto profilo</label><input id="author-photo-alt" name="authorPhotoAlt" defaultValue={settings.author_photo_alt || ''} className={input} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="instagram-url">Instagram URL</label><input id="instagram-url" name="instagramUrl" type="url" pattern="https://.*" defaultValue={settings.instagram_url || ''} className={input} /></div>
              <div><label className="mb-1 block text-sm" htmlFor="signature-quote">Citazione in evidenza</label><textarea id="signature-quote" name="signatureQuote" defaultValue={settings.signature_quote || ''} className={`${input} min-h-24`} /></div>
              <button disabled={busy} className="w-fit border border-wine bg-wine px-6 py-3 font-mono text-xs uppercase tracking-widest text-white disabled:opacity-50">Salva impostazioni</button>
            </form>
          </section>
        )}
      </div>
    </main>
  )
}

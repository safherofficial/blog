'use client'

import { useEffect, useState } from 'react'
import { portableTextToEditorText } from '@/lib/content/editor'

type Category = { id: string; title: string; slug: string }
type Post = any

const input = 'w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-wine'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'posts' | 'settings'>('posts')
  const [settings, setSettings] = useState<any>({})

  async function load() {
    const [p, c, s] = await Promise.all([
      fetch('/api/admin/posts'), fetch('/api/admin/categories'), fetch('/api/admin/settings'),
    ])
    if (p.status === 401) { setAuthed(false); return }
    setPosts(await p.json()); setCategories(await c.json()); setSettings(await s.json() || {})
    setAuthed(true)
  }

  useEffect(() => { load().catch(() => setAuthed(false)) }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMessage('')
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (!res.ok) { setMessage('Password non valida.'); return }
    setPassword(''); await load()
  }

  async function savePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form.entries()) as any
    data.published = form.get('published') === 'on'
    data.categoryId = data.categoryId || null
    const method = selected ? 'PUT' : 'POST'
    const url = selected ? `/api/admin/posts/${selected.id}` : '/api/admin/posts'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await res.json()
    setMessage(res.ok ? 'Articolo salvato.' : result.error || 'Errore.')
    if (res.ok) { await load(); setSelected(null) }
  }

  async function deletePost(id: string) {
    if (!confirm('Eliminare definitivamente questo articolo?')) return
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    if (res.ok) { setSelected(null); await load() }
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form.entries())
    const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setMessage(res.ok ? 'Impostazioni salvate.' : 'Errore nel salvataggio.')
    if (res.ok) await load()
  }

  if (!authed) return (
    <main className="min-h-screen bg-bg py-20"><div className="mx-auto max-w-md px-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Controluce</p>
      <h1 className="mb-8 font-display text-4xl">Pannello editoriale</h1>
      <form onSubmit={login} className="border border-line bg-white p-6">
        <label className="mb-2 block text-sm">Password amministratore</label>
        <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        <button className="mt-4 border border-wine bg-wine px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white">Accedi</button>
        {message && <p className="mt-3 text-sm text-wine">{message}</p>}
      </form>
    </div></main>
  )

  return <main className="min-h-screen bg-bg py-10"><div className="mx-auto max-w-7xl px-6">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
      <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-wine">Controluce</p><h1 className="font-display text-4xl">Pannello editoriale</h1></div>
      <a href="/" className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-wine">← Sito</a>
    </div>
    <div className="mb-8 flex gap-4 border-b border-line">
      <button onClick={() => setTab('posts')} className={`pb-3 font-mono text-xs uppercase tracking-widest ${tab === 'posts' ? 'border-b-2 border-wine text-wine' : 'text-ink-soft'}`}>Articoli</button>
      <button onClick={() => setTab('settings')} className={`pb-3 font-mono text-xs uppercase tracking-widest ${tab === 'settings' ? 'border-b-2 border-wine text-wine' : 'text-ink-soft'}`}>Impostazioni</button>
    </div>
    {message && <p className="mb-5 text-sm text-wine">{message}</p>}

    {tab === 'posts' ? <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="border border-line bg-white p-4">
        <button onClick={() => setSelected(null)} className="mb-4 w-full border border-wine bg-wine px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-white">+ Nuovo articolo</button>
        <div className="space-y-2">{posts.map((post) => <button key={post.id} onClick={() => setSelected(post)} className="block w-full border-b border-line p-3 text-left hover:bg-bg-soft"><span className="block font-display text-lg">{post.title}</span><span className="text-xs text-ink-soft">{post.category_title || 'Blog'} · {post.published ? 'Pubblicato' : 'Bozza'}</span></button>)}</div>
      </aside>
      <section className="border border-line bg-white p-6">
        <h2 className="mb-6 font-display text-3xl">{selected ? 'Modifica articolo' : 'Nuovo articolo'}</h2>
        <form key={selected?.id || 'new'} onSubmit={savePost} className="grid gap-5">
          <div><label className="mb-1 block text-sm">Titolo</label><input name="title" required defaultValue={selected?.title || ''} className={input} /></div>
          <div><label className="mb-1 block text-sm">Slug</label><input name="slug" required defaultValue={selected?.slug || ''} className={input} placeholder="titolo-dell-articolo" /></div>
          <div><label className="mb-1 block text-sm">Anteprima (max 220 caratteri)</label><textarea name="excerpt" required maxLength={220} defaultValue={selected?.excerpt || ''} className={`${input} min-h-24`} /></div>
          <div className="grid gap-5 md:grid-cols-2"><div><label className="mb-1 block text-sm">URL immagine copertina</label><input name="coverImageUrl" defaultValue={selected?.cover_image_url || ''} className={input} placeholder="https://..." /></div><div><label className="mb-1 block text-sm">Alt immagine</label><input name="coverImageAlt" defaultValue={selected?.cover_image_alt || ''} className={input} /></div></div>
          <div className="grid gap-5 md:grid-cols-2"><div><label className="mb-1 block text-sm">Categoria</label><select name="categoryId" defaultValue={selected?.category_id || ''} className={input}><option value="">Nessuna</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div><div><label className="mb-1 block text-sm">Data pubblicazione</label><input name="publishedAt" type="datetime-local" defaultValue={selected?.published_at ? new Date(selected.published_at).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)} className={input} /></div></div>
          <div><label className="mb-1 block text-sm">Titolo SEO</label><input name="seoTitle" defaultValue={selected?.seo_title || ''} className={input} /></div>
          <div><label className="mb-1 block text-sm">Descrizione SEO</label><textarea name="seoDescription" defaultValue={selected?.seo_description || ''} className={`${input} min-h-20`} /></div>
          <div><label className="mb-1 block text-sm">Testo articolo</label><p className="mb-2 text-xs text-ink-soft">Editor semplice: paragrafi separati da una riga vuota. Usa <code>## Titolo</code> per H2, <code>&gt; Citazione</code> per citazioni e <code>![alt](https://...)</code> per immagini.</p><textarea name="bodyText" defaultValue={selected ? portableTextToEditorText(selected.body) : ''} className={`${input} min-h-[360px] font-mono text-sm`} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={selected?.published !== false} /> Pubblicato</label>
          <div className="flex flex-wrap gap-3"><button className="border border-wine bg-wine px-6 py-3 font-mono text-xs uppercase tracking-widest text-white">Salva articolo</button>{selected && <button type="button" onClick={() => deletePost(selected.id)} className="border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest text-wine">Elimina</button>}</div>
        </form>
      </section>
    </div> : <section className="max-w-3xl border border-line bg-white p-6"><h2 className="mb-6 font-display text-3xl">Impostazioni del sito</h2><form onSubmit={saveSettings} className="grid gap-5">
      <div><label className="mb-1 block text-sm">Nome blog</label><input name="siteTitle" defaultValue={settings.site_title || 'Controluce'} className={input} /></div>
      <div><label className="mb-1 block text-sm">Tagline</label><input name="tagline" defaultValue={settings.tagline || ''} className={input} /></div>
      <div><label className="mb-1 block text-sm">Nome autore/autrice</label><input name="authorName" defaultValue={settings.author_name || ''} className={input} /></div>
      <div><label className="mb-1 block text-sm">Biografia</label><textarea name="authorBioText" defaultValue={portableTextToEditorText(settings.author_bio)} className={`${input} min-h-48`} /></div>
      <div><label className="mb-1 block text-sm">URL foto profilo</label><input name="authorPhotoUrl" defaultValue={settings.author_photo_url || ''} className={input} /></div>
      <div><label className="mb-1 block text-sm">Alt foto profilo</label><input name="authorPhotoAlt" defaultValue={settings.author_photo_alt || ''} className={input} /></div>
      <div><label className="mb-1 block text-sm">Instagram</label><input name="instagramUrl" defaultValue={settings.instagram_url || ''} className={input} /></div>
      <div><label className="mb-1 block text-sm">Citazione in evidenza</label><textarea name="signatureQuote" defaultValue={settings.signature_quote || ''} className={`${input} min-h-24`} /></div>
      <button className="w-fit border border-wine bg-wine px-6 py-3 font-mono text-xs uppercase tracking-widest text-white">Salva impostazioni</button>
    </form></section>}
  </div></main>
}

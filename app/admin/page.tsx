'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PostEditor from '@/components/admin/PostEditor'
import PostList from '@/components/admin/PostList'
import SeoDashboard from '@/components/admin/SeoDashboard'
import SettingsForm from '@/components/admin/SettingsForm'
import ReaderMessages from '@/components/admin/ReaderMessages'
import type { Category, Notify, Post, SiteSettingsRow } from '@/components/admin/types'
import { Toasts, inputClass, primaryButton, secondaryButton, type ToastItem } from '@/components/admin/ui'

type Tab = 'posts' | 'seo' | 'settings' | 'messages'
type Selection = { kind: 'new' } | { kind: 'edit'; id: string }

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'posts', label: 'Articoli' },
  { id: 'seo', label: 'Salute SEO' },
  { id: 'settings', label: 'Impostazioni' },
  { id: 'messages', label: 'Messaggi' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<SiteSettingsRow>({})
  const [selection, setSelection] = useState<Selection>({ kind: 'new' })
  const [tab, setTab] = useState<Tab>('posts')
  const [busy, setBusy] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [editorVersion, setEditorVersion] = useState(0)
  const dirtyRef = useRef(false)
  const toastId = useRef(0)

  const notify: Notify = useCallback((kind, text) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, kind, text }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), kind === 'error' ? 8000 : 4500)
  }, [])

  const load = useCallback(async (): Promise<boolean> => {
    const [p, c, s] = await Promise.all([
      fetch('/api/admin/posts', { cache: 'no-store' }),
      fetch('/api/admin/categories', { cache: 'no-store' }),
      fetch('/api/admin/settings', { cache: 'no-store' }),
    ])
    if (p.status === 401 || c.status === 401 || s.status === 401) { setAuthed(false); return false }
    if (!p.ok || !c.ok || !s.ok) throw new Error('Impossibile caricare i dati. Verifica il database e riprova.')
    const [postData, categoryData, settingsData] = await Promise.all([p.json(), c.json(), s.json()])
    setPosts(Array.isArray(postData) ? postData : [])
    setCategories(Array.isArray(categoryData) ? categoryData : [])
    setSettings(settingsData || {})
    setAuthed(true)
    return true
  }, [])

  useEffect(() => {
    load()
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Errore durante il caricamento.'))
      .finally(() => setChecking(false))
  }, [load, notify])

  const onUnauthorized = useCallback(() => {
    setAuthed(false)
    setLoginError('Sessione scaduta: accedi di nuovo.')
  }, [])

  const confirmDiscard = () => !dirtyRef.current || confirm('Hai modifiche non salvate. Vuoi scartarle?')

  function goTab(next: Tab) {
    if (next === tab) return
    if (tab === 'posts' && !confirmDiscard()) return
    dirtyRef.current = false
    setTab(next)
  }

  function select(post: Post | null) {
    if (!confirmDiscard()) return
    dirtyRef.current = false
    setSelection(post ? { kind: 'edit', id: post.id } : { kind: 'new' })
  }

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) { setLoginError(result.error || 'Accesso non riuscito.'); return }
      setPassword('')
      await load()
    } catch {
      setLoginError('Impossibile raggiungere il server. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    if (!confirmDiscard()) return
    setBusy(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      dirtyRef.current = false
      setAuthed(false)
      setPosts([])
      setCategories([])
      notify('info', 'Sessione terminata.')
    } finally {
      setBusy(false)
    }
  }

  async function reloadAndSelect(id: string | null) {
    try { await load() } catch { notify('error', 'Salvato, ma non riesco ad aggiornare l’elenco. Ricarica la pagina.') }
    dirtyRef.current = false
    setEditorVersion((v) => v + 1)
    setSelection(id ? { kind: 'edit', id } : { kind: 'new' })
  }

  if (checking) return <main className="flex min-h-screen items-center justify-center bg-bg"><p role="status" className="font-mono text-xs uppercase tracking-widest text-ink-soft">Caricamento…</p></main>

  if (!authed) return (
    <main className="min-h-screen bg-bg py-20">
      <div className="mx-auto max-w-md px-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-wine">Controluce</p>
        <h1 className="mb-8 font-display text-4xl">Pannello editoriale</h1>
        <form onSubmit={login} className="border border-line bg-white p-6">
          <label className="mb-2 block text-sm font-medium" htmlFor="admin-password">Password amministratore</label>
          <input id="admin-password" className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required autoFocus />
          <button disabled={busy} className={`${primaryButton} mt-4`}>{busy ? 'Accesso…' : 'Accedi'}</button>
          {loginError && <p role="alert" className="mt-3 text-sm text-red-800">{loginError}</p>}
        </form>
        <p className="mt-4 text-xs text-ink-soft">Le sessioni scadono automaticamente dopo otto ore.</p>
      </div>
      <Toasts items={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </main>
  )

  const selected = selection.kind === 'edit' ? posts.find((p) => p.id === selection.id) ?? null : null

  return (
    <main className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine">Controluce</p>
            <h1 className="font-display text-4xl">Pannello editoriale</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-wine">Vedi sito ↗</a>
            <button type="button" onClick={() => void logout()} disabled={busy} className={secondaryButton}>Esci</button>
          </div>
        </div>

        <nav className="mb-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-line" aria-label="Sezioni">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => goTab(t.id)} aria-current={tab === t.id ? 'page' : undefined} className={`-mb-px pb-3 font-mono text-xs uppercase tracking-widest ${tab === t.id ? 'border-b-2 border-wine text-wine' : 'text-ink-soft hover:text-wine'}`}>{t.label}</button>
          ))}
        </nav>

        {tab === 'posts' && (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <PostList posts={posts} selectedId={selected?.id ?? null} onSelect={select} />
            <PostEditor
              key={`${selected?.id ?? 'new'}:${editorVersion}`}
              post={selected}
              posts={posts}
              categories={categories}
              notify={notify}
              onSaved={(id) => void reloadAndSelect(id)}
              onDeleted={() => void reloadAndSelect(null)}
              onDirtyChange={(dirty) => { dirtyRef.current = dirty }}
              onCategoryCreated={(category) => setCategories((prev) => [...prev, category].sort((a, b) => a.title.localeCompare(b.title)))}
              onUnauthorized={onUnauthorized}
            />
          </div>
        )}
        {tab === 'seo' && (
          <SeoDashboard
            notify={notify}
            onUnauthorized={onUnauthorized}
            onEditPost={(id) => { setSelection({ kind: 'edit', id }); setTab('posts') }}
          />
        )}
        {tab === 'settings' && <SettingsForm settings={settings} notify={notify} onSaved={() => void load()} onUnauthorized={onUnauthorized} />}
        {tab === 'messages' && <ReaderMessages notify={notify} onUnauthorized={onUnauthorized} />}
      </div>
      <Toasts items={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </main>
  )
}

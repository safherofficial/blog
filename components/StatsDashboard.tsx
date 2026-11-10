'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Data = {
  totals: { total: number; today: number; month: number }
  daily: Array<{ label: string; views: number }>
  sources: Array<{ source: string; views: number; percentage: number }>
  hours: Array<{ hour: number; views: number }>
  pages: Array<{ path: string; views: number }>
}
const fmt = (n: number) => new Intl.NumberFormat('it-IT').format(n || 0)
const hour = (n: number) => `${String(n).padStart(2, '0')}:00`

function Bars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values)
  return <div className="flex h-48 items-end gap-1 sm:gap-2">{values.map((v, i) => <div key={i} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
    <span className="text-[9px] text-ink-soft opacity-0 group-hover:opacity-100">{fmt(v)}</span>
    <div title={`${labels[i]}: ${fmt(v)} visite`} className="w-full rounded-t-sm bg-[#9B7951] hover:bg-[#604633]" style={{ height: `${Math.max(v ? 3 : 1, v / max * 125)}px` }} />
    <span className="text-[8px] text-ink-soft sm:text-[9px]">{labels[i]}</span>
  </div>)}</div>
}

export default function StatsDashboard() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [updated, setUpdated] = useState('')
  const load = useCallback(async () => {
    const response = await fetch('/api/stats', { cache: 'no-store' })
    if (response.status === 401) { setAuthed(false); return }
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Errore nel caricamento.')
    setData(result); setAuthed(true)
    setUpdated(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }))
  }, [])
  useEffect(() => { load().catch((e) => setError(e.message || 'Errore di connessione.')).finally(() => setChecking(false)) }, [load])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const response = await fetch('/api/stats/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Accesso non riuscito.')
      setPassword(''); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Accesso non riuscito.') }
    finally { setBusy(false) }
  }
  async function logout() { await fetch('/api/stats/logout', { method: 'POST' }); setAuthed(false); setData(null) }

  const peak = useMemo(() => data?.hours.reduce((best, item) => item.views > (best?.views ?? -1) ? item : best, null as { hour: number; views: number } | null), [data])
  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => data?.hours.find((x) => x.hour === h)?.views ?? 0), [data])
  if (checking) return <main className="flex min-h-screen items-center justify-center bg-bg text-sm text-ink-soft">Caricamento…</main>
  if (!authed) return <main className="flex min-h-screen items-center justify-center bg-bg px-5 py-16"><form onSubmit={login} className="w-full max-w-md border border-line bg-white p-8 shadow-xl shadow-[#34251D]/5">
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ochre">Controluce · Area riservata</p><h1 className="mb-2 font-display text-4xl text-ink">Statistiche</h1>
    <p className="mb-7 text-sm leading-6 text-ink-soft">Accedi al pannello di controllo del traffico del sito.</p>
    <label htmlFor="stats-password" className="mb-2 block text-xs font-medium">Password di accesso</label>
    <input id="stats-password" type="password" autoComplete="current-password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-ochre" />
    <button disabled={busy} className="mt-4 w-full bg-wine px-5 py-3 font-mono text-xs uppercase tracking-widest text-white hover:bg-wine-dark disabled:opacity-60">{busy ? 'Accesso…' : 'Accedi'}</button>
    {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}<a href="/" className="mt-6 inline-block text-xs text-ink-soft hover:text-wine">← Torna al sito</a>
  </form></main>
  if (!data) return <main className="min-h-screen bg-bg p-8"><p role="alert">{error || 'Statistiche non disponibili.'}</p><button onClick={() => void load()} className="mt-4 underline">Riprova</button></main>

  const cards = [
    { label: 'Visite oggi', value: data.totals.today, note: 'Dalle 00:00, ora italiana' },
    { label: 'Visite questo mese', value: data.totals.month, note: 'Mese solare corrente' },
    { label: 'Visite totali', value: data.totals.total, note: 'Dall’attivazione del monitoraggio' },
    { label: 'Canali attivi', value: data.sources.length, note: 'Origini con almeno una visita' },
  ]
  return <main className="min-h-screen bg-[#F5EFE5] px-4 py-7 text-ink sm:px-7 lg:px-10"><div className="mx-auto max-w-7xl">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">Controluce · Area riservata</p><h1 className="font-display text-4xl sm:text-5xl">Insights del sito</h1><p className="mt-2 text-sm text-ink-soft">Una lettura chiara di pubblico, provenienza e abitudini di visita.</p></div>
      <div className="flex items-center gap-3"><span className="text-[10px] text-ink-soft">Aggiornato alle {updated}</span><button onClick={() => void load()} className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-ochre">Aggiorna</button><button onClick={() => void logout()} className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-ochre">Esci</button></div></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((c) => <article key={c.label} className="border border-line bg-white p-5 shadow-sm"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">{c.label}</p><p className="my-3 font-display text-4xl text-wine">{fmt(c.value)}</p><p className="text-xs text-ink-soft">{c.note}</p></article>)}</section>
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <article className="border border-line bg-white p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-widest text-ochre">Andamento</p><h2 className="mt-1 font-display text-2xl">Visite giornaliere</h2><p className="mb-6 mt-1 text-xs text-ink-soft">Ultimi 30 giorni · visite registrate</p><Bars values={data.daily.map((x) => x.views)} labels={data.daily.map((x) => x.label)} /></article>
      <article className="border border-line bg-white p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-widest text-ochre">Provenienza</p><h2 className="mt-1 font-display text-2xl">Da dove arrivano</h2><p className="mb-5 mt-1 text-xs text-ink-soft">Canali rilevati dal referrer o dai parametri UTM.</p>
        {data.sources.length ? <div className="space-y-4">{data.sources.map((s) => <div key={s.source}><div className="mb-1 flex justify-between gap-3 text-xs"><span>{s.source}</span><span className="font-mono text-ink-soft">{fmt(s.views)} · {s.percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#EEE5D9]"><div className="h-full rounded-full bg-[#9B7951]" style={{ width: `${Math.min(100, s.percentage)}%` }} /></div></div>)}</div> : <p className="text-sm text-ink-soft">I dati appariranno dopo le prime visite registrate.</p>}
      </article>
    </section>
    <section className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <article className="border border-line bg-white p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-widest text-ochre">Comportamento</p><h2 className="mt-1 font-display text-2xl">Fasce orarie</h2><p className="mb-6 mt-1 text-xs text-ink-soft">Distribuzione delle visite nelle 24 ore · fuso orario Roma.</p><Bars values={hours} labels={hours.map((_, i) => i % 3 === 0 ? hour(i) : '')} />
        {peak && peak.views > 0 && <p className="mt-5 border-l-2 border-ochre bg-bg px-4 py-3 text-sm">La fascia più attiva è <strong>{hour(peak.hour)} – {hour((peak.hour + 1) % 24)}</strong>, con {fmt(peak.views)} visite registrate.</p>}</article>
      <article className="border border-line bg-white p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-widest text-ochre">Contenuti</p><h2 className="mt-1 font-display text-2xl">Pagine più visitate</h2><p className="mb-5 mt-1 text-xs text-ink-soft">Le pagine che attirano più attenzione.</p>
        {data.pages.length ? <ol className="space-y-3">{data.pages.map((p, i) => <li key={p.path} className="flex items-center justify-between gap-4 border-b border-line/70 pb-3 text-sm"><span className="min-w-0 truncate"><span className="mr-3 font-mono text-[10px] text-ochre">{String(i + 1).padStart(2, '0')}</span>{p.path}</span><strong className="font-mono text-xs">{fmt(p.views)}</strong></li>)}</ol> : <p className="text-sm text-ink-soft">Nessun dato disponibile.</p>}</article>
    </section>
    <footer className="mt-7 border-t border-line pt-4 text-[11px] leading-5 text-ink-soft">Dati raccolti dal momento dell’attivazione. Il sistema registra visualizzazioni aggregate senza salvare indirizzi IP, identificatori persistenti o URL completi di provenienza. Ad blocker e protezioni anti-tracciamento possono ridurre la rilevazione. Per attribuire correttamente i clic social, usa link con parametri UTM.</footer>
  </div></main>
}

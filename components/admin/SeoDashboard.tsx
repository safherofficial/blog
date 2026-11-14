'use client'

import { useCallback, useEffect, useState } from 'react'
import type { LiveCheck } from '@/lib/seo/live-check'
import type { PostAudit, SiteAudit } from '@/lib/seo/site-audit'
import { scoreLabel } from '@/lib/seo/types'
import type { Notify } from './types'
import { Card, IssueGroups, IssueRow, ScoreBadge, ScoreRing, primaryButton, secondaryButton } from './ui'

const STATUS_LABEL = { published: 'Pubblicato', scheduled: 'Programmato', draft: 'Bozza' } as const

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="border border-line bg-bg px-4 py-3">
      <p className={`font-display text-3xl ${tone || ''}`}>{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">{label}</p>
    </div>
  )
}

export default function SeoDashboard({ onEditPost, notify, onUnauthorized }: { onEditPost: (id: string) => void; notify: Notify; onUnauthorized: () => void }) {
  const [audit, setAudit] = useState<SiteAudit | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState<LiveCheck | null>(null)
  const [scanning, setScanning] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/seo/audit', { cache: 'no-store' })
      if (res.status === 401) return onUnauthorized()
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Analisi non riuscita.')
      setAudit(data as SiteAudit)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analisi non riuscita.')
    } finally {
      setLoading(false)
    }
  }, [onUnauthorized])

  useEffect(() => { void load() }, [load])

  async function scan() {
    setScanning(true)
    try {
      const res = await fetch('/api/admin/seo/live', { method: 'POST' })
      if (res.status === 401) return onUnauthorized()
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return notify('error', data.error || 'Scansione non riuscita.')
      setLive(data as LiveCheck)
      notify('success', 'Scansione completata.')
    } catch {
      notify('error', 'Scansione interrotta: riprova tra poco.')
    } finally {
      setScanning(false)
    }
  }

  if (loading && !audit) return <p className="border border-line bg-white p-6 text-sm text-ink-soft" role="status">Analisi del sito in corso…</p>
  if (error && !audit) return (
    <div className="border border-red-300 bg-red-50 p-6 text-sm text-red-900" role="alert">
      <p className="mb-3">{error}</p>
      <button type="button" onClick={() => void load()} className={secondaryButton}>Riprova</button>
    </div>
  )
  if (!audit) return null

  const problemPosts = audit.posts.filter((p) => p.status !== 'draft' && (p.errors > 0 || p.warnings > 0))
  const listed: PostAudit[] = showAll ? problemPosts : problemPosts.slice(0, 8)
  const siteProblems = audit.siteIssues.filter((i) => i.severity !== 'good')

  return (
    <div className="space-y-6">
      <Card
        title="Salute SEO del sito"
        description="Analisi di tutti i contenuti e della configurazione. Non modifica nulla: ti dice cosa correggere per non perdere posizioni su Google, Bing e gli altri motori."
        action={<button type="button" onClick={() => void load()} disabled={loading} className={secondaryButton}>{loading ? 'Aggiorno…' : 'Rianalizza'}</button>}
      >
        <div className="flex flex-wrap items-center gap-6">
          <ScoreRing score={audit.score} size={112} />
          <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Pubblicati" value={audit.summary.published} />
            <Stat label="Programmati" value={audit.summary.scheduled} />
            <Stat label="Bozze" value={audit.summary.drafts} />
            <Stat label="Con errori" value={audit.summary.postsWithErrors} tone={audit.summary.postsWithErrors ? 'text-red-800' : 'text-emerald-800'} />
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-soft">Stato complessivo: <strong>{scoreLabel(audit.score)}</strong> · punteggio medio degli articoli pubblici {audit.summary.averagePostScore}/100.</p>
      </Card>

      <Card title="Configurazione e impostazioni" description="Problemi che riguardano l’intero sito, non un singolo articolo.">
        {siteProblems.length === 0 ? <p className="text-sm text-emerald-800">Nessun problema rilevato.</p> : <IssueGroups issues={siteProblems} showGood={false} />}
      </Card>

      <Card title="Articoli da sistemare" description="Ordinati dal punteggio più basso. Le bozze non sono incluse perché non sono visibili ai motori.">
        {problemPosts.length === 0 ? <p className="text-sm text-emerald-800">Tutti gli articoli pubblici sono in ordine.</p> : (
          <ul className="divide-y divide-line">
            {listed.map((post) => (
              <li key={post.id} className="py-3">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                    <ScoreBadge score={post.score} />
                    <span className="font-display text-lg">{post.title}</span>
                    <span className="text-xs text-ink-soft">{STATUS_LABEL[post.status]} · {post.errors} da correggere · {post.warnings} da migliorare</span>
                  </summary>
                  <div className="mt-3 border-l-2 border-line pl-4">
                    <ul className="divide-y divide-line/70">{post.issues.filter((i) => i.severity !== 'info').map((issue) => <IssueRow key={issue.id} issue={issue} />)}</ul>
                    <button type="button" onClick={() => onEditPost(post.id)} className={`${primaryButton} mt-3`}>Modifica articolo</button>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
        {problemPosts.length > 8 && <button type="button" onClick={() => setShowAll((v) => !v)} className={`${secondaryButton} mt-4`}>{showAll ? 'Mostra meno' : `Mostra tutti (${problemPosts.length})`}</button>}
      </Card>

      <Card
        title="Scansione del sito pubblicato"
        description="Controlla robots.txt, sitemap, feed e un campione fino a 32 pagine pubbliche sul dominio canonico (stato HTTP, title, description, canonical, noindex, H1, immagini e velocità)."
        action={<button type="button" onClick={() => void scan()} disabled={scanning} className={primaryButton}>{scanning ? 'Scansione in corso…' : live ? 'Scansiona di nuovo' : 'Avvia scansione'}</button>}
      >
        {!live && !scanning && <p className="text-sm text-ink-soft">La scansione usa il dominio definito in SITE_URL e visita fino a 32 pagine per restare entro il limite della funzione server. Non modifica nulla.</p>}
        {scanning && <p role="status" className="text-sm text-ink-soft">Sto visitando le pagine del dominio canonico…</p>}
        {live && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-6">
              <ScoreRing score={live.score} />
              <div className="grid flex-1 grid-cols-3 gap-3">
                <Stat label="Pagine verificate" value={live.summary.truncated ? `${live.summary.pages}/${live.summary.totalAvailablePages}` : live.summary.pages} />
                <Stat label="Errori" value={live.summary.errors} tone={live.summary.errors ? 'text-red-800' : 'text-emerald-800'} />
                <Stat label="Avvisi" value={live.summary.warnings} tone={live.summary.warnings ? 'text-amber-800' : 'text-emerald-800'} />
              </div>
            </div>
            {live.summary.truncated && <p className="text-xs text-ink-soft">È stato analizzato un campione di {live.summary.pages} pagine su {live.summary.totalAvailablePages}. Il controllo include pagine statiche e alterna articoli e categorie; non sostituisce i dati di copertura e rendimento di Search Console.</p>}
            <p className="text-xs text-ink-soft">Dominio analizzato: {live.origin}{live.summary.averageMs !== null && ` · risposta media ${live.summary.averageMs} ms`}</p>
            {live.global.length > 0 && <div><h3 className="mb-1 font-display text-lg">File del sito</h3><ul className="divide-y divide-line/70">{live.global.map((i) => <IssueRow key={i.id} issue={i} />)}</ul></div>}
            <div>
              <h3 className="mb-2 font-display text-lg">Pagine</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead><tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-ink-soft"><th className="py-2 pr-3">Pagina</th><th className="pr-3">HTTP</th><th className="pr-3">Tempo</th><th>Esito</th></tr></thead>
                  <tbody>
                    {live.pages.map((page) => {
                      const problems = page.issues.filter((i) => i.severity === 'error' || i.severity === 'warning' || i.severity === 'info')
                      return (
                        <tr key={page.path} className="border-b border-line/70 align-top">
                          <td className="py-2 pr-3 font-mono text-xs">{page.path}</td>
                          <td className="pr-3">{page.status ?? '—'}</td>
                          <td className="pr-3">{page.ms !== null ? `${page.ms} ms` : '—'}</td>
                          <td>{problems.length === 0 ? <span className="text-emerald-800">OK</span> : <ul>{problems.map((i) => <IssueRow key={i.id} issue={i} />)}</ul>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

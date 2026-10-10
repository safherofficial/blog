'use client'

import type { ReactNode } from 'react'
import type { Severity, SeoIssue } from '@/lib/seo/types'
import { scoreLabel } from '@/lib/seo/types'

export const inputClass =
  'w-full rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-wine focus:ring-1 focus:ring-wine/30'

export const primaryButton =
  'inline-flex items-center justify-center gap-2 border border-wine bg-wine px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-wine-dark disabled:cursor-not-allowed disabled:opacity-50'

export const secondaryButton =
  'inline-flex items-center justify-center gap-2 border border-line bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-wine transition-colors hover:bg-bg-soft disabled:cursor-not-allowed disabled:opacity-50'

export function Card({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border border-line bg-white p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{title}</h2>
          {description && <p className="mt-1 max-w-[60ch] text-sm text-ink-soft">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Contatore con intervallo ideale (SEO) o limite massimo (database). */
export function Counter({ value, ideal, max }: { value: number; ideal?: [number, number]; max?: number }) {
  let tone = 'text-ink-soft'
  if (ideal) tone = value === 0 ? 'text-ink-soft' : value >= ideal[0] && value <= ideal[1] ? 'text-emerald-700' : 'text-amber-700'
  if (max && value > max * 0.95) tone = 'text-red-700'
  const target = ideal ? `${ideal[0]}–${ideal[1]}` : max ? `max ${max}` : ''
  return <span className={`font-mono text-[11px] ${tone}`}>{value}{target && ` · ${target}`}</span>
}

export function Field({ id, label, hint, counter, children }: { id: string; label: string; hint?: string; counter?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-ink" htmlFor={id}>{label}</label>
        {counter}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}

const SEVERITY_STYLE: Record<Severity, { dot: string; text: string; label: string }> = {
  error: { dot: 'bg-red-600', text: 'text-red-800', label: 'Da correggere' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-800', label: 'Da migliorare' },
  info: { dot: 'bg-sky-600', text: 'text-sky-800', label: 'Suggerimenti' },
  good: { dot: 'bg-emerald-600', text: 'text-emerald-800', label: 'Superati' },
}

export const severityLabel = (severity: Severity) => SEVERITY_STYLE[severity].label

export function scoreTone(score: number): string {
  if (score >= 85) return 'border-emerald-300 bg-emerald-50 text-emerald-800'
  if (score >= 60) return 'border-amber-300 bg-amber-50 text-amber-800'
  return 'border-red-300 bg-red-50 text-red-800'
}

export function ScoreBadge({ score }: { score: number }) {
  return <span title={scoreLabel(score)} className={`inline-flex min-w-[2.5rem] justify-center border px-1.5 py-0.5 font-mono text-[11px] ${scoreTone(score)}`}>{score}</span>
}

export function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const color = score >= 85 ? '#047857' : score >= 60 ? '#b45309' : '#b91c1c'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Punteggio SEO ${score} su 100: ${scoreLabel(score)}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E9DED0" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} style={{ transition: 'stroke-dashoffset 400ms ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-2xl" style={{ color }}>{score}</span>
    </div>
  )
}

export function IssueRow({ issue, onJump }: { issue: SeoIssue; onJump?: (issue: SeoIssue) => void }) {
  const style = SEVERITY_STYLE[issue.severity]
  const content = (
    <>
      <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
      <span className="min-w-0">
        <span className="block text-sm text-ink">{issue.message}</span>
        {issue.hint && <span className="mt-0.5 block text-xs text-ink-soft">{issue.hint}</span>}
      </span>
    </>
  )
  if (onJump && issue.field) {
    return (
      <li>
        <button type="button" onClick={() => onJump(issue)} className="flex w-full items-start gap-3 px-1 py-2 text-left hover:bg-bg-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-wine">
          {content}
        </button>
      </li>
    )
  }
  return <li className="flex items-start gap-3 px-1 py-2">{content}</li>
}

export function IssueGroups({ issues, onJump, showGood = true }: { issues: SeoIssue[]; onJump?: (issue: SeoIssue) => void; showGood?: boolean }) {
  const order: Severity[] = ['error', 'warning', 'info']
  return (
    <div className="space-y-5">
      {order.map((severity) => {
        const items = issues.filter((i) => i.severity === severity)
        if (items.length === 0) return null
        return (
          <div key={severity}>
            <h3 className={`mb-1 font-mono text-[11px] uppercase tracking-[0.16em] ${SEVERITY_STYLE[severity].text}`}>{SEVERITY_STYLE[severity].label} · {items.length}</h3>
            <ul className="divide-y divide-line/70">{items.map((issue) => <IssueRow key={issue.id} issue={issue} onJump={onJump} />)}</ul>
          </div>
        )
      })}
      {showGood && issues.some((i) => i.severity === 'good') && (
        <details className="group">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-800">Superati · {issues.filter((i) => i.severity === 'good').length}</summary>
          <ul className="mt-1 divide-y divide-line/70">{issues.filter((i) => i.severity === 'good').map((issue) => <IssueRow key={issue.id} issue={issue} />)}</ul>
        </details>
      )}
    </div>
  )
}

export type ToastItem = { id: number; kind: 'success' | 'error' | 'info'; text: string }

export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  const tone = { success: 'border-emerald-300 bg-emerald-50 text-emerald-900', error: 'border-red-300 bg-red-50 text-red-900', info: 'border-line bg-white text-ink' }
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} role={item.kind === 'error' ? 'alert' : 'status'} className={`pointer-events-auto flex items-start justify-between gap-3 border px-4 py-3 text-sm shadow-md ${tone[item.kind]}`}>
          <span>{item.text}</span>
          <button type="button" onClick={() => onDismiss(item.id)} aria-label="Chiudi notifica" className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Notify } from './types'
import { Card, inputClass, secondaryButton } from './ui'

type MessageStatus = 'new' | 'reading' | 'replied' | 'archived'
type ReaderMessage = {
  id: string
  category: string
  message: string
  display_name: string | null
  email: string | null
  wants_reply: boolean
  status: MessageStatus
  created_at: string
  replied_at: string | null
}

const STATUS_LABEL: Record<MessageStatus, string> = {
  new: 'Da leggere',
  reading: 'In lettura',
  replied: 'Risposto',
  archived: 'Archiviato',
}
const CATEGORY_LABEL: Record<string, string> = {
  consiglio: 'Vorrei un consiglio',
  racconto: 'Ho qualcosa da raccontare',
  parere: 'Vorrei conoscere il tuo parere',
  argomento: 'Suggerimento per il blog',
  altro: 'Altro',
}

export default function ReaderMessages({ notify, onUnauthorized }: { notify: Notify; onUnauthorized: () => void }) {
  const [messages, setMessages] = useState<ReaderMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/messages', { cache: 'no-store' })
      if (response.status === 401) { onUnauthorized(); return }
      const result = await response.json().catch(() => [])
      if (!response.ok) throw new Error(Array.isArray(result) ? 'Impossibile caricare i messaggi.' : result.error || 'Impossibile caricare i messaggi.')
      setMessages(Array.isArray(result) ? result : [])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossibile caricare i messaggi.')
    } finally {
      setLoading(false)
    }
  }, [onUnauthorized])

  useEffect(() => { void load() }, [load])

  async function updateStatus(message: ReaderMessage, status: MessageStatus) {
    if (message.status === status) return
    setBusyId(message.id)
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.status === 401) { onUnauthorized(); return }
      if (!response.ok) throw new Error(result.error || 'Impossibile aggiornare il messaggio.')
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, status } : item))
      notify('success', 'Stato del messaggio aggiornato.')
    } catch (caught) {
      notify('error', caught instanceof Error ? caught.message : 'Impossibile aggiornare il messaggio.')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(message: ReaderMessage) {
    if (!confirm('Eliminare definitivamente questo messaggio? Questa operazione non può essere annullata.')) return
    setBusyId(message.id)
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (response.status === 401) { onUnauthorized(); return }
      if (!response.ok) throw new Error(result.error || 'Impossibile eliminare il messaggio.')
      setMessages((current) => current.filter((item) => item.id !== message.id))
      notify('success', 'Messaggio eliminato definitivamente.')
    } catch (caught) {
      notify('error', caught instanceof Error ? caught.message : 'Impossibile eliminare il messaggio.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title="Messaggi dei lettori"
        description="I racconti restano privati. Puoi leggerli, aggiornare lo stato, rispondere via email quando richiesto o eliminarli."
        action={<button type="button" onClick={() => void load()} disabled={loading} className={secondaryButton}>{loading ? 'Aggiornamento…' : 'Aggiorna'}</button>}
      >
        <p className="mb-5 text-xs text-ink-soft">Mostriamo gli ultimi 500 messaggi, dal più recente. Elimina quelli che non sono più necessari.</p>
        {error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {loading ? (
          <p role="status" className="py-8 text-sm text-ink-soft">Caricamento dei messaggi…</p>
        ) : messages.length === 0 ? (
          <div className="border border-dashed border-line px-5 py-10 text-center">
            <p className="font-display text-2xl">Per ora, nessun messaggio.</p>
            <p className="mt-2 text-sm text-ink-soft">Quando qualcuno ti scriverà da «Raccontamelo», lo troverai qui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message.id} className="border border-line bg-bg p-4 md:p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ochre">{CATEGORY_LABEL[message.category] || 'Altro'}</p>
                    <h3 className="mt-1 font-display text-xl">{message.display_name || 'Senza nome'}</h3>
                    <p className="mt-1 text-xs text-ink-soft">{new Date(message.created_at).toLocaleString('it-IT')}</p>
                  </div>
                  <span className={`inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${message.status === 'new' ? 'border-amber-300 bg-amber-50 text-amber-900' : message.status === 'replied' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-line bg-white text-ink-soft'}`}>
                    {STATUS_LABEL[message.status]}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed text-ink">{message.message}</p>
                <div className="mt-5 border-t border-line pt-4">
                  {message.wants_reply && message.email ? (
                    <p className="mb-4 break-all text-sm text-ink-soft">Ha chiesto una risposta: <a className="underline decoration-ochre underline-offset-4 hover:text-wine" href={`mailto:${message.email}?subject=${encodeURIComponent('Il tuo messaggio a Controluce')}`}>{message.email}</a></p>
                  ) : (
                    <p className="mb-4 text-xs text-ink-soft">Non ha richiesto una risposta personale.</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    {message.wants_reply && message.email && (
                      <a href={`mailto:${message.email}?subject=${encodeURIComponent('Il tuo messaggio a Controluce')}`} className="inline-flex items-center border border-wine bg-wine px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-wine-dark">
                        Rispondi via email ↗
                      </a>
                    )}
                    <label className="sr-only" htmlFor={`message-status-${message.id}`}>Stato del messaggio di {message.display_name || 'lettore'}</label>
                    <select id={`message-status-${message.id}`} className={`${inputClass} w-auto min-w-40 py-2 text-xs`} value={message.status} disabled={busyId === message.id} onChange={(event) => void updateStatus(message, event.target.value as MessageStatus)}>
                      {(Object.keys(STATUS_LABEL) as MessageStatus[]).map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
                    </select>
                    <button type="button" onClick={() => void remove(message)} disabled={busyId === message.id} className="ml-auto border border-red-200 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-red-800 hover:bg-red-50 disabled:opacity-50">
                      Elimina
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

'use client'
import { useCallback, useEffect, useState } from 'react'
import { Inbox, Mail, Phone, RotateCcw, X } from 'lucide-react'

type Inquiry = {
  _id: string
  name: string
  phone: string
  email?: string
  intent?: string
  message?: string
  propertySlug?: string
  source: string
  status: string
  notes?: string
  createdAt: string
}

export default function InquiriesAdmin() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [newCount, setNewCount] = useState(0)
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (st = status, src = source) => {
    setLoading(true)
    setError('')
    try {
      const sp = new URLSearchParams()
      if (st) sp.set('status', st)
      if (src) sp.set('source', src)
      const res = await fetch(`/api/admin/inquiries?${sp.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load inquiries')
      setItems(data.items ?? [])
      setNewCount(data.newCount ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries.')
    } finally {
      setLoading(false)
    }
  }, [status, source])

  useEffect(() => { load() }, [load])

  function openDetail(item: Inquiry) {
    setSelected(item)
    setEditStatus(item.status)
    setEditNotes(item.notes ?? '')
  }

  function resetFilters() {
    setStatus('')
    setSource('')
    load('', '')
  }

  async function patch(id: string, body: Record<string, string>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Update failed')
      await load()
      setSelected((s) => (s && s._id === id ? { ...s, ...body } as Inquiry : s))
    } finally {
      setSaving(false)
    }
  }

  const openCount = items.filter((i) => i.status !== 'closed').length

  return (
    <div>
      <style>{`@media (max-width: 767px){.rs-inq-tablewrap{display:none}}.rs-inq-cards{display:grid;gap:10px}@media (min-width: 768px){.rs-inq-cards{display:none}}.rs-inq-card{border:1px solid #e5ddf0;border-radius:8px;padding:12px;background:#fff}.rs-inq-drawer{position:fixed;top:0;right:0;height:100dvh;width:min(420px,100%);background:#fff;box-shadow:-8px 0 30px rgba(0,0,0,.15);z-index:50;overflow-y:auto;padding:20px}.rs-inq-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:40}.rs-inq-kpis{display:grid;gap:10px;grid-template-columns:repeat(2,1fr);margin-bottom:16px}@media (min-width: 768px){.rs-inq-kpis{grid-template-columns:repeat(3,1fr)}}.rs-inq-kpi{border:1px solid #e5ddf0;border-radius:8px;padding:14px;background:#fff}.rs-inq-kpi strong{font-size:24px;color:#4b1659;display:block}`}</style>
      <div className="rs-admin-head">
        <h1>Inquiries</h1>
      </div>

      <div className="rs-inq-kpis" aria-label="Inquiry stats">
        <div className="rs-inq-kpi"><span>New</span><strong>{newCount}</strong></div>
        <div className="rs-inq-kpi"><span>Open</span><strong>{openCount}</strong></div>
        <div className="rs-inq-kpi"><span>Inbox</span><strong>{items.length}</strong></div>
      </div>

      <form
        className="rs-admin-search"
        role="search"
        aria-label="Filter inquiries"
        onSubmit={(e) => { e.preventDefault(); load() }}
      >
        <label htmlFor="f-status" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Status</label>
        <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" style={{ maxWidth: 180 }}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <label htmlFor="f-source" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Source</label>
        <select id="f-source" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Filter by source" style={{ maxWidth: 200 }}>
          <option value="">All sources</option>
          <option value="contact">Contact</option>
          <option value="property-cta">Property CTA</option>
        </select>
        <button type="submit" className="rs-admin-primary">Apply</button>
        {(status || source) && (
          <button type="button" onClick={resetFilters} aria-label="Reset filters" style={{ minHeight: 44 }}>
            <RotateCcw size={16} aria-hidden="true" /> Reset
          </button>
        )}
      </form>

      {loading && <p aria-live="polite">Loading inquiries…</p>}

      {!loading && error && (
        <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <p style={{ color: '#b91c1c' }}>{error}</p>
          <button type="button" onClick={() => load()} className="rs-admin-primary">Retry</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Inbox size={32} aria-hidden="true" />
          <p>No inquiries match these filters.</p>
          <button type="button" onClick={resetFilters} className="rs-admin-primary">Reset filters</button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="rs-admin-tablewrap rs-inq-tablewrap">
            <table className="rs-admin-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Source</th><th>Status</th><th>Property</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((q) => (
                  <tr key={q._id}>
                    <td>{q.name}</td>
                    <td><a href={`tel:${q.phone.replace(/\s/g, '')}`}>{q.phone}</a></td>
                    <td>{q.source}</td>
                    <td>{q.status}</td>
                    <td>{q.propertySlug ?? '—'}</td>
                    <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td><button type="button" onClick={() => openDetail(q)} aria-label={`View ${q.name}`}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rs-inq-cards">
            {items.map((q) => (
              <article key={q._id} className="rs-inq-card">
                <strong>{q.name}</strong>
                <p style={{ margin: '4px 0', fontSize: 13 }}>{q.status} · {q.source}</p>
                <p style={{ margin: '4px 0', fontSize: 13 }}><a href={`tel:${q.phone.replace(/\s/g, '')}`}>{q.phone}</a></p>
                <button type="button" onClick={() => openDetail(q)} aria-label={`View ${q.name}`} style={{ minHeight: 44 }}>View details</button>
              </article>
            ))}
          </div>
        </>
      )}
      <p aria-live="polite">{!loading && !error ? `${items.length} inquiries` : ''}</p>

      {selected && (
        <>
          <div className="rs-inq-overlay" onClick={() => setSelected(null)} aria-hidden="true" />
          <aside className="rs-inq-drawer" role="dialog" aria-modal="true" aria-label={`Inquiry from ${selected.name}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{selected.name}</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close details" style={{ minWidth: 44, minHeight: 44 }}><X size={18} /></button>
            </div>
            <p>
              <a href={`tel:${selected.phone.replace(/\s/g, '')}`}><Phone size={14} aria-hidden="true" /> {selected.phone}</a>
            </p>
            {selected.email && (
              <p>
                <a href={`mailto:${selected.email}`}><Mail size={14} aria-hidden="true" /> {selected.email}</a>
              </p>
            )}
            <p style={{ fontSize: 13 }}>Intent: {selected.intent ?? '—'} · Source: {selected.source} · Property: {selected.propertySlug ?? '—'}</p>
            {selected.message && <p style={{ fontSize: 14 }}>{selected.message}</p>}
            <label htmlFor="inq-status" style={{ fontSize: 12, fontWeight: 700 }}>STATUS</label>
            <select
              id="inq-status"
              value={editStatus}
              onChange={(e) => { setEditStatus(e.target.value); patch(selected._id, { status: e.target.value }) }}
              aria-label="Update status"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <label htmlFor="inq-notes" style={{ fontSize: 12, fontWeight: 700, marginTop: 12, display: 'block' }}>NOTES</label>
            <textarea
              id="inq-notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Internal notes…"
              aria-label="Inquiry notes"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" className="rs-admin-primary" disabled={saving} onClick={() => patch(selected._id, { notes: editNotes })}>
                {saving ? 'SAVING…' : 'Save notes'}
              </button>
              <button type="button" onClick={() => setSelected(null)} style={{ minHeight: 44 }}>Close</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

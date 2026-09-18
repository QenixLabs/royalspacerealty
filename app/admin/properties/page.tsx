'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

type Item = { _id: string; slug: string; name: string; location: string; priceDisplay: string; status: string; updatedAt: string }

export default function PropertiesAdmin() {
  const [items, setItems] = useState<Item[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(query = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/properties?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
    load(q)
  }

  return (
    <div>
      <div className="rs-admin-head">
        <h1>Properties</h1>
        <Link href="/admin/properties/new" className="rs-admin-primary"><Plus size={16} /> New Property</Link>
      </div>
      <form className="rs-admin-search" role="search" onSubmit={(e) => { e.preventDefault(); load(q) }}>
        <Search size={16} aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, location, builder…" aria-label="Search properties" />
        <button type="submit">Search</button>
      </form>
      {loading ? <p aria-live="polite">Loading…</p> : (
        <div className="rs-admin-tablewrap">
          <table className="rs-admin-table">
            <thead><tr><th>Name</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td><td>{p.location}</td><td>{p.priceDisplay}</td><td>{p.status}</td>
                  <td><Link href={`/admin/properties/${p._id}`} aria-label={`Edit ${p.name}`}><Pencil size={16} /></Link>
                  <button type="button" onClick={() => remove(p._id, p.name)} aria-label={`Delete ${p.name}`}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p aria-live="polite">{items.length} properties</p>
    </div>
  )
}

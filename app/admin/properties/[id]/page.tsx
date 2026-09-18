'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { ImageUploader, type Img } from '@/components/admin/image-uploader'

type Config = { bhk: string; area: string; price?: string }
type Form = {
  name: string; slug: string; builder: string; location: string; address: string
  status: string; priceDisplay: string; areaDisplay: string; bhkDisplay: string
  category: string; overview: string; amenities: string
  configs: Config[]; images: Img[]
}

const blank: Form = {
  name: '', slug: '', builder: '', location: '', address: '',
  status: 'Ready to Move', priceDisplay: '', areaDisplay: '', bhkDisplay: '',
  category: 'Residential', overview: '', amenities: '',
  configs: [], images: [],
}

export default function PropertyEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const [form, setForm] = useState<Form>(blank)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    ;(async () => {
      const res = await fetch(`/api/admin/properties?q=`)
      const data = await res.json()
      const found = (data.items ?? []).find((p: { _id: string }) => p._id === id)
      if (!found) { setError('Property not found.'); setLoading(false); return }
      setForm({
        name: found.name ?? '', slug: found.slug ?? '', builder: found.builder ?? '',
        location: found.location ?? '', address: found.address ?? '',
        status: found.status ?? '', priceDisplay: found.priceDisplay ?? '',
        areaDisplay: found.areaDisplay ?? '', bhkDisplay: found.bhkDisplay ?? '',
        category: found.category ?? 'Residential',
        overview: Array.isArray(found.overview) ? found.overview.join('\n') : '',
        amenities: Array.isArray(found.amenities) ? found.amenities.join(', ') : '',
        configs: found.configurations ?? [], images: found.images ?? [],
      })
      setLoading(false)
    })()
  }, [id, isNew])

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const required: [keyof Form, string][] = [
      ['name', 'f-name'], ['slug', 'f-slug'], ['location', 'f-location'],
    ]
    for (const [k, fid] of required) {
      if (!(form[k] as string).trim()) {
        setError(`${k} is required.`)
        document.getElementById(fid)?.focus()
        return
      }
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name, slug: form.slug, builder: form.builder, location: form.location,
        address: form.address, status: form.status, priceDisplay: form.priceDisplay,
        areaDisplay: form.areaDisplay, bhkDisplay: form.bhkDisplay, category: form.category,
        overview: form.overview.split('\n').map((s) => s.trim()).filter(Boolean),
        amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        configurations: form.configs, images: form.images,
      }
      const res = await fetch(isNew ? '/api/admin/properties' : `/api/admin/properties/${id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/admin/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p aria-live="polite">Loading…</p>

  return (
    <form onSubmit={save} aria-label={isNew ? 'New property' : 'Edit property'}>
      <div className="rs-admin-head">
        <h1>{isNew ? 'New Property' : 'Edit Property'}</h1>
        <button type="submit" className="rs-admin-primary" disabled={saving}>{saving ? 'SAVING…' : 'Save'}</button>
      </div>
      {error && <p role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
      <div className="rs-admin-grid">
        <label htmlFor="f-name">Name*</label>
        <input id="f-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <label htmlFor="f-slug">Slug*</label>
        <input id="f-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="e.g. palm-meadows-whitefield" />
        <label htmlFor="f-builder">Builder</label>
        <input id="f-builder" value={form.builder} onChange={(e) => set('builder', e.target.value)} />
        <label htmlFor="f-location">Location*</label>
        <input id="f-location" value={form.location} onChange={(e) => set('location', e.target.value)} />
        <label htmlFor="f-address">Address</label>
        <input id="f-address" value={form.address} onChange={(e) => set('address', e.target.value)} />
        <label htmlFor="f-status">Status</label>
        <input id="f-status" value={form.status} onChange={(e) => set('status', e.target.value)} placeholder="Ready to Move / Under Construction" />
        <label htmlFor="f-price">Price display</label>
        <input id="f-price" value={form.priceDisplay} onChange={(e) => set('priceDisplay', e.target.value)} placeholder="₹ 1.2 Cr*" />
        <label htmlFor="f-area">Area display</label>
        <input id="f-area" value={form.areaDisplay} onChange={(e) => set('areaDisplay', e.target.value)} />
        <label htmlFor="f-bhk">BHK display</label>
        <input id="f-bhk" value={form.bhkDisplay} onChange={(e) => set('bhkDisplay', e.target.value)} />
        <label htmlFor="f-category">Category</label>
        <select id="f-category" value={form.category} onChange={(e) => set('category', e.target.value)}>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
        </select>
      </div>
      <label htmlFor="f-overview">Overview (one per line)</label>
      <textarea id="f-overview" rows={5} value={form.overview} onChange={(e) => set('overview', e.target.value)} />
      <div>
        <h3>Configurations</h3>
        {form.configs.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={c.bhk} onChange={(e) => set('configs', form.configs.map((x, j) => j === i ? { ...x, bhk: e.target.value } : x))} placeholder="BHK" aria-label={`Config ${i + 1} BHK`} />
            <input value={c.area} onChange={(e) => set('configs', form.configs.map((x, j) => j === i ? { ...x, area: e.target.value } : x))} placeholder="Area" aria-label={`Config ${i + 1} area`} />
            <input value={c.price ?? ''} onChange={(e) => set('configs', form.configs.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} placeholder="Price" aria-label={`Config ${i + 1} price`} />
            <button type="button" onClick={() => set('configs', form.configs.filter((_, j) => j !== i))} aria-label={`Remove config ${i + 1}`}><Trash2 size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={() => set('configs', [...form.configs, { bhk: '', area: '', price: '' }])}><Plus size={14} /> Add configuration</button>
      </div>
      <label htmlFor="f-amenities">Amenities (comma separated)</label>
      <input id="f-amenities" value={form.amenities} onChange={(e) => set('amenities', e.target.value)} placeholder="Pool, Gym, Park" />
      <h3>Images</h3>
      <ImageUploader slug={form.slug || 'general'} images={form.images} onChange={(v) => set('images', v)} />
    </form>
  )
}

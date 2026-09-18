'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader, type Img } from '@/components/admin/image-uploader'
import { cn } from 'cn'

type Config = { bhk: string; area: string; price?: string }
type Form = {
  name: string; slug: string; builder: string; location: string; address: string
  status: string; priceDisplay: string; areaDisplay: string; bhkDisplay: string
  category: string; overview: string; amenities: string
  configs: Config[]; images: Img[]
}

type FieldErrors = Partial<Record<'name' | 'slug' | 'location', string>>

const blank: Form = {
  name: '', slug: '', builder: '', location: '', address: '',
  status: 'Ready to Move', priceDisplay: '', areaDisplay: '', bhkDisplay: '',
  category: 'Residential', overview: '', amenities: '',
  configs: [], images: [],
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default function PropertyEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const [form, setForm] = useState<Form>(blank)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

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
    setFieldErrors((e) => (k in e ? { ...e, [k]: undefined } : e))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const required: [keyof FieldErrors, string][] = [
      ['name', 'f-name'], ['slug', 'f-slug'], ['location', 'f-location'],
    ]
    const errors: FieldErrors = {}
    for (const [k] of required) {
      if (!(form[k] as string).trim()) errors[k] = `${k} is required.`
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      const first = required.find(([k]) => errors[k])
      if (first) document.getElementById(first[1])?.focus()
      return
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6" aria-live="polite" aria-label="Loading property">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const err = (k: keyof FieldErrors) => fieldErrors[k]

  return (
    <form onSubmit={save} aria-label={isNew ? 'New property' : 'Edit property'} className="flex flex-col gap-6 pb-4">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Core details shown on the listing card and detail page.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field id="f-name" label="Name *" error={err('name')}>
            <Input
              id="f-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={!!err('name')}
              aria-describedby={err('name') ? 'f-name-error' : undefined}
            />
          </Field>
          <Field id="f-slug" label="Slug *" error={err('slug')}>
            <Input
              id="f-slug"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="e.g. palm-meadows-whitefield"
              aria-invalid={!!err('slug')}
              aria-describedby={err('slug') ? 'f-slug-error' : undefined}
            />
          </Field>
          <Field id="f-builder" label="Builder">
            <Input id="f-builder" value={form.builder} onChange={(e) => set('builder', e.target.value)} />
          </Field>
          <Field id="f-location" label="Location *" error={err('location')}>
            <Input
              id="f-location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              aria-invalid={!!err('location')}
              aria-describedby={err('location') ? 'f-location-error' : undefined}
            />
          </Field>
          <Field id="f-address" label="Address">
            <Input id="f-address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field id="f-status" label="Status">
            <Input
              id="f-status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              placeholder="Ready to Move / Under Construction"
            />
          </Field>
          <Field id="f-price" label="Price display">
            <Input id="f-price" value={form.priceDisplay} onChange={(e) => set('priceDisplay', e.target.value)} placeholder="₹ 1.2 Cr*" />
          </Field>
          <Field id="f-area" label="Area display">
            <Input id="f-area" value={form.areaDisplay} onChange={(e) => set('areaDisplay', e.target.value)} />
          </Field>
          <Field id="f-bhk" label="BHK display">
            <Input id="f-bhk" value={form.bhkDisplay} onChange={(e) => set('bhkDisplay', e.target.value)} />
          </Field>
          <Field id="f-category" label="Category">
            <Select value={form.category} onValueChange={(v) => v && set('category', v)}>
              <SelectTrigger id="f-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="lg:col-span-2">
            <Field id="f-overview" label="Overview (one per line)">
              <Textarea id="f-overview" rows={5} value={form.overview} onChange={(e) => set('overview', e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurations</CardTitle>
          <CardDescription>BHK variants with area and price.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {form.configs.map((c, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={c.bhk}
                onChange={(e) => set('configs', form.configs.map((x, j) => j === i ? { ...x, bhk: e.target.value } : x))}
                placeholder="BHK"
                aria-label={`Config ${i + 1} BHK`}
                className="sm:w-28"
              />
              <Input
                value={c.area}
                onChange={(e) => set('configs', form.configs.map((x, j) => j === i ? { ...x, area: e.target.value } : x))}
                placeholder="Area"
                aria-label={`Config ${i + 1} area`}
                className="sm:flex-1"
              />
              <Input
                value={c.price ?? ''}
                onChange={(e) => set('configs', form.configs.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                placeholder="Price"
                aria-label={`Config ${i + 1} price`}
                className="sm:flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => set('configs', form.configs.filter((_, j) => j !== i))}
                aria-label={`Remove config ${i + 1}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => set('configs', [...form.configs, { bhk: '', area: '', price: '' }])}
            >
              <Plus aria-hidden="true" />
              Add configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>Comma separated list.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field id="f-amenities" label="Amenities">
            <Textarea
              id="f-amenities"
              value={form.amenities}
              onChange={(e) => set('amenities', e.target.value)}
              placeholder="Pool, Gym, Park"
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload gallery images. Star an image to set it as the cover.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader slug={form.slug || 'general'} images={form.images} onChange={(v) => set('images', v)} />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/properties')}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className={cn('min-w-28 text-white')}
            style={{ background: 'var(--rs-grad)' }}
          >
            {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  )
}

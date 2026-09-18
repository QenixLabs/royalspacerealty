'use client'
import { useCallback, useEffect, useState } from 'react'
import { Inbox, Loader2, Mail, Phone, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from 'cn'

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

const STATUS_OPTS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
] as const

function statusVariant(status: string) {
  if (status === 'new') return 'bg-[var(--purple-700)] text-white hover:bg-[var(--purple-700)]'
  if (status === 'contacted') return ''
  return 'border-border text-muted-foreground'
}

export default function InquiriesAdmin() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [newCount, setNewCount] = useState(0)
  const [status, setStatus] = useState('all')
  const [source, setSource] = useState('all')
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
      if (st !== 'all') sp.set('status', st)
      if (src !== 'all') sp.set('source', src)
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
    setStatus('all')
    setSource('all')
    load('all', 'all')
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
  const filtersActive = status !== 'all' || source !== 'all'

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-label="Inquiry stats">
        <Card size="sm">
          <CardHeader>
            <CardDescription>New</CardDescription>
            <CardTitle className="text-3xl!" style={{ color: 'var(--purple-700)' }}>{newCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-3xl!" style={{ color: 'var(--purple-700)' }}>{openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm" className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardDescription>Inbox</CardDescription>
            <CardTitle className="text-3xl!" style={{ color: 'var(--purple-700)' }}>{items.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card size="sm">
        <CardContent>
          <form
            role="search"
            aria-label="Filter inquiries"
            onSubmit={(e) => { e.preventDefault(); load() }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
              <SelectTrigger id="f-status" className="sm:w-44" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={source} onValueChange={(v) => setSource(v ?? 'all')}>
              <SelectTrigger id="f-source" className="sm:w-48" aria-label="Filter by source">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="property-cta">Property CTA</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button type="submit" className="text-white" style={{ background: 'var(--rs-grad)' }}>
                Apply
              </Button>
              {filtersActive && (
                <Button type="button" variant="ghost" onClick={resetFilters} aria-label="Reset filters">
                  <RotateCcw aria-hidden="true" />
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Card size="sm">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card size="sm">
          <CardContent>
            <div role="alert" className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" onClick={() => load()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card size="sm">
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No inquiries match these filters.</p>
              {filtersActive && (
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card size="sm">
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((q) => (
                    <TableRow key={q._id}>
                      <TableCell className="font-medium">{q.name}</TableCell>
                      <TableCell>
                        <a href={`tel:${q.phone.replace(/\s/g, '')}`} className="underline-offset-3 hover:underline">
                          {q.phone}
                        </a>
                      </TableCell>
                      <TableCell>{q.source}</TableCell>
                      <TableCell className="max-w-[220px]">
                        <Badge
                          variant={q.status === 'contacted' ? 'secondary' : 'outline'}
                          className={cn('block max-w-full truncate', statusVariant(q.status))}
                          title={q.status}
                        >
                          {q.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{q.propertySlug ?? '—'}</TableCell>
                      <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="w-[1%] whitespace-nowrap text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(q)}
                          aria-label={`View ${q.name}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {!loading && !error ? `${items.length} inquiries` : ''}
      </p>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  Intent: {selected.intent ?? '—'} · Source: {selected.source} · Property: {selected.propertySlug ?? '—'}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${selected.phone.replace(/\s/g, '')}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    <Phone aria-hidden="true" />
                    {selected.phone}
                  </a>
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      <Mail aria-hidden="true" />
                      {selected.email}
                    </a>
                  )}
                </div>

                {selected.message && (
                  <p className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">{selected.message}</p>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="inq-status">Status</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => { if (!v) return; setEditStatus(v); patch(selected._id, { status: v }) }}
                  >
                    <SelectTrigger id="inq-status" className="w-full" aria-label="Update status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="inq-notes">Notes</Label>
                  <Textarea
                    id="inq-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Internal notes…"
                    aria-label="Inquiry notes"
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  disabled={saving}
                  className="text-white"
                  style={{ background: 'var(--rs-grad)' }}
                  onClick={() => patch(selected._id, { notes: editNotes })}
                >
                  {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
                  {saving ? 'Saving…' : 'Save notes'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

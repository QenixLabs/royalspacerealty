'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from 'cn'
import { LISTING_TYPES, LISTING_TYPE_LABEL, type ListingType } from '@/lib/listing'

type Item = { _id: string; slug: string; name: string; location: string; area?: string; priceDisplay: string; status: string; possession?: string; listingType?: string; featured?: boolean; updatedAt: string }

const AVAILABILITY_STYLE: Record<string, string> = {
  Resale: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  'Under Construction': 'border-amber-400 text-amber-700 hover:bg-transparent',
}

export default function PropertiesAdmin() {
  const [items, setItems] = useState<Item[]>([])
  const [q, setQ] = useState('')
  const [type, setType] = useState<string>('')
  const [loading, setLoading] = useState(true)

  async function load(query = '', listingType = type) {
    setLoading(true)
    const res = await fetch(`/api/admin/properties?q=${encodeURIComponent(query)}&type=${encodeURIComponent(listingType)}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // Live search, debounced 300ms
  useEffect(() => {
    const t = setTimeout(() => { load(q, type) }, 300)
    return () => clearTimeout(t)
  }, [q, type])

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
    load(q)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Properties</h1>
        <Link
          href="/admin/properties/new"
          className={cn(buttonVariants({ variant: 'default' }), 'text-white')}
          style={{ background: 'var(--rs-grad)' }}
        >
          <Plus aria-hidden="true" />
          New Property
        </Link>
      </div>

      <Card className="bg-white text-neutral-900 border-neutral-200">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md sm:flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, location, builder…"
                aria-label="Search properties"
                className="pl-8"
              />
            </div>
            <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : v ?? '')}>
              <SelectTrigger aria-label="Filter by availability" className="w-full sm:w-56">
                <SelectValue placeholder="All availability">
                  {(v: string) => (v === 'all' ? 'All availability' : LISTING_TYPE_LABEL[v as ListingType] ?? v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All availability</SelectItem>
                {LISTING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{LISTING_TYPE_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!loading && items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-14 text-center">
              <Building2 className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {q ? 'No properties match your search.' : 'No properties yet. Create your first one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full max-w-32" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    items.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell className="font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            {p.name}
                            {p.featured && (
                              <Badge className="bg-purple-700 text-white hover:bg-purple-700" title="Featured project">
                                <Star className="size-3" aria-hidden="true" fill="currentColor" />
                                Featured
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>{p.area || <span className="text-muted-foreground">Not set</span>}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={p.location}>{p.location}</TableCell>
                        <TableCell>{p.priceDisplay}</TableCell>
                        <TableCell>
                          {p.listingType && (
                            <Badge
                              variant={p.listingType === 'Resale' ? 'secondary' : 'outline'}
                              className={AVAILABILITY_STYLE[p.listingType]}
                            >
                              {LISTING_TYPE_LABEL[p.listingType as ListingType] ?? p.listingType}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="w-[1%] whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/admin/properties/${p._id}`}
                              aria-label={`Edit ${p.name}`}
                              className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
                            >
                              <Pencil aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(p._id, p.name)}
                              aria-label={`Delete ${p.name}`}
                              className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                                'text-destructive hover:text-destructive',
                              )}
                            >
                              <Trash2 aria-hidden="true" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-neutral-200">
          <p className="text-xs text-muted-foreground" aria-live="polite">{items.length} properties</p>
        </CardFooter>
      </Card>
    </div>
  )
}

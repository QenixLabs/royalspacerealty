'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from 'cn'

type Item = { _id: string; slug: string; name: string; location: string; priceDisplay: string; status: string; featured?: boolean; updatedAt: string }

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

  // Live search, debounced 300ms
  useEffect(() => {
    const t = setTimeout(() => { load(q) }, 300)
    return () => clearTimeout(t)
  }, [q])

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
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, location, builder…"
              aria-label="Search properties"
              className="pl-8"
            />
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
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
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
                        <TableCell>{p.location}</TableCell>
                        <TableCell>{p.priceDisplay}</TableCell>
                        <TableCell className="max-w-[220px]">
                          <Badge
                            variant={p.status === 'Ready to Move' ? 'secondary' : 'outline'}
                            className="block max-w-full truncate"
                            title={p.status}
                          >
                            {p.status}
                          </Badge>
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

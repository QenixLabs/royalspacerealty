'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from 'cn'

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
    <Card>
      <CardHeader className="flex-col gap-4 @[700px]/card-header:flex-row @[700px]/card-header:items-center @[700px]/card-header:justify-between">
        <CardTitle className="text-xl">Properties</CardTitle>
        <Link
          href="/admin/properties/new"
          className={cn(buttonVariants({ variant: 'default' }), 'text-white')}
          style={{ background: 'var(--rs-grad)' }}
        >
          <Plus aria-hidden="true" />
          New Property
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          role="search"
          aria-label="Search properties"
          onSubmit={(e) => { e.preventDefault(); load(q) }}
          className="flex max-w-md items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, location, builder…"
              aria-label="Search properties"
              className="pl-8"
            />
          </div>
          <button
            type="submit"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            Search
          </button>
        </form>

        {!loading && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-14 text-center">
            <Building2 className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              {q ? 'No properties match your search.' : 'No properties yet. Create your first one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.location}</TableCell>
                      <TableCell>{p.priceDisplay}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'Ready to Move' ? 'secondary' : 'outline'}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
      <CardFooter>
        <p className="text-sm text-muted-foreground" aria-live="polite">{items.length} properties</p>
      </CardFooter>
    </Card>
  )
}

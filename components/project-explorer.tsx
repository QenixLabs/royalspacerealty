'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BedDouble, Home, MapPin, RotateCcw, SearchX, SlidersHorizontal, Wallet } from 'lucide-react'
import type { Project } from '@/lib/projects'
import { AREAS, LISTING_TYPES, LISTING_TYPE_LABEL, toListingType, type ListingType } from '@/lib/listing'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectBadge } from '@/components/project-badge'
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from 'cn'

type ProjectExplorerProps = {
  projects: Project[]
}

const PAGE_SIZE = 6

const BUDGETS = [
  { value: 'all', label: 'Any Budget' },
  { value: '125', label: 'Up to ₹1.25 Cr' },
  { value: '175', label: 'Up to ₹1.75 Cr' },
  { value: '225', label: 'Up to ₹2.25 Cr' },
  { value: '275', label: 'Up to ₹2.75 Cr' },
  { value: '999', label: 'Above ₹2.75 Cr' },
]

const BUDGET_LABELS: Record<string, string> = Object.fromEntries(BUDGETS.map((b) => [b.value, b.label]))

function pageNumbers(page: number, total: number): (number | '…')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, 2, page - 1, page, page + 1, total - 1, total].filter((n) => n >= 1 && n <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…')
    out.push(sorted[i])
  }
  return out
}

export function ProjectExplorer({ projects }: ProjectExplorerProps) {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get('location') ?? ''
  const typeParam = toListingType(searchParams.get('type'))
  const [area, setArea] = useState(locationParam || 'all')
  const [avail, setAvail] = useState<ListingType | 'all'>(typeParam ?? 'all')
  const [bhk, setBhk] = useState('all')
  const [budget, setBudget] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setArea(locationParam || 'all')
  }, [locationParam])

  useEffect(() => {
    setAvail(typeParam ?? 'all')
  }, [typeParam])

  const areas = useMemo(
    () => AREAS.filter((a) => projects.some((p) => p.area === a)),
    [projects],
  )
  const bhkOptions = useMemo(
    () => [...new Set(projects.flatMap((p) => p.bhks))].sort((a, b) => a - b),
    [projects],
  )

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (area !== 'all') {
          const q = area.toLowerCase()
          if (p.area ? p.area.toLowerCase() !== q : !p.location.toLowerCase().includes(q)) return false
        }
        if (avail !== 'all' && p.listingType !== avail) return false
        if (bhk !== 'all' && !p.bhks.includes(parseFloat(bhk))) return false
        if (budget !== 'all') {
          const cap = parseFloat(budget)
          if (p.priceMinL === null) return false
          if (cap >= 999 ? p.priceMaxL! < 275 : p.priceMinL > cap) return false
        }
        return true
      }),
    [projects, area, avail, bhk, budget],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [area, avail, bhk, budget])

  useEffect(() => {
    document.getElementById('project-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [safePage])

  const reset = () => {
    setArea('all')
    setAvail('all')
    setBhk('all')
    setBudget('all')
    setPage(1)
  }

  const hasFilters = area !== 'all' || avail !== 'all' || bhk !== 'all' || budget !== 'all'

  return (
    <div>
      <div className="mb-10 border border-neutral-200 border-t-[3px] border-t-[var(--purple-700)] bg-white p-5 shadow-sm sm:p-6" role="search" aria-label="Filter projects">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-[var(--purple-700)] uppercase">
              <MapPin className="size-3.5" aria-hidden="true" /> Area
            </span>
            <Select value={area} onValueChange={(v) => v && setArea(v)}>
              <SelectTrigger
                className="h-11 w-full rounded-md border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition-colors hover:border-[var(--purple-700)]/60 focus-visible:border-[var(--purple-700)] focus-visible:ring-[var(--purple-700)]/20"
                aria-label="Filter by area"
              >
                <SelectValue placeholder="All Areas">
                  {(v: string) => (v === 'all' ? 'All Areas' : v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {area !== 'all' && !areas.includes(area as (typeof AREAS)[number]) && (
                  <SelectItem value={area}>Projects in {area}</SelectItem>
                )}
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-[var(--purple-700)] uppercase">
              <Home className="size-3.5" aria-hidden="true" /> Availability
            </span>
            <Select value={avail} onValueChange={(v) => v && setAvail(v as ListingType | 'all')}>
              <SelectTrigger
                className="h-11 w-full rounded-md border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition-colors hover:border-[var(--purple-700)]/60 focus-visible:border-[var(--purple-700)] focus-visible:ring-[var(--purple-700)]/20"
                aria-label="Filter by availability"
              >
                <SelectValue placeholder="Any Availability">
                  {(v: string) => (v === 'all' ? 'Any Availability' : LISTING_TYPE_LABEL[v as ListingType] ?? v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Availability</SelectItem>
                {LISTING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{LISTING_TYPE_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-[var(--purple-700)] uppercase">
              <BedDouble className="size-3.5" aria-hidden="true" /> BHK
            </span>
            <Select value={bhk} onValueChange={(v) => v && setBhk(v)}>
              <SelectTrigger
                className="h-11 w-full rounded-md border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition-colors hover:border-[var(--purple-700)]/60 focus-visible:border-[var(--purple-700)] focus-visible:ring-[var(--purple-700)]/20"
                aria-label="Filter by BHK"
              >
                <SelectValue placeholder="Any BHK">
                  {(v: string) => (v === 'all' ? 'Any BHK' : `${v} BHK`)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any BHK</SelectItem>
                {bhkOptions.map((b) => (
                  <SelectItem key={b} value={String(b)}>{b} BHK</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-[var(--purple-700)] uppercase">
              <Wallet className="size-3.5" aria-hidden="true" /> Budget
            </span>
            <Select value={budget} onValueChange={(v) => v && setBudget(v)}>
              <SelectTrigger
                className="h-11 w-full rounded-md border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition-colors hover:border-[var(--purple-700)]/60 focus-visible:border-[var(--purple-700)] focus-visible:ring-[var(--purple-700)]/20"
                aria-label="Filter by budget"
              >
                <SelectValue placeholder="Any Budget">
                  {(v: string) => BUDGET_LABELS[v] ?? 'Any Budget'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BUDGETS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Badge
              className="h-11 items-center gap-1.5 rounded-md border-0 bg-[image:var(--rs-grad)] px-4 text-sm font-bold tracking-wider whitespace-nowrap text-white uppercase shadow-sm"
              aria-live="polite"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              {filtered.length} of {projects.length}
            </Badge>
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-1.5 rounded-md border-0 bg-[image:var(--rs-grad)] px-4 text-sm font-bold tracking-wider whitespace-nowrap text-white uppercase shadow-sm transition-all duration-200 hover:bg-[image:var(--rs-grad-hover)] active:scale-[.97]"
                onClick={reset}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div id="project-results" className="scroll-mt-24">
        {filtered.length === 0 ? (
          <div className="rs-filter-empty">
            <SearchX size={32} aria-hidden="true" />
            <h3>No projects match your filters</h3>
            <p>Try widening the budget or choosing a different location.</p>
            <button type="button" className="rs-card-btn" onClick={reset}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="rs-project-grid">
              {visible.map((project) => (
                <article className="rs-card" key={project.slug}>
                  <div
                    className="rs-card-img"
                    style={{ backgroundImage: `url(${project.image})` }}
                    role="img"
                    aria-label={project.name}
                  >
                    <ProjectBadge listingType={project.listingType} />
                    <span className="rs-card-tag rs-card-tag-alt">
                      {project.category.toUpperCase()}
                    </span>
                    <span className="rs-card-price">{project.price}</span>
                  </div>
                  <div className="rs-card-body">
                    <h3>{project.name}</h3>
                    <p className="rs-card-location">
                      <MapPin size={14} aria-hidden="true" /> {project.location}
                    </p>
                    <div className="rs-card-specs">
                      <div>
                        <span>CARPET AREA</span>
                        <p>{project.carpetArea}</p>
                      </div>
                      <div>
                        <span>BEDROOM</span>
                        <p>{project.bedrooms}</p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/projects/${project.slug}`} className="rs-card-btn">
                    SEE DETAILS
                  </Link>
                </article>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination className={cn('mt-10')}>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                      aria-disabled={safePage === 1}
                      className={safePage === 1 ? 'pointer-events-none opacity-50' : undefined}
                    />
                  </PaginationItem>
                  {pageNumbers(safePage, totalPages).map((n, i) =>
                    n === '…' ? (
                      <PaginationItem key={`e${i}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={n}>
                        <PaginationLink
                          href="#"
                          isActive={n === safePage}
                          onClick={(e) => { e.preventDefault(); setPage(n) }}
                          aria-label={`Page ${n}`}
                        >
                          {n}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                      aria-disabled={safePage === totalPages}
                      className={safePage === totalPages ? 'pointer-events-none opacity-50' : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectExplorer

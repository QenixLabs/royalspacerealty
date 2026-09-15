'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, RotateCcw, SearchX } from 'lucide-react'
import type { Project } from '@/lib/projects'

type ProjectExplorerProps = {
  projects: Project[]
}

const BUDGETS = [
  { value: '0', label: 'Any Budget' },
  { value: '125', label: 'Up to ₹1.25 Cr' },
  { value: '175', label: 'Up to ₹1.75 Cr' },
  { value: '225', label: 'Up to ₹2.25 Cr' },
  { value: '275', label: 'Up to ₹2.75 Cr' },
  { value: '999', label: 'Above ₹2.75 Cr' },
]

export function ProjectExplorer({ projects }: ProjectExplorerProps) {
  const [location, setLocation] = useState('')
  const [bhk, setBhk] = useState('')
  const [budget, setBudget] = useState('')

  const locations = useMemo(
    () => [...new Set(projects.map((p) => p.location))].sort(),
    [projects],
  )
  const bhkOptions = useMemo(
    () => [...new Set(projects.flatMap((p) => p.bhks))].sort((a, b) => a - b),
    [projects],
  )

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (location && p.location !== location) return false
        if (bhk && !p.bhks.includes(parseFloat(bhk))) return false
        if (budget) {
          const cap = parseFloat(budget)
          if (p.priceMinL === null) return false
          if (cap >= 999 ? p.priceMaxL! < 275 : p.priceMinL > cap) return false
        }
        return true
      }),
    [projects, location, bhk, budget],
  )

  const reset = () => {
    setLocation('')
    setBhk('')
    setBudget('')
  }

  const hasFilters = location !== '' || bhk !== '' || budget !== ''

  return (
    <div>
      <div className="rs-filter-bar" role="search" aria-label="Filter projects">
        <label className="rs-filter-field">
          <span>Location</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="rs-filter-field">
          <span>BHK</span>
          <select value={bhk} onChange={(e) => setBhk(e.target.value)}>
            <option value="">Any BHK</option>
            {bhkOptions.map((b) => (
              <option key={b} value={String(b)}>{b} BHK</option>
            ))}
          </select>
        </label>
        <label className="rs-filter-field">
          <span>Budget</span>
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </label>
        <div className="rs-filter-meta">
          <p aria-live="polite">{filtered.length} of {projects.length} projects</p>
          {hasFilters && (
            <button type="button" className="rs-filter-reset" onClick={reset}>
              <RotateCcw size={13} aria-hidden="true" /> Reset
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rs-filter-empty">
          <SearchX size={32} aria-hidden="true" />
          <h3>No projects match your filters</h3>
          <p>Try widening the budget or choosing a different location.</p>
          <button type="button" className="rs-card-btn" onClick={reset}>Clear Filters</button>
        </div>
      ) : (
        <div className="rs-project-grid">
          {filtered.map((project) => (
            <article className="rs-card" key={project.slug}>
              <div
                className="rs-card-img"
                style={{ backgroundImage: `url(${project.image})` }}
                role="img"
                aria-label={project.name}
              >
                <span className="rs-card-tag">{project.category.toUpperCase()}</span>
                <span className="rs-card-price">{project.price}</span>
              </div>
              <div className="rs-card-body">
                <h3>{project.name}</h3>
                <p className="rs-card-location">
                  <MapPin size={14} aria-hidden="true" /> {project.location}
                </p>
                <div className="rs-card-specs">
                  <div>
                    <span>AREA</span>
                    <p>{project.area}</p>
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
      )}
    </div>
  )
}

export default ProjectExplorer

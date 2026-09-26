import { properties, propertyImages, AREAS, type Area, type ListingType, type Property } from './properties'
import { listPropertiesDB } from './properties-db'

export type Project = {
  slug: string
  name: string
  location: string
  area: Area | null
  price: string
  carpetArea: string
  bedrooms: string
  image: string
  category: 'Residential' | 'Commercial'
  listingType: ListingType
  featured: boolean
  bhks: number[]
  priceMinL: number | null
  priceMaxL: number | null
}

const parseCr = (s?: string): number | null => {
  if (!s) return null
  const m = s.replace(/,/g, '').match(/₹([\d.]+)\s*Cr/i)
  return m ? parseFloat(m[1]) : null
}

const parseBhks = (display: string): number[] =>
  display
    .split(',')
    .map((t) => parseFloat(t.trim()))
    .filter((n) => !Number.isNaN(n))

/** Falls back to a substring match so legacy rows without `area` still filter correctly. */
const toArea = (p: Property): Area | null => {
  if (p.area && (AREAS as readonly string[]).includes(p.area)) return p.area
  const loc = p.location.toLowerCase()
  return AREAS.find((a) => loc.includes(a.toLowerCase())) ?? null
}

const toProject = (p: Property, image: string, featured = false): Project => {
  const pricesCr = p.configurations
    .map((c) => parseCr(c.price))
    .filter((v): v is number => v !== null)
  const priceMinL = pricesCr.length ? Math.min(...pricesCr) * 100 : null
  const priceMaxL = pricesCr.length ? Math.max(...pricesCr) * 100 : null
  return {
    slug: p.slug,
    name: p.name,
    location: p.location,
    area: toArea(p),
    price: p.priceDisplay,
    carpetArea: p.areaDisplay,
    bedrooms: p.bhkDisplay,
    image,
    category: p.category,
    listingType: p.listingType ?? 'Under Construction',
    featured,
    bhks: parseBhks(p.bhkDisplay),
    priceMinL,
    priceMaxL,
  }
}

export const projects: Project[] = properties.map((p) =>
  toProject(p, propertyImages(p)[0]),
)

/** DB-first project list; falls back to static data when Mongo is unavailable. */
export async function listProjects(): Promise<Project[]> {
  try {
    const docs = await listPropertiesDB()
    return docs.map((d) => {
      const cover = d.images?.find((i) => i.cover) ?? d.images?.[0]
      return toProject(d as unknown as Property, cover?.secure_url ?? propertyImages(d as unknown as Property)[0], !!d.featured)
    })
  } catch {
    return projects
  }
}

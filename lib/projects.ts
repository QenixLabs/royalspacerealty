import { properties, propertyImages } from './properties'

export type Project = {
  slug: string
  name: string
  location: string
  price: string
  area: string
  bedrooms: string
  image: string
  category: 'Residential' | 'Commercial'
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

export const projects: Project[] = properties.map((p) => {
  const pricesCr = p.configurations
    .map((c) => parseCr(c.price))
    .filter((v): v is number => v !== null)
  const priceMinL = pricesCr.length ? Math.min(...pricesCr) * 100 : null
  const priceMaxL = pricesCr.length ? Math.max(...pricesCr) * 100 : null
  return {
    slug: p.slug,
    name: p.name,
    location: p.location,
    price: p.priceDisplay,
    area: p.areaDisplay,
    bedrooms: p.bhkDisplay,
    image: propertyImages(p)[0],
    category: p.category,
    bhks: parseBhks(p.bhkDisplay),
    priceMinL,
    priceMaxL,
  }
})

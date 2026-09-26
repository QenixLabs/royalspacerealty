export type ListingType = 'Under Construction' | 'Resale'

export const LISTING_TYPES: readonly ListingType[] = ['Under Construction', 'Resale'] as const

/** Wording the client sees, chosen to match the public badge exactly. */
export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  Resale: 'Ready to Move',
  'Under Construction': 'New Construction',
}

export const AREAS = ['Kandivali', 'Borivali', 'Malad', 'Goregaon'] as const

export type Area = (typeof AREAS)[number]

/** Accepts the short ?type= values used in the site menu. */
export function toListingType(param: string | null | undefined): ListingType | null {
  if (!param) return null
  const v = param.toLowerCase()
  if (v === 'resale' || v === 'ready' || v === 'ready-to-move') return 'Resale'
  if (v === 'new' || v === 'under-construction' || v === 'new-construction') return 'Under Construction'
  return null
}

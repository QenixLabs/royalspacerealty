import { cn } from 'cn'
import { LISTING_TYPE_LABEL, type ListingType } from '@/lib/listing'

const BADGE_STYLE: Record<ListingType, string> = {
  Resale: 'rs-card-tag-ready',
  'Under Construction': 'rs-card-tag-new',
}

export function ProjectBadge({
  listingType,
  className,
}: {
  listingType: ListingType
  className?: string
}) {
  const safe = BADGE_STYLE[listingType] ? listingType : 'Under Construction'
  return (
    <span className={cn('rs-card-tag', BADGE_STYLE[safe], className)}>
      {LISTING_TYPE_LABEL[safe].toUpperCase()}
    </span>
  )
}

export default ProjectBadge

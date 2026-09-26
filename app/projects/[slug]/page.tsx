import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarClock,
  Check,
  Landmark,
  MapPin,
  Ruler,
  ShieldCheck,
  TrainFront,
} from 'lucide-react'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import Reveal from '@/components/reveal'
import PropertyGallery from '@/components/property-gallery'
import PropertyEnquire from '@/components/property-enquire'
import { getPropertyDB, listPropertiesDB } from '@/lib/properties-db'
import { LISTING_TYPE_LABEL } from '@/lib/listing'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyDB(slug)
  if (!property) return { title: 'Property Not Found | Royal Space Realty' }
  return {
    title: `${property.name} — ${property.location} | Royal Space Realty`,
    description:
      property.tagline ??
      `${property.name} by ${property.builder}. ${property.configurations.length} configurations in ${property.location}.`,
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params
  const property = await getPropertyDB(slug)
  if (!property) notFound()

  const images = [...(property.images ?? [])]
    .sort((a, b) => Number(b.cover ?? false) - Number(a.cover ?? false))
    .map((i) => i.secure_url)
  const all = await listPropertiesDB()
  const idx = Math.max(0, all.findIndex((p) => p.slug === slug))
  const prevProperty = all[(idx - 1 + all.length) % all.length]
  const nextProperty = all[(idx + 1) % all.length]

  const listingType = property.listingType ?? 'Under Construction'

  const facts = [
    { icon: Building2, label: 'Developer', value: property.builder },
    { icon: MapPin, label: 'Location', value: property.location },
    { icon: BedDouble, label: 'Configurations', value: property.bhkDisplay },
    { icon: Ruler, label: 'Carpet Area', value: property.areaDisplay },
    { icon: Building2, label: 'Availability', value: LISTING_TYPE_LABEL[listingType] },
    ...(property.possession
      ? [{ icon: CalendarClock, label: 'Possession', value: property.possession }]
      : []),
    ...(property.status
      ? [{ icon: Check, label: 'Status note', value: property.status }]
      : []),
    ...(property.rera
      ? [{ icon: ShieldCheck as typeof Building2, label: 'MahaRERA', value: property.rera }]
      : []),
  ]

  return (
    <main className="rs-site">
      <SiteHeader />

      <section className="rs-detail-hero">
        <div className="rs-detail-hero-inner">
          <nav className="rs-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/projects">Projects</Link>
            <span>/</span>
            <span aria-current="page">{property.name}</span>
          </nav>
          <div className="rs-detail-title-row">
            <div>
              {property.tagline && <p className="rs-detail-tagline">{property.tagline}</p>}
              <h1>{property.name}</h1>
              <p className="rs-detail-loc">
                <MapPin size={15} /> {property.address}
              </p>
            </div>
            <div className="rs-detail-price">
              <span>STARTING AT</span>
              <strong>{property.priceDisplay}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="rs-detail-body">
        <div className="rs-detail-grid">
          <div className="rs-detail-main">
            <Reveal>
              <PropertyGallery images={images} alt={property.name} />
            </Reveal>

            <Reveal>
              <section className="rs-detail-section" aria-labelledby="overview">
                <h2 id="overview">Overview</h2>
                {property.overview.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </section>
            </Reveal>

            <Reveal>
              <section className="rs-detail-section" aria-labelledby="configurations">
                <h2 id="configurations">Configurations & Pricing</h2>
                <div className="rs-config-table" role="table" aria-label="Configurations">
                  <div className="rs-config-row is-head" role="row">
                    <span role="columnheader">Type</span>
                    <span role="columnheader">Carpet Area</span>
                    <span role="columnheader">Price</span>
                  </div>
                  {property.configurations.map((c, i) => (
                    <div className="rs-config-row" role="row" key={i}>
                      <span role="cell">{c.bhk}</span>
                      <span role="cell">{c.area}</span>
                      <span role="cell" className="is-price">
                        {c.price ?? 'On Request'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="rs-detail-section" aria-labelledby="amenities">
                <h2 id="amenities">Amenities</h2>
                <ul className="rs-amenity-grid">
                  {property.amenities.map((a, i) => (
                    <li key={a} style={{ '--stagger': `${i * 40}ms` } as React.CSSProperties}>
                      <Check size={15} aria-hidden="true" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section className="rs-detail-section" aria-labelledby="connectivity">
                <h2 id="connectivity">
                  <TrainFront size={20} aria-hidden="true" /> Connectivity
                </h2>
                <ul className="rs-connectivity-list">
                  {property.connectivity.map((c) => (
                    <li key={c}>
                      <MapPin size={14} aria-hidden="true" /> {c}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          </div>

          <aside className="rs-detail-aside">
            <Reveal delay={80}>
              <div className="rs-aside-card">
                <h3>Project Facts</h3>
                <ul>
                  {facts.map(({ icon: Icon, label, value }) => (
                    <li key={label}>
                      <Icon size={16} aria-hidden="true" />
                      <div>
                        <span>{label}</span>
                        <p>{value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {property.mapUrl && (
                  <a
                    className="rs-aside-map"
                    href={property.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Landmark size={15} aria-hidden="true" /> View on Google Maps
                  </a>
                )}
                <PropertyEnquire slug={property.slug} name={property.name} />
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <nav className="rs-detail-pager" aria-label="More properties">
        <Link href={`/projects/${prevProperty.slug}`}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>
            <small>Previous Project</small>
            {prevProperty.name}
          </span>
        </Link>
        <Link href={`/projects/${nextProperty.slug}`} className="is-next">
          <span>
            <small>Next Project</small>
            {nextProperty.name}
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </nav>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

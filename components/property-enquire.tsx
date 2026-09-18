'use client'
import { useState } from 'react'
import { Phone } from 'lucide-react'
import { ContactForm } from './contact-form'

export function PropertyEnquire({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="rs-aside-cta" aria-expanded={open} style={{ width: '100%', border: 0, cursor: 'pointer' }}>
        <Phone size={15} aria-hidden="true" /> Enquire Now
      </button>
      {open && (
        <div style={{ marginTop: 12 }} aria-label={`Enquire about ${name}`}>
          <ContactForm propertySlug={slug} />
        </div>
      )}
    </div>
  )
}
export default PropertyEnquire

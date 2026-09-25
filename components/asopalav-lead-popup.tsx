'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, MessageCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { POPUP_INTERVAL_MS } from '@/lib/lead-popup'

const WHATSAPP_URL = 'https://wa.link/b9joi2'
const PROJECT_SLUG = 'modirealty-asopalav-kandivali'

export function AsopalavLeadPopup() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      setOpen(false)
      return
    }

    const timer = window.setInterval(() => {
      setSubmitted(false)
      setError('')
      setOpen(true)
    }, POPUP_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [pathname])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: `+91 ${form.get('phone')}`,
          email: form.get('email'),
          intent: 'Buy',
          propertySlug: PROJECT_SLUG,
          message: 'Interested in Modirealty Asopalav, Kandivali West.',
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not send your enquiry.')

      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your enquiry. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rs-lead-popup" showCloseButton={false}>
        <button
          type="button"
          className="rs-lead-close"
          aria-label="Close enquiry form"
          onClick={() => handleOpenChange(false)}
        >
          <X aria-hidden="true" />
        </button>

        <header className="rs-lead-header">
          <DialogTitle className="rs-lead-lockup">
            <span className="rs-lead-the">The</span>
            <span className="rs-lead-developer">MODIREALTY</span>
            <span className="rs-lead-project">ASOPALAV</span>
            <span className="rs-lead-location">KANDIVALI</span>
          </DialogTitle>
          <DialogDescription className="rs-lead-description">
            Get price, floor plan &amp; exclusive offers
          </DialogDescription>
        </header>

        {submitted ? (
          <div className="rs-lead-success" aria-live="polite">
            <CheckCircle2 aria-hidden="true" />
            <h3>Enquiry received</h3>
            <p>Our property advisor will contact you shortly.</p>
            <button type="button" onClick={() => handleOpenChange(false)}>CLOSE</button>
          </div>
        ) : (
          <div className="rs-lead-body">
            <form className="rs-lead-form" onSubmit={handleSubmit}>
              <label>
                <span className="sr-only">Full name</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </label>
              <label>
                <span className="sr-only">Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address (optional)"
                  autoComplete="email"
                />
              </label>
              <label className="rs-lead-phone">
                <span className="sr-only">Mobile number</span>
                <span aria-hidden="true">+91</span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile number"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="Enter a valid 10-digit Indian mobile number"
                  required
                />
              </label>

              {error && <p className="rs-lead-error" role="alert">{error}</p>}

              <button type="submit" className="rs-lead-submit" disabled={loading}>
                {loading ? 'SENDING…' : 'GET PRICE & FLOOR PLAN'}
              </button>
            </form>

            <div className="rs-lead-divider" aria-hidden="true"><span>OR</span></div>

            <a
              className="rs-lead-whatsapp"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" />
              CONNECT ON WHATSAPP
            </a>
            <p className="rs-lead-privacy">We’ll only use your details to respond to this enquiry.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AsopalavLeadPopup

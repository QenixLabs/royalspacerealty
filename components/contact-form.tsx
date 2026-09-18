'use client'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function ContactForm({ propertySlug }: { propertySlug?: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'),
          intent: (fd.get('intent') as string) || 'Buy', message: fd.get('message'), propertySlug,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submit failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rs-form-success">
        <CheckCircle2 size={40} strokeWidth={1.4} />
        <h4>Thank you for reaching out.</h4>
        <p>Our team will contact you shortly.</p>
      </div>
    )
  }

  return (
    <form className="rs-contact-form" onSubmit={onSubmit}>
      <input name="name" required type="text" placeholder="Full Name*" aria-label="Full name" minLength={2} />
      <input name="phone" required type="tel" placeholder="Mobile Number*" aria-label="Mobile number" pattern="[+\d][\d\s-]{7,15}" />
      <input name="email" type="email" placeholder="Email Address" aria-label="Email address" />
      <select name="intent" defaultValue="Buy" aria-label="I am looking to">
        <option value="Buy">Buy a property</option>
        <option value="Sell">Sell a property</option>
        <option value="Rent">Rent / Lease</option>
        <option value="Submit">Submit my property</option>
      </select>
      <textarea name="message" placeholder="Your Message" rows={4} aria-label="Your message" />
      {error && <p role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
      <button type="submit" disabled={loading}>{loading ? 'SUBMITTING…' : 'SUBMIT NOW'}</button>
    </form>
  )
}
export default ContactForm

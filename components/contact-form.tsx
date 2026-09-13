'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

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
    <form className="rs-contact-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
      <input required type="text" placeholder="Full Name*" aria-label="Full name" />
      <input required type="tel" placeholder="Mobile Number*" aria-label="Mobile number" />
      <input type="email" placeholder="Email Address" aria-label="Email address" />
      <select defaultValue="" aria-label="I am looking to">
        <option value="" disabled>I am looking to...</option>
        <option>Buy a property</option>
        <option>Sell a property</option>
        <option>Rent / Lease</option>
        <option>Submit my property</option>
      </select>
      <textarea placeholder="Your Message" rows={4} aria-label="Your message" />
      <button type="submit">SUBMIT NOW</button>
    </form>
  )
}

export default ContactForm

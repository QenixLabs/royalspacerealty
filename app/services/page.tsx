import type { Metadata } from 'next'
import { Building2, HandCoins, Home, KeyRound } from 'lucide-react'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'

export const metadata: Metadata = {
  title: 'Services | Royal Space Realty',
  description: 'Buy, sell, rent and invest — full-service real estate consultancy in Mumbai.',
}

const services = [
  {
    icon: Home,
    title: 'Buy a Property',
    text: 'We shortlist properties that genuinely match your budget and lifestyle, arrange site visits, verify documents and negotiate on your behalf — right up to registration.',
    points: ['Curated shortlists', 'Site visit assistance', 'Document verification', 'Price negotiation'],
  },
  {
    icon: HandCoins,
    title: 'Sell a Property',
    text: 'From correct market pricing to genuine buyers and complete paperwork, we manage your sale end-to-end so you get the right value without the stress.',
    points: ['Market valuation', 'Listing & marketing', 'Buyer screening', 'Registration support'],
  },
  {
    icon: KeyRound,
    title: 'Rent / Lease',
    text: 'Verified rental homes and commercial spaces with transparent terms. We handle agreements, deposits and handover for both owners and tenants.',
    points: ['Verified listings', 'Agreement drafting', 'Deposit handling', 'Quick closures'],
  },
  {
    icon: Building2,
    title: 'New Projects & Advisory',
    text: 'Early access to under-construction and newly launched projects from reputed developers, plus honest advice on investment timing and location.',
    points: ['Pre-launch access', 'Builder deals', 'Investment advice', 'Portfolio planning'],
  },
]

const steps = [
  { num: '01', title: 'Tell Us Your Need', text: 'A short conversation about budget, location and timeline.' },
  { num: '02', title: 'We Shortlist', text: 'Hand-picked options with honest pros and cons.' },
  { num: '03', title: 'Visit & Verify', text: 'Accompanied site visits and full document checks.' },
  { num: '04', title: 'Close With Confidence', text: 'Negotiation, agreement and registration handled for you.' },
]

export default function ServicesPage() {
  return (
    <main className="rs-site">
      <SiteHeader />
      <InnerHero
        title="Our Services"
        crumb="Services"
        image="https://images.unsplash.com/photo-1560523159-4a9692d222f9?auto=format&fit=crop&w=1800&q=80"
      />

      <section className="rs-page-section">
        <Reveal>
          <h2 className="rs-section-title">WHAT WE DO</h2>
        </Reveal>
        <div className="rs-service-detail-grid">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={(index % 2) * 100}>
              <div className="rs-service-detail">
                <service.icon size={44} strokeWidth={1.3} />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <ul>
                    {service.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="rs-process">
        <Reveal>
          <h2 className="rs-section-title">HOW IT WORKS</h2>
        </Reveal>
        <div className="rs-process-grid">
          {steps.map((step, index) => (
            <Reveal key={step.num} delay={index * 90}>
              <div className="rs-process-step">
                <span>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

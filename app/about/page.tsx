import type { Metadata } from 'next'
import { Award, CheckCircle2, Users } from 'lucide-react'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'

export const metadata: Metadata = {
  title: 'About Us | Royal Space Realty',
  description: 'Royal Space Realty — a boutique real estate consultancy in Mumbai for residential and commercial properties.',
}

const stats = [
  { value: '12+', label: 'Years of Experience' },
  { value: '250+', label: 'Properties Sold' },
  { value: '250+', label: 'Happy Clients' },
  { value: '40+', label: 'Ongoing Projects' },
]

const points = [
  'Dedicated relationship manager for every client',
  'Verified listings with transparent pricing',
  'End-to-end support — site visits to registration',
  'Strong network of reputed builders across Mumbai',
  'Legal and home-loan assistance included',
  'Post-sale support and resale advisory',
]

export default function AboutPage() {
  return (
    <main className="rs-site">
      <SiteHeader />
      <InnerHero
        title="About Us"
        crumb="About Us"
        image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1800&q=80"
      />

      <section className="rs-page-section">
        <div className="rs-about-grid">
          <Reveal>
            <div>
              <p className="rs-kicker">WELCOME TO ROYAL SPACE REALTY</p>
              <h2>The Real Estate People</h2>
              <p>
                Manoj Suryavanshi is one of the leading Real Estate consultants. Established in 2014 by
                Mr. Manoj Suryavanshi, who has an experience of more than 12 years in this field, we have
                come a long way in the property dealing business — and as the market knows, we are purely
                &lsquo;The Real Estate People.&rsquo;
              </p>
              <p>
                We serve to buy, rent and sell property — be it residential, commercial or industrial. We
                look into second homes as well, and are channel partners with many reputed builders &amp;
                developers.
              </p>
              <p>
                We try to use the latest technologies along with our Indian values and morals, as we
                totally understand that a client&rsquo;s emotions are always involved in the properties
                they buy. Our motive is to keep clients stress-free and away from all the frantic legal
                work and documentation — so we provide not only the desired properties but also look after
                their legal work and documentation.
              </p>
              <p>At the end of it all, we desire a satisfied and content client.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div
              className="rs-about-img"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80)',
              }}
              role="img"
              aria-label="Royal Space Realty team meeting"
            />
          </Reveal>
        </div>
      </section>

      <section className="rs-stats">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 90}>
            <div className="rs-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="rs-page-section rs-why">
        <Reveal>
          <h2 className="rs-section-title">WHY CHOOSE US</h2>
        </Reveal>
        <div className="rs-why-grid">
          <Reveal>
            <div className="rs-why-intro">
              <Award size={40} strokeWidth={1.4} />
              <h3>A partner, not just a broker</h3>
              <p>
                We work on your side of the table — advising on pricing, negotiation and paperwork so you
                never feel alone in the process.
              </p>
              <div className="rs-why-team">
                <Users size={40} strokeWidth={1.4} />
                <p>Small, senior team. Every client handled personally.</p>
              </div>
            </div>
          </Reveal>
          <div className="rs-why-list">
            {points.map((point, index) => (
              <Reveal key={point} delay={index * 70}>
                <p className="rs-why-point">
                  <CheckCircle2 size={18} /> {point}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'
import { CheckCircle2, Eye, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: "Founder's Message | Royal Space Realty",
  description:
    "Our mission, vision, goals and values at Royal Space Realty — transparent guidance, verified property options and personalized service.",
}

const goals = [
  'To simplify the property buying, selling, and investment process.',
  'To connect clients with the best residential and commercial opportunities.',
  'To provide accurate market insights and expert consultation.',
  'To achieve the highest standards of customer satisfaction and service excellence.',
  'To build a strong network of trusted developers, investors, and homeowners.',
]

const values = [
  {
    title: 'Trust & Transparency',
    text: 'We believe in honest communication, clear information, and ethical business practices.',
  },
  {
    title: 'Customer First',
    text: 'Every decision we make is focused on creating value and satisfaction for our clients.',
  },
  {
    title: 'Integrity',
    text: 'We maintain the highest standards of professionalism and accountability in every transaction.',
  },
  {
    title: 'Excellence',
    text: 'We strive to deliver superior service, market expertise, and seamless real estate experiences.',
  },
  {
    title: 'Commitment',
    text: 'We are dedicated to supporting our clients at every step of their property journey.',
  },
  {
    title: 'Innovation',
    text: 'We continuously adopt modern technology and market strategies to provide better solutions and opportunities.',
  },
  {
    title: 'Long-Term Relationships',
    text: 'We focus on building lifelong partnerships based on trust, reliability, and mutual growth.',
  },
]

export default function FoundersMessagePage() {
  return (
    <main className="rs-site">
      <SiteHeader />
      <InnerHero
        title="Founder's Message"
        crumb="Founder's Message"
        image="/properties/tsaaya/01.jpg"
      />

      <section className="rs-page-section">
        <div className="rs-fm">
          <div className="rs-fm-grid">
            {/* Photo — sticky on desktop */}
            <Reveal>
              <div className="rs-fm-photo">
                <img
                  src="/founder.jpeg"
                  alt="Manoj Suryavanshi, Founder of Royal Space Realty"
                  loading="eager"
                  decoding="async"
                />
                <div className="rs-fm-photo-meta">
                  <p>Manoj Suryavanshi</p>
                  <span>Founder, Royal Space Realty</span>
                </div>
              </div>
            </Reveal>

            {/* Content */}
            <div className="rs-fm-content">
              {/* Mission + Vision side-by-side */}
              <div className="rs-fm-mv">
                <Reveal>
                  <div className="rs-fm-block rs-fm-block--mission">
                    <div className="rs-fm-block-head">
                      <Target size={18} aria-hidden="true" />
                      <h3>Our Mission</h3>
                    </div>
                    <p>
                      To help homebuyers and investors make confident real estate decisions by providing
                      transparent guidance, verified property options, and personalized service that creates
                      long-term value and trust.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={60}>
                  <div className="rs-fm-block rs-fm-block--vision">
                    <div className="rs-fm-block-head">
                      <Eye size={18} aria-hidden="true" />
                      <h3>Our Vision</h3>
                    </div>
                    <p>
                      To become the most trusted and customer-focused real estate advisory company, known
                      for delivering exceptional property solutions, ethical practices, and lasting
                      relationships across the real estate industry.
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Goals */}
              <Reveal delay={100}>
                <div className="rs-fm-block">
                  <div className="rs-fm-block-head">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <h3>Our Goals</h3>
                  </div>
                  <ul className="rs-fm-goals">
                    {goals.map((goal) => (
                      <li key={goal}>
                        <span className="rs-fm-goal-dot" aria-hidden="true" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Values */}
              <Reveal delay={160}>
                <div className="rs-fm-block">
                  <div className="rs-fm-block-head">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <h3>Our Values</h3>
                  </div>
                  <div className="rs-fm-values">
                    {values.map((v) => (
                      <div className="rs-fm-value" key={v.title}>
                        <h4>{v.title}</h4>
                        <p>{v.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'

export const metadata: Metadata = {
  title: "Founder's Message | Royal Space Realty",
  description:
    "A message from Manoj Suryavanshi, Founder of Royal Space Realty — on trust, transparency and putting every client's well-being first.",
}

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
        <Reveal>
          <div className="rs-founder">
            <div className="rs-founder-card">
              <div className="rs-founder-photo">
                <img
                  src="/founder.jpeg"
                  alt="Manoj Suryavanshi, Founder of Royal Space Realty"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="rs-founder-letter">
                <p>
                  At Royal Space Realty, we consider ourselves fortunate to serve customers who buy/sell
                  the biggest asset class — Real Estate. We understand that the quality of a house can
                  impact the overall well-being of your life like no other decision can. Indirectly, it
                  can be stated that we are in the well-being industry, because our customer&rsquo;s
                  well-being is directly impacted by our services.
                </p>
                <p>
                  Transparency, trust, expertise and credibility form the cornerstone of our services. A
                  new customer trusts us to deliver the best services, because we have consistently lived
                  up to our reputation. We can proudly say we have the expertise because we have been in
                  the business for a long time, and our customers count on us for every decision, big or
                  small. We are known for our credibility because our customers vouch for us and believe
                  in what we say, do or stand for.
                </p>
                <p>
                  At Royal Space Realty, we strive to ensure that the property decision is always in your
                  best interest.
                </p>
                <div className="rs-founder-sign">
                  <p>Thanking you,</p>
                  <div className="rs-founder-rule" aria-hidden="true" />
                  <p>Manoj Suryavanshi</p>
                  <span>Founder</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

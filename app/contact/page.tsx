import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'
import ContactForm from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us | Royal Space Realty',
  description: 'Get in touch with Royal Space Realty — real estate consultant in Kandivali West, Mumbai.',
}

export default function ContactPage() {
  return (
    <main className="rs-site">
      <SiteHeader />
      <InnerHero
        title="Contact Us"
        crumb="Contact Us"
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1800&q=80"
      />

      <section className="rs-page-section">
        <div className="rs-contact-grid">
          <Reveal>
            <div className="rs-contact-info">
              <h2>Get In Touch</h2>
              <p>Drop your details and Manoj Suryavanshi will call you back within a few hours.</p>
              <div className="rs-contact-item">
                <MapPin size={20} />
                <div>
                  <strong>Office</strong>
                  <p>
                    Shop No 5, Durga Mata Welfare Society, Salve Lane, New Link Road, Kandivali West, Mumbai,
                    Maharashtra 400067
                  </p>
                </div>
              </div>
              <div className="rs-contact-item">
                <Phone size={20} />
                <div>
                  <strong>Phone</strong>
                  <p>+91 9867915101</p>
                </div>
              </div>
              <div className="rs-contact-item">
                <Mail size={20} />
                <div>
                  <strong>Email</strong>
                  <p>manoj@royalspacerealty.in</p>
                </div>
              </div>
              <div className="rs-contact-item">
                <Clock size={20} />
                <div>
                  <strong>Maha RERA No.</strong>
                  <p>A518000018427</p>
                </div>
              </div>
              <div className="rs-contact-item">
                <Clock size={20} />
                <div>
                  <strong>Working Hours</strong>
                  <p>Mon – Sat, 10:00 AM – 7:00 PM</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rs-contact-form-wrap">
              <h3>Drop Your Number — We Will Call You</h3>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

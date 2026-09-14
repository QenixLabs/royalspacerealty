import Link from 'next/link'
import { socials } from './socials'

export function CtaStrip() {
  return (
    <section className="rs-cta-strip">
      <h2>Looking To Sell Or Rent Your Property?</h2>
      <Link href="/contact">SUBMIT NOW</Link>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="rs-footer">
      <div className="rs-footer-grid">
        <div>
          <img
            className="rs-footer-logo"
            src="/royalspacerealty_white.png"
            alt="Royal Space Realty"
            width={220}
            height={165}
          />
          <h4>CONTACT US</h4>
          <p>Get in touch with us</p>
          <p>
            Shop No 5, Durga Mata Welfare Society, Salve Lane, New Link Road, Kandivali West, Mumbai,
            Maharashtra 400067
          </p>
          <p>Email: manoj@royalspacerealty.in</p>
          <p>Phone: +91 9867915101</p>
          <p>Maha RERA No. A518000018427</p>
        </div>
        <div>
          <h4>LINKS</h4>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <a href="#">Terms and Conditions</a>
          <a href="#">Privacy</a>
        </div>
        <div>
          <h4>ABOUT US</h4>
          <p>
            Royal Space Realty is a trusted real estate consultant in Mumbai for residential and commercial
            properties. We take pride in providing elite services to our customers.
          </p>
          <div className="rs-footer-social">
            {socials.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label}>
                <social.icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="rs-disclaimer">
        <p>
          Disclaimer: Royal Space Realty is only an intermediary offering its platform to advertise
          properties of Seller for a Customer/Buyer/User coming on its Website and is not and cannot be a
          party to or privy to or control in any manner any transactions between the Seller and the
          Customer/Buyer/User. All the prices or rates on this Website have been extended by various
          Builder(s)/Developer(s) who have advertised their products.
        </p>
        <p>© 2026 Royal Space Realty. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default SiteFooter

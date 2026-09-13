'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Home,
  KeyRound,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Quote,
  Search,
  X,
} from 'lucide-react'

type IconProps = { size?: number }

const FacebookIcon = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.4H7.8V14h2.7v8h3z" />
  </svg>
)

const YoutubeIcon = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
  </svg>
)

const InstagramIcon = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const LinkedinIcon = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z" />
  </svg>
)

const projects = [
  {
    name: 'ROYAL CREST',
    location: 'Goregaon (West)',
    price: '₹ 2.61 Cr - ₹ 4.31 Cr',
    area: '746 Sq.Ft. - 1234 Sq.Ft.',
    bedrooms: '2, 3',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Windermere',
    location: 'Bhayandarpada',
    price: '₹ 1.15 Cr - ₹ 1.55 Cr',
    area: '548 Sq.Ft. - 758 Sq.Ft.',
    bedrooms: '1, 2',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'ROYAL VALORA',
    location: 'Bandra (East)',
    price: '₹ 5.97 Cr - ₹ 11.94 Cr',
    area: '1360 Sq.Ft. - 2737 Sq.Ft.',
    bedrooms: '3, 4, 5',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Shrisat One',
    location: 'Dindoshi-Goregaon (E)',
    price: '₹ 1.67 Cr - ₹ 4.26 Cr',
    area: '446 Sq.Ft. - 1210 Sq.Ft.',
    bedrooms: '1, 2, 3',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Osha One Borivali',
    location: 'Borivali (West)',
    price: '₹ 2.30 Cr - ₹ 3.07 Cr',
    area: '645 Sq.Ft. - 870 Sq.Ft.',
    bedrooms: '2, 3',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'BHOOMI AER',
    location: 'Borivali (West)',
    price: '₹ 4.04 Cr - ₹ 12.29 Cr',
    area: '1009 Sq.Ft. - 3073 Sq.Ft.',
    bedrooms: '2, 3, 5',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=80',
  },
]

const heroSlides = [
  {
    heading: "Don't Wait to Buy House,",
    sub: 'Buy House and Wait',
    image: '/royal-space-hero.png',
  },
  {
    heading: 'Find Your Dream Home',
    sub: 'In The Heart of Mumbai',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85',
  },
  {
    heading: 'Trusted Property Advisory',
    sub: 'Residential & Commercial',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
  },
]

const services = [
  {
    icon: Home,
    title: 'Buy a Property',
    text: 'Hand-picked residential and commercial properties across Mumbai, matched to your budget and lifestyle.',
  },
  {
    icon: HandCoins,
    title: 'Sell a Property',
    text: 'Right pricing, genuine buyers and complete support from listing to registration.',
  },
  {
    icon: KeyRound,
    title: 'Rent / Lease',
    text: 'Verified rental options for homes and offices, with transparent terms and quick closures.',
  },
  {
    icon: Building2,
    title: 'New Projects',
    text: 'Early access to under-construction and newly launched projects from reputed developers.',
  },
]

const testimonials = [
  {
    quote:
      'When we started looking for a house we had a set of very specific requirements in mind. Royal Space Realty really listened and helped us throughout the whole journey of selecting the property. We recommend them if you are serious about buying a property.',
    name: 'RASHMI SHAW',
  },
  {
    quote:
      'I want to thank the team for all of their time and efforts in helping us find our dream home. Their personal involvement during the meetings with builders and site visits made the whole process much easier.',
    name: 'MEHUL VAIDYA',
  },
  {
    quote:
      'Very thankful to the Royal Space Realty team. Good experience searching for my flat. My customised requirement was addressed and accordingly flats were suggested. I could feel positivity among the entire team.',
    name: 'HRISHIKESH PANDIT',
  },
]

const socials = [
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/919870222232' },
  { icon: Calculator, label: 'EMI Calculator', href: '#' },
  { icon: FacebookIcon, label: 'Facebook', href: '#' },
  { icon: YoutubeIcon, label: 'YouTube', href: '#' },
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: LinkedinIcon, label: 'LinkedIn', href: '#' },
]

export function RoyalSpaceHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const changeSlide = (direction: number) =>
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length)

  const changeTestimonial = (direction: number) =>
    setActiveTestimonial((current) => (current + direction + testimonials.length) % testimonials.length)

  const slide = heroSlides[activeSlide]
  const testimonial = testimonials[activeTestimonial]

  return (
    <main className="rs-site" id="home">
      {/* Top contact strip */}
      <div className="rs-topbar">
        <a href="https://wa.me/919870222232" target="_blank" rel="noreferrer">
          <MessageCircle size={14} /> Chat With Us
        </a>
        <a href="tel:+919870222232">
          <Phone size={14} /> +91-9870222232
        </a>
        <a href="mailto:info@royalspacerealty.com">
          <Mail size={14} /> info@royalspacerealty.com
        </a>
      </div>

      {/* Header */}
      <header className="rs-header">
        <a className="rs-brand" href="#home" aria-label="Royal Space Realty home">
          <span className="rs-brand-mark">
            <Home size={20} strokeWidth={1.8} />
          </span>
          <span className="rs-brand-text">
            <strong>ROYAL SPACE</strong>
            <small>REALTY</small>
          </span>
        </a>
        <nav className={menuOpen ? 'rs-nav rs-nav-open' : 'rs-nav'} aria-label="Primary navigation">
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
        </nav>
        <a className="rs-submit-btn" href="#contact">Submit Property</a>
        <button
          className="rs-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sticky social rail */}
      <aside className="rs-social-rail" aria-label="Social links">
        {socials.map((social) => (
          <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
            <social.icon size={17} />
          </a>
        ))}
      </aside>

      {/* Hero carousel */}
      <section className="rs-hero">
        {heroSlides.map((item, index) => (
          <div
            key={item.heading}
            className={index === activeSlide ? 'rs-hero-slide active' : 'rs-hero-slide'}
            style={{ backgroundImage: `url(${item.image})` }}
            role="img"
            aria-label={item.heading}
          />
        ))}
        <div className="rs-hero-overlay" />
        <div className="rs-hero-copy" key={activeSlide}>
          <h1>
            {slide.heading}
            <br />
            {slide.sub}
          </h1>
        </div>
        <button className="rs-hero-arrow prev" onClick={() => changeSlide(-1)} aria-label="Previous slide">
          <ChevronLeft size={22} />
        </button>
        <button className="rs-hero-arrow next" onClick={() => changeSlide(1)} aria-label="Next slide">
          <ChevronRight size={22} />
        </button>
      </section>

      {/* Search panel */}
      <section className="rs-search" aria-label="Search properties">
        <form onSubmit={(event) => event.preventDefault()}>
          <div className="rs-search-row">
            <select defaultValue="">
              <option value="" disabled>For Buy/Rent</option>
              <option>For Buy</option>
              <option>For Rent</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>Property Types</option>
              <option>Residential Apartment</option>
              <option>Commercial Office/Space</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>Location</option>
              <option>Andheri (West)</option>
              <option>Bandra (East)</option>
              <option>Borivali (West)</option>
              <option>Goregaon (West)</option>
              <option>Malad (West)</option>
              <option>Kandivali (East)</option>
              <option>Powai</option>
              <option>Thane (West)</option>
            </select>
          </div>
          <div className="rs-search-row">
            <select defaultValue="">
              <option value="" disabled>BHK</option>
              <option>1 BHK</option>
              <option>2 BHK</option>
              <option>3 BHK</option>
              <option>4 BHK</option>
              <option>5+ BHK</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>Min Budget</option>
              <option>₹ 50 Lac</option>
              <option>₹ 1 Cr</option>
              <option>₹ 2 Cr</option>
              <option>₹ 5 Cr</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>Max Budget</option>
              <option>₹ 1 Cr</option>
              <option>₹ 2 Cr</option>
              <option>₹ 5 Cr</option>
              <option>₹ 10 Cr+</option>
            </select>
          </div>
          <button type="submit" className="rs-search-btn">
            <Search size={16} /> SEARCH
          </button>
        </form>
      </section>

      {/* Featured projects */}
      <section className="rs-projects" id="projects">
        <h2 className="rs-section-title">FEATURED PROJECTS</h2>
        <div className="rs-project-grid">
          {projects.map((project) => (
            <article className="rs-card" key={project.name}>
              <div className="rs-card-img" style={{ backgroundImage: `url(${project.image})` }}>
                <span className="rs-card-tag">FEATURED</span>
                <span className="rs-card-price">{project.price}</span>
              </div>
              <div className="rs-card-body">
                <h3>{project.name}</h3>
                <p className="rs-card-location">
                  <MapPin size={14} /> {project.location}
                </p>
                <div className="rs-card-specs">
                  <div>
                    <span>AREA</span>
                    <p>{project.area}</p>
                  </div>
                  <div>
                    <span>BEDROOM</span>
                    <p>{project.bedrooms}</p>
                  </div>
                </div>
              </div>
              <a href="#contact" className="rs-card-btn">SEE DETAILS</a>
            </article>
          ))}
        </div>
      </section>

      {/* About / services */}
      <section className="rs-services" id="services">
        <div className="rs-services-head" id="about">
          <h2 className="rs-section-title">WHAT ARE YOU LOOKING FOR?</h2>
          <p>
            Being associated with the reputed names of the real estate industry, we take pride in providing
            elite services to our customers — whether you are buying, selling, renting or investing.
          </p>
        </div>
        <div className="rs-service-grid">
          {services.map((service) => (
            <div className="rs-service-card" key={service.title}>
              <service.icon size={38} strokeWidth={1.4} />
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <a href="#contact">READ MORE</a>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="rs-testimonials">
        <h2>Our Testimonial</h2>
        <div className="rs-testimonial-box" key={activeTestimonial}>
          <div className="rs-avatar" aria-hidden="true" />
          <blockquote>
            <Quote size={18} className="rs-quote-icon" />
            <p>{testimonial.quote}</p>
            <strong>{testimonial.name}</strong>
          </blockquote>
        </div>
        <div className="rs-testimonial-nav">
          <button onClick={() => changeTestimonial(-1)} aria-label="Previous testimonial">
            <ArrowLeft size={16} />
          </button>
          <button onClick={() => changeTestimonial(1)} aria-label="Next testimonial">
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* CTA strip */}
      <section className="rs-cta-strip">
        <h2>Looking To Sell Or Rent Your Property?</h2>
        <a href="#contact">SUBMIT NOW</a>
      </section>

      {/* Footer / contact */}
      <footer className="rs-footer" id="contact">
        <div className="rs-footer-grid">
          <div>
            <h4>CONTACT US</h4>
            <p>Get in touch with us</p>
            <p>
              Office No 1, Shatrunjaygiri Building, opp Crescent Horizon, Ashok Nagar, Kandivali East,
              Mumbai, Maharashtra 400101
            </p>
            <p>Email: info@royalspacerealty.com</p>
            <p>Phone: +91-9870222232</p>
          </div>
          <div>
            <h4>LINKS</h4>
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
            <a href="#services">Services</a>
            <a href="#projects">Projects</a>
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
    </main>
  )
}

export default RoyalSpaceHome

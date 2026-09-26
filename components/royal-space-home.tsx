'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Home,
  KeyRound,
  MapPin,
  Quote,
  Search,
} from 'lucide-react'
import Reveal from './reveal'
import SiteHeader from './site-header'
import SiteFooter, { CtaStrip } from './site-footer'
import { ProjectBadge } from './project-badge'
import type { Project } from '@/lib/projects'

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

export function RoyalSpaceHome({ featuredProjects }: { featuredProjects: Project[] }) {
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
      <SiteHeader />

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
        <Reveal>
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
        </Reveal>
      </section>

      {/* Featured projects */}
      <section className="rs-projects" id="projects">
        <Reveal>
          <h2 className="rs-section-title">FEATURED PROJECTS</h2>
        </Reveal>
        <div className="rs-project-grid">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.name} delay={(index % 3) * 90}>
              <article className="rs-card">
                <div className="rs-card-img" style={{ backgroundImage: `url(${project.image})` }} role="img" aria-label={project.name}>
                  <ProjectBadge listingType={project.listingType} />
                  <span className="rs-card-tag rs-card-tag-alt">FEATURED</span>
                  <span className="rs-card-price">{project.price}</span>
                </div>
                <div className="rs-card-body">
                  <h3>{project.name}</h3>
                  <p className="rs-card-location">
                    <MapPin size={14} /> {project.location}
                  </p>
                  <div className="rs-card-specs">
                    <div>
                      <span>CARPET AREA</span>
                      <p>{project.carpetArea}</p>
                    </div>
                    <div>
                      <span>BEDROOM</span>
                      <p>{project.bedrooms}</p>
                    </div>
                  </div>
                </div>
                <Link href={`/projects/${project.slug}`} className="rs-card-btn">SEE DETAILS</Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* About / services */}
      <section className="rs-services" id="services">
        <Reveal className="rs-services-head">
          <h2 className="rs-section-title">WHAT ARE YOU LOOKING FOR?</h2>
          <p>
            Being associated with the reputed names of the real estate industry, we take pride in providing
            elite services to our customers — whether you are buying, selling, renting or investing.
          </p>
        </Reveal>
        <div className="rs-service-grid">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 90}>
              <div className="rs-service-card">
                <service.icon size={38} strokeWidth={1.4} />
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <Link href="/services">READ MORE</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="rs-testimonials">
        <Reveal>
          <h2>Our Testimonial</h2>
        </Reveal>
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

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

export default RoyalSpaceHome

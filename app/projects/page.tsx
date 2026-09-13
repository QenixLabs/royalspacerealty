import type { Metadata } from 'next'
import { MapPin } from 'lucide-react'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projects | Royal Space Realty',
  description: 'Featured residential and commercial projects across Mumbai by Royal Space Realty.',
}

export default function ProjectsPage() {
  return (
    <main className="rs-site">
      <SiteHeader />
      <InnerHero
        title="Our Projects"
        crumb="Projects"
        image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=80"
      />

      <section className="rs-page-section">
        <Reveal>
          <h2 className="rs-section-title">ALL PROJECTS</h2>
        </Reveal>
        <div className="rs-project-grid">
          {projects.map((project, index) => (
            <Reveal key={project.name} delay={(index % 3) * 90}>
              <article className="rs-card">
                <div className="rs-card-img" style={{ backgroundImage: `url(${project.image})` }}>
                  <span className="rs-card-tag">{project.category.toUpperCase()}</span>
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
                <a href="/contact" className="rs-card-btn">SEE DETAILS</a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

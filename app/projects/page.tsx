import type { Metadata } from 'next'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'
import ProjectExplorer from '@/components/project-explorer'
import { projects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projects | Royal Space Realty',
  description: 'Explore 13 premium residential projects across Kandivali, Malad and Borivali by Royal Space Realty — brochures, configurations, amenities and pricing.',
}

export default function ProjectsPage() {
  return (
    <main className="rs-site">
      <SiteHeader />
      <InnerHero
        title="Our Projects"
        crumb="Projects"
        image="/properties/ocean-breeze/01.jpg"
      />

      <section className="rs-page-section">
        <Reveal>
          <h2 className="rs-section-title">FEATURED PROJECTS</h2>
        </Reveal>
        <Reveal delay={60}>
          <ProjectExplorer projects={projects} />
        </Reveal>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

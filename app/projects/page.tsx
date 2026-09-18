import type { Metadata } from 'next'
import { Suspense } from 'react'
import SiteHeader from '@/components/site-header'
import SiteFooter, { CtaStrip } from '@/components/site-footer'
import InnerHero from '@/components/inner-hero'
import Reveal from '@/components/reveal'
import ProjectExplorer from '@/components/project-explorer'
import { listProjects } from '@/lib/projects'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects | Royal Space Realty',
  description: 'Explore 13 premium residential projects across Kandivali, Malad and Borivali by Royal Space Realty — brochures, configurations, amenities and pricing.',
}

export default async function ProjectsPage() {
  const projects = await listProjects()
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
          <Suspense fallback={null}>
            <ProjectExplorer projects={projects} />
          </Suspense>
        </Reveal>
      </section>

      <CtaStrip />
      <SiteFooter />
    </main>
  )
}

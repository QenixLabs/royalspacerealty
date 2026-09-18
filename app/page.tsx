import RoyalSpaceHome from '@/components/royal-space-home'
import { listProjects } from '@/lib/projects'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const projects = await listProjects()
  const featured = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ].slice(0, 6)
  return <RoyalSpaceHome featuredProjects={featured} />
}

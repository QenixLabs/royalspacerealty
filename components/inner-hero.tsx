import Link from 'next/link'

type InnerHeroProps = {
  title: string
  crumb: string
  image: string
}

export function InnerHero({ title, crumb, image }: InnerHeroProps) {
  return (
    <section className="rs-inner-hero" style={{ backgroundImage: `url(${image})` }}>
      <div className="rs-inner-hero-overlay" />
      <div className="rs-inner-hero-copy">
        <h1>{title}</h1>
        <p>
          <Link href="/">Home</Link> <span>/</span> {crumb}
        </p>
      </div>
    </section>
  )
}

export default InnerHero

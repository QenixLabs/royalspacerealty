'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Mail, Menu, MessageCircle, Phone, X } from 'lucide-react'
import { socials } from './socials'

type NavChild = { href: string; label: string }
type NavLink = { href: string; label: string; children?: NavChild[] }

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  {
    href: '/about',
    label: 'About Us',
    children: [
      { href: '/about', label: 'About Us' },
      { href: '/founders-message', label: "Founder's Message" },
    ],
  },
  {
    href: '/projects',
    label: 'Projects',
    children: [
      { href: '/projects', label: 'All Projects' },
      { href: '/projects?location=Kandivali', label: 'Projects In Kandivali' },
      { href: '/projects?location=Borivali', label: 'Projects In Borivali' },
      { href: '/projects?location=Malad', label: 'Projects In Malad' },
      { href: '/projects?location=Goregaon', label: 'Projects In Goregaon' },
    ],
  },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact Us' },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const dropRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  useEffect(() => {
    setQuery(typeof window !== 'undefined' ? window.location.search : '')
  }, [pathname])

  useEffect(() => {
    const onPop = () => setQuery(window.location.search)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setOpenDrop(null)
  }, [pathname])

  useEffect(() => {
    if (!openDrop) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDrop(null)
    }
    const onClick = (e: MouseEvent) => {
      const el = dropRefs.current.get(openDrop)
      if (el && !el.contains(e.target as Node)) setOpenDrop(null)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [openDrop])

  const isActive = (link: NavLink) => {
    if (link.children) {
      return link.children.some((c) => {
        const base = c.href.split('?')[0]
        return pathname === base
      })
    }
    return pathname === link.href
  }

  const isChildActive = (childHref: string) => {
    const current = pathname + query
    if (current === childHref) return true
    if (childHref === '/projects' && pathname === '/projects' && !query.includes('location=')) return true
    return false
  }

  return (
    <>
      <div className="rs-topbar">
        <a href="https://wa.link/b9joi2" target="_blank" rel="noreferrer">
          <MessageCircle size={14} /> Chat With Us
        </a>
        <a href="tel:+919867915101">
          <Phone size={14} /> +91 9867915101
        </a>
        <a href="mailto:manoj@royalspacerealty.in">
          <Mail size={14} /> manoj@royalspacerealty.in
        </a>
      </div>

      <header className="rs-header">
        <Link className="rs-brand" href="/" aria-label="Royal Space Realty home">
          <img
            className="rs-brand-logo"
            src="/royalspacerealty_white.png"
            alt="Royal Space Realty"
            width={190}
            height={149}
          />
        </Link>
        <nav className={menuOpen ? 'rs-nav rs-nav-open' : 'rs-nav'} aria-label="Primary navigation">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="rs-nav-item"
                ref={(el) => {
                  dropRefs.current.set(link.label, el)
                }}
              >
                <button
                  type="button"
                  className={`rs-nav-parent ${isActive(link) ? 'active' : ''}`}
                  aria-expanded={openDrop === link.label}
                  aria-haspopup="true"
                  onClick={() => setOpenDrop((v) => (v === link.label ? null : link.label))}
                >
                  {link.label}
                  <ChevronDown size={14} aria-hidden="true" className={openDrop === link.label ? 'is-open' : ''} />
                </button>
                <div className={openDrop === link.label ? 'rs-nav-drop rs-nav-drop-open' : 'rs-nav-drop'} role="menu">
                  {link.children.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      role="menuitem"
                      className={isChildActive(child.href) ? 'active' : ''}
                      onClick={() => {
                        setOpenDrop(null)
                        setMenuOpen(false)
                        const q = child.href.includes('?') ? child.href.slice(child.href.indexOf('?')) : ''
                        setQuery(q)
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <Link className="rs-submit-btn" href="/contact">Submit Property</Link>
        <button
          className="rs-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside className="rs-social-rail" aria-label="Social links">
        {socials.map((social) => (
          <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
            <social.icon size={17} />
          </a>
        ))}
      </aside>
    </>
  )
}

export default SiteHeader

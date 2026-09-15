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
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact Us' },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const pathname = usePathname()
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setDropOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!dropOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [dropOpen])

  const isActive = (link: NavLink) =>
    link.children ? link.children.some((c) => c.href === pathname) : pathname === link.href

  return (
    <>
      <div className="rs-topbar">
        <a href="https://wa.me/919867915101" target="_blank" rel="noreferrer">
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
                ref={dropRef}
              >
                <button
                  type="button"
                  className={`rs-nav-parent ${isActive(link) ? 'active' : ''}`}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                  onClick={() => setDropOpen((v) => !v)}
                >
                  {link.label}
                  <ChevronDown size={14} aria-hidden="true" className={dropOpen ? 'is-open' : ''} />
                </button>
                <div className={dropOpen ? 'rs-nav-drop rs-nav-drop-open' : 'rs-nav-drop'} role="menu">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      role="menuitem"
                      className={pathname === child.href ? 'active' : ''}
                      onClick={() => {
                        setDropOpen(false)
                        setMenuOpen(false)
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

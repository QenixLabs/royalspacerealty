'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mail, Menu, MessageCircle, Phone, X } from 'lucide-react'
import { socials } from './socials'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact Us' },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
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

      <header className="rs-header">
        <Link className="rs-brand" href="/" aria-label="Royal Space Realty home">
          <span className="rs-brand-mark">
            <Home size={20} strokeWidth={1.8} />
          </span>
          <span className="rs-brand-text">
            <strong>ROYAL SPACE</strong>
            <small>REALTY</small>
          </span>
        </Link>
        <nav className={menuOpen ? 'rs-nav rs-nav-open' : 'rs-nav'} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
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

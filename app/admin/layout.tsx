'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Building2, Eye, Inbox, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { cn } from 'cn'

const NAV = [
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
]

function NavLinks({ pathname, onNavigate, className }: { pathname: string; onNavigate?: () => void; className?: string }) {
  return (
    <nav className={cn('flex flex-col gap-1', className)} aria-label="Admin navigation">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white',
              active && 'bg-white/15 text-white',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Eye className="size-4" aria-hidden="true" />
        View site
      </Link>
    </nav>
  )
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/api/admin/logout" method="post" className={className}>
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start text-white/75 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Logout
      </Button>
    </form>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside
        aria-label="Admin sidebar"
        className="hidden w-64 shrink-0 flex-col gap-6 p-4 text-white md:flex"
        style={{ background: 'var(--rs-grad)' }}
      >
        <Link
          href="/admin/properties"
          className="flex min-h-11 items-center rounded-lg px-3 text-base font-bold tracking-tight text-white"
        >
          Royal Space · Admin
        </Link>
        <NavLinks pathname={pathname} className="flex-1" />
        <LogoutButton />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden">
        <header
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ background: 'var(--rs-grad)' }}
        >
          <Link href="/admin/properties" className="text-base font-bold tracking-tight text-white">
            Royal Space · Admin
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </Button>
        </header>
        {menuOpen && (
          <div className="flex flex-col gap-4 border-b border-white/10 p-4" style={{ background: 'var(--purple-950)' }}>
            <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <LogoutButton />
          </div>
        )}
      </div>

      <main className="w-full flex-1 bg-neutral-50">
        <div className="rs-admin mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </main>
      <Toaster />
    </div>
  )
}

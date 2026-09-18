import Link from 'next/link'
import { Building2, Inbox, LogOut, Eye } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rs-admin">
      <aside className="rs-admin-side" aria-label="Admin navigation">
        <Link href="/admin/properties" className="rs-admin-brand">Royal Space · Admin</Link>
        <nav>
          <Link href="/admin/properties"><Building2 size={16} /> Properties</Link>
          <Link href="/admin/inquiries"><Inbox size={16} /> Inquiries</Link>
          <Link href="/" target="_blank"><Eye size={16} /> View site</Link>
        </nav>
        <form action="/api/admin/logout" method="post"><button type="submit"><LogOut size={16} /> Logout</button></form>
      </aside>
      <div className="rs-admin-main">{children}</div>
    </div>
  )
}

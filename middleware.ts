import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') return NextResponse.next()
  const token = req.cookies.get('rs_admin')?.value
  const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET ?? '')
  try {
    await jwtVerify(token ?? '', secret)
    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
}

export const config = { matcher: ['/admin/:path*'] }

import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_MAX_AGE, loginRateLimited, passwordOk, signAdminToken } from '@/lib/auth'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local'
  if (loginRateLimited(ip)) return NextResponse.json({ error: 'Too many attempts. Try later.' }, { status: 429 })
  const { password } = (await req.json().catch(() => ({}))) as { password?: string }
  if (!passwordOk(password ?? '')) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: ADMIN_MAX_AGE })
  return res
}

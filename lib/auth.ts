import { SignJWT, jwtVerify } from 'jose'
import crypto from 'node:crypto'

export const ADMIN_COOKIE = 'rs_admin'
export const ADMIN_MAX_AGE = 60 * 60 * 12

const secret = () => new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET ?? '')

export async function signAdminToken() {
  if ((process.env.ADMIN_SESSION_SECRET ?? '').length < 32)
    throw new Error('ADMIN_SESSION_SECRET too short')
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE}s`)
    .sign(secret())
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret())
  return payload.role === 'admin'
}

export function passwordOk(input: string) {
  const a = Buffer.from(input ?? '')
  const b = Buffer.from(process.env.ADMIN_PASSWORD ?? '')
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)
}

const hits = new Map<string, { n: number; t: number }>()
export function loginRateLimited(ip: string) {
  const now = Date.now()
  const h = hits.get(ip) ?? { n: 0, t: now }
  if (now - h.t > 10 * 60 * 1000) return (hits.set(ip, { n: 1, t: now }), false)
  h.n += 1
  hits.set(ip, h)
  return h.n > 5
}

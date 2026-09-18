import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { PropertyModel } from '@/models/Property'

async function authed() {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  return !!t && (await verifyAdminToken(t).catch(() => false))
}

export async function GET(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const q = new URL(req.url).searchParams.get('q')?.toLowerCase() ?? ''
  const docs = await PropertyModel.find({}).sort({ updatedAt: -1 }).lean()
  const filtered = q ? docs.filter((d: Record<string, unknown>) => `${d.name} ${d.location} ${d.builder}`.toLowerCase().includes(q)) : docs
  return NextResponse.json({ items: filtered })
}

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json()
  if (!b.slug || !b.name || !b.location) return NextResponse.json({ error: 'slug, name, location required.' }, { status: 400 })
  await dbConnect()
  const doc = await PropertyModel.create(b)
  return NextResponse.json({ ok: true, id: String(doc._id) })
}

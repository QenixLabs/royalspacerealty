import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { PropertyModel } from '@/models/Property'

async function authed() {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  return !!t && (await verifyAdminToken(t).catch(() => false))
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  const doc = await PropertyModel.findByIdAndUpdate(id, await req.json(), { new: true }).lean()
  if (!doc) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  await PropertyModel.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}

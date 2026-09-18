import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { InquiryModel } from '@/models/Inquiry'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!t || !(await verifyAdminToken(t).catch(() => false))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await dbConnect()
  await InquiryModel.findByIdAndUpdate(id, await req.json())
  return NextResponse.json({ ok: true })
}

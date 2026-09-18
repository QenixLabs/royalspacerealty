import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { InquiryModel } from '@/models/Inquiry'

export async function GET(req: Request) {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!t || !(await verifyAdminToken(t).catch(() => false))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const sp = new URL(req.url).searchParams
  const filter: Record<string, string> = {}
  if (sp.get('status')) filter.status = sp.get('status')!
  if (sp.get('source')) filter.source = sp.get('source')!
  const items = await InquiryModel.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  const newCount = await InquiryModel.countDocuments({ status: 'new' })
  return NextResponse.json({ items, newCount })
}

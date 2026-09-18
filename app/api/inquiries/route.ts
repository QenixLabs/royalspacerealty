import { NextResponse } from 'next/server'
import { dbConnect, dbReady } from '@/lib/db'
import { InquiryModel } from '@/models/Inquiry'

const phoneRe = /^[+\d][\d\s-]{7,15}$/

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>
  const name = (b.name ?? '').trim()
  const phone = (b.phone ?? '').trim()
  const intent = ['Buy', 'Sell', 'Rent', 'Submit'].includes(b.intent) ? b.intent : 'Buy'
  if (name.length < 2) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 })
  if (!phoneRe.test(phone)) return NextResponse.json({ error: 'Enter a valid mobile number.' }, { status: 400 })
  if (!dbReady()) return NextResponse.json({ ok: true, queued: false })
  await dbConnect()
  const doc = await InquiryModel.create({
    name, phone, email: b.email ?? '', intent,
    message: b.message ?? '', propertySlug: b.propertySlug ?? undefined,
    source: b.propertySlug ? 'property-cta' : 'contact',
  })
  return NextResponse.json({ ok: true, id: String(doc._id) })
}

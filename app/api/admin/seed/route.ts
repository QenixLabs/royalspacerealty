import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE } from '@/lib/auth'
import { verifyAdminToken } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { PropertyModel } from '@/models/Property'
import { properties, propertyImages } from '@/lib/properties'

export async function POST() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token || !(await verifyAdminToken(token).catch(() => false)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  let upserted = 0
  for (const p of properties) {
    const images = propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 }))
    await PropertyModel.updateOne({ slug: p.slug }, { $setOnInsert: { ...p, images } }, { upsert: true })
    upserted += 1
  }
  return NextResponse.json({ ok: true, upserted })
}

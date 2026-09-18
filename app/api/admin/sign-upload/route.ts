import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  const t = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!t || !(await verifyAdminToken(t).catch(() => false)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { folder } = (await req.json().catch(() => ({}))) as { folder?: string }
  const timestamp = Math.round(Date.now() / 1000)
  const safeFolder = `royal-space/${(folder ?? 'general').replace(/[^a-z0-9-]/gi, '')}`
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder: safeFolder }, process.env.CLOUDINARY_API_SECRET ?? '')
  return NextResponse.json({ signature, timestamp, folder: safeFolder, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME })
}

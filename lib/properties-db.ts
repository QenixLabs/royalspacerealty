import { dbConnect, dbReady } from './db'
import { PropertyModel } from '@/models/Property'
import { properties as statics, getProperty, propertyImages, type Property } from './properties'

export type DbProperty = Property & { _id: string; featured?: boolean; images: { public_id: string; secure_url: string; cover?: boolean }[] }

export async function listPropertiesDB(): Promise<DbProperty[]> {
  if (!dbReady()) return statics.map((p) => ({ ...p, _id: p.slug, images: propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 })) }))
  await dbConnect()
  const docs = await PropertyModel.find({}).sort({ updatedAt: -1 }).lean()
  if (!docs.length) return statics.map((p) => ({ ...p, _id: p.slug, images: propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 })) }))
  return docs.map((d: Record<string, unknown>) => ({ ...(d as object), _id: String((d as { _id: unknown })._id) }) as DbProperty)
}

export async function getPropertyDB(slug: string): Promise<DbProperty | null> {
  if (dbReady()) {
    await dbConnect()
    const doc = await PropertyModel.findOne({ slug }).lean()
    if (doc) return { ...(doc as object), _id: String((doc as { _id: unknown })._id) } as DbProperty
  }
  const p = getProperty(slug)
  if (!p) return null
  return { ...p, _id: p.slug, images: propertyImages(p).map((u, i) => ({ public_id: `legacy/${p.slug}/${i}`, secure_url: u, cover: i === 0 })) }
}

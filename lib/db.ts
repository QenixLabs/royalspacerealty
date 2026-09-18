import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI ?? ''
let cached = (global as unknown as { __rsMongoose?: Promise<typeof mongoose> }).__rsMongoose

export function dbReady() {
  return uri.length > 10
}

export async function dbConnect() {
  if (!dbReady()) throw new Error('MONGODB_URI missing')
  if (!cached) {
    cached = mongoose.connect(uri, { maxPoolSize: 5 })
    ;(global as unknown as { __rsMongoose?: Promise<typeof mongoose> }).__rsMongoose = cached
  }
  return cached
}

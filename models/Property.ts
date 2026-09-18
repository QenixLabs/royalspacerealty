import { Schema, model, models } from 'mongoose'

const Config = new Schema(
  { bhk: { type: String, required: true }, area: { type: String, required: true }, price: String },
  { _id: false },
)
const Img = new Schema(
  { public_id: { type: String, required: true }, secure_url: { type: String, required: true }, cover: Boolean },
  { _id: false },
)

const PropertySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    builder: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    rera: String,
    status: { type: String, required: true },
    possession: String,
    tagline: String,
    overview: { type: [String], default: [] },
    configurations: { type: [Config], default: [] },
    amenities: { type: [String], default: [] },
    connectivity: { type: [String], default: [] },
    priceDisplay: { type: String, required: true },
    areaDisplay: { type: String, required: true },
    bhkDisplay: { type: String, required: true },
    category: { type: String, enum: ['Residential', 'Commercial'], default: 'Residential' },
    mapUrl: String,
    images: { type: [Img], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const PropertyModel = models.Property ?? model('Property', PropertySchema)

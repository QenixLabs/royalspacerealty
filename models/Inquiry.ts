import { Schema, model, models } from 'mongoose'

const InquirySchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    intent: { type: String, enum: ['Buy', 'Sell', 'Rent', 'Submit', 'Other'], default: 'Buy' },
    message: String,
    propertySlug: { type: String, index: true },
    source: { type: String, enum: ['contact', 'property-cta'], required: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
    notes: String,
  },
  { timestamps: true },
)

export const InquiryModel = models.Inquiry ?? model('Inquiry', InquirySchema)

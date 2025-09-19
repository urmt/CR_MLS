import mongoose, { Document } from 'mongoose'

export interface IProperty extends Document {
  title: string
  description: string
  price: number
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  propertyType: 'house' | 'apartment' | 'land' | 'commercial'
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  agent: mongoose.Types.ObjectId
  isFeatured: boolean
}

const propertySchema = new mongoose.Schema<IProperty>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  propertyType: { type: String, enum: ['house', 'apartment', 'land', 'commercial'], required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  images: [{ type: String }],
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true })

export const Property = mongoose.model<IProperty>('Property', propertySchema)

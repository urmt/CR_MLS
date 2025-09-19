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
  contact: {
    name: string
    email: string
    phone: string
  }
  accessList: string[] // List of payer emails who purchased access
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
  contact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  accessList: [{ type: String }] // Store payer emails
}, { timestamps: true })

export const Property = mongoose.model<IProperty>('Property', propertySchema)

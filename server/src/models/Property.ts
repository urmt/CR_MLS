import mongoose, { Document } from 'mongoose'

export interface IProperty extends Document {
  // ... existing fields ...
  legalDetails: {
    folioReal: string // National Registry ID
    waterConcession: boolean
    concessionType: 'beach' | 'navigable' | 'none'
    surveyPlan: string // URL to survey document
    zoning: string
    municipalPermits: boolean
    registered: boolean
    boundariesVerified: boolean
  }
}

const propertySchema = new mongoose.Schema<IProperty>({
  // ... existing schema ...
  legalDetails: {
    folioReal: { type: String, required: true },
    waterConcession: { type: Boolean, default: false },
    concessionType: { 
      type: String, 
      enum: ['beach', 'navigable', 'none'], 
      default: 'none' 
    },
    surveyPlan: { type: String }, // URL to document
    zoning: { type: String },
    municipalPermits: { type: Boolean, default: false },
    registered: { type: Boolean, default: false },
    boundariesVerified: { type: Boolean, default: false }
  }
}, { timestamps: true })

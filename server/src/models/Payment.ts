import mongoose, { Document } from 'mongoose'

export interface IPayment extends Document {
  propertyId: mongoose.Types.ObjectId
  payerEmail: string
  amount: number
  transactionId: string
}

const paymentSchema = new mongoose.Schema<IPayment>({
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  payerEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true, unique: true }
}, { timestamps: true })

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema)

import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'agent' | 'admin'
  refreshToken?: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['agent', 'admin'], default: 'agent' },
  refreshToken: { type: String }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)

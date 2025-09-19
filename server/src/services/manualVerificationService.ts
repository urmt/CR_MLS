import { Property } from '../models/Property'
import { sendEmail } from './emailService' // You'll need to implement this

export const initiateManualVerification = async (propertyId: string) => {
  const property = await Property.findById(propertyId)
  if (!property) return
  
  // Send verification request to municipal office
  await sendEmail({
    to: 'verificaciones@registronacional.go.cr',
    subject: `Verificación Manual - Folio Real: ${property.legalDetails.folioReal}`,
    text: `Solicitamos verificación manual para la propiedad:
           Folio Real: ${property.legalDetails.folioReal}
           Ubicación: ${property.location}`
  })
  
  // Update property status
  await Property.findByIdAndUpdate(propertyId, {
    'legalDetails.verificationStatus': 'pending'
  })
}

export const completeManualVerification = async (propertyId: string, verified: boolean) => {
  await Property.findByIdAndUpdate(propertyId, {
    'legalDetails.verificationStatus': verified ? 'verified' : 'rejected',
    'legalDetails.lastVerified': new Date()
  })
}

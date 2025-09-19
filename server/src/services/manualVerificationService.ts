import { Property } from '../models/Property'
import { sendVerificationRequest } from './emailService'

export const initiateManualVerification = async (propertyId: string) => {
  const property = await Property.findById(propertyId)
  if (!property) return
  
  // Send verification request to municipal office
  await sendVerificationRequest({
    to: `${property.location.toLowerCase().replace(/\s+/g, '')}@municipalidad.go.cr`,
    subject: `Verificación de Permisos - Folio Real: ${property.legalDetails.folioReal}`,
    text: `Por favor verifique los permisos municipales para la propiedad con Folio Real: ${property.legalDetails.folioReal}`
  })
  
  // Update property status
  property.verificationStatus = 'pending'
  await property.save()
}

export const completeManualVerification = async (propertyId: string, verified: boolean) => {
  await Property.findByIdAndUpdate(propertyId, {
    verificationStatus: verified ? 'verified' : 'rejected',
    lastVerified: new Date()
  })
}

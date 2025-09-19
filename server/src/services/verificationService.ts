import axios from 'axios'
import { Property } from '../models/Property'

// Verify Folio Real with Costa Rica National Registry
export const verifyFolioReal = async (folioReal: string) => {
  try {
    // This would be a real API call in production
    // For demo purposes, we'll simulate verification
    const response = await axios.get(`https://api.registronacional.go.cr/folio/${folioReal}`)
    return response.data.valid
  } catch (error) {
    console.error('Folio Real verification error:', error)
    return false
  }
}

// Check if property meets all legal requirements
export const checkLegalCompliance = async (property: any) => {
  const requirements = {
    folioRealValid: await verifyFolioReal(property.legalDetails.folioReal),
    hasWaterConcession: property.legalDetails.waterConcession,
    concessionTypeValid: property.legalDetails.concessionType !== 'none' 
      ? property.legalDetails.concessionType === 'beach' || property.legalDetails.concessionType === 'navigable'
      : true,
    boundariesVerified: property.legalDetails.boundariesVerified,
    municipalPermits: property.legalDetails.municipalPermits,
    registered: property.legalDetails.registered
  }

  const compliant = Object.values(requirements).every(Boolean)
  
  return {
    compliant,
    requirements
  }
}

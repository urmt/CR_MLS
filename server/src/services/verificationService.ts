import axios from 'axios'
import { Property } from '../models/Property'
import { config } from '../config'
import { initiateManualVerification } from './manualVerificationService'

// Real Folio Real verification
export const verifyFolioReal = async (folioReal: string): Promise<boolean> => {
  try {
    // Real API call to Registro Nacional
    const response = await axios.get(
      `https://api.registronacional.go.cr/propiedades/${folioReal}`,
      {
        headers: {
          'Authorization': `Bearer ${config.registroNacionalApiKey}`
        }
      }
    )
    
    return response.data.status === 'active'
  } catch (error) {
    console.error('Folio Real verification failed:', error)
    return false
  }
}

// Main verification function with fallback
export const checkLegalCompliance = async (property: any) => {
  try {
    // Try automatic verification first
    const folioRealValid = await verifyFolioReal(property.legalDetails.folioReal)
    
    // If automatic verification fails, initiate manual process
    if (!folioRealValid && property.legalDetails.verificationStatus !== 'pending') {
      await initiateManualVerification(property._id)
    }
    
    // Return current status
    return {
      compliant: property.legalDetails.verificationStatus === 'verified',
      requirements: {
        folioRealValid,
        verificationStatus: property.legalDetails.verificationStatus
      }
    }
  } catch (error) {
    console.error('Verification error:', error)
    return {
      compliant: false,
      requirements: {}
    }
  }
}

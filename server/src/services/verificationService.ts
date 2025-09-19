import axios from 'axios'
import { Property } from '../models/Property'
import { config } from '../config'

// Real implementation using Costa Rica's National Registry API
export const verifyFolioReal = async (folioReal: string) => {
  try {
    const response = await axios.post(
      'https://api.registronacional.go.cr/consulta-folio-real',
      {
        folio_real: folioReal
      },
      {
        headers: {
          'Authorization': `Bearer ${config.registroNacionalApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.data.estado === 'REGISTRADO' && 
           response.data.vigente === true
  } catch (error) {
    console.error('Folio Real verification error:', error)
    return false
  }
}

// Verify water concession with MINAE
export const verifyWaterConcession = async (concessionType: string, folioReal: string) => {
  if (concessionType === 'none') return true
  
  try {
    const response = await axios.get(
      `https://api.minae.go.cr/concesiones-agua?folio_real=${folioReal}&tipo=${concessionType}`,
      {
        headers: {
          'X-API-Key': config.minaeApiKey
        }
      }
    )
    
    return response.data.activa === true
  } catch (error) {
    console.error('Water concession verification error:', error)
    return false
  }
}

// Verify municipal permits
export const verifyMunicipalPermits = async (municipality: string, folioReal: string) => {
  try {
    // Determine municipality code (this would be a helper function)
    const municipalityCode = getMunicipalityCode(municipality)
    
    const response = await axios.get(
      `https://api.municipalidades.go.cr/permisos?municipio=${municipalityCode}&folio_real=${folioReal}`,
      {
        headers: {
          'Authorization': `Basic ${config.municipalApiToken}`
        }
      }
    )
    
    return response.data.permisos_vigentes > 0
  } catch (error) {
    console.error('Municipal permits verification error:', error)
    return false
  }
}

// Main verification function
export const checkLegalCompliance = async (property: any) => {
  // Verify Folio Real
  const folioRealValid = await verifyFolioReal(property.legalDetails.folioReal)
  
  // Verify water concession
  const waterConcessionValid = property.legalDetails.waterConcession
    ? await verifyWaterConcession(property.legalDetails.concessionType, property.legalDetails.folioReal)
    : true
  
  // Verify municipal permits
  const municipalPermitsValid = property.legalDetails.municipalPermits
    ? await verifyMunicipalPermits(property.location, property.legalDetails.folioReal)
    : true
  
  // Other verifications that don't require API calls
  const requirements = {
    folioRealValid,
    waterConcessionValid,
    concessionTypeValid: property.legalDetails.concessionType !== 'none' 
      ? property.legalDetails.concessionType === 'beach' || property.legalDetails.concessionType === 'navigable'
      : true,
    boundariesVerified: property.legalDetails.boundariesVerified,
    municipalPermitsValid,
    registered: property.legalDetails.registered
  }

  const compliant = Object.values(requirements).every(Boolean)
  
  return {
    compliant,
    requirements
  }
}

// Helper function to get municipality code
const getMunicipalityCode = (municipality: string) => {
  // This would be a real mapping of municipality names to codes
  const municipalityMap: Record<string, string> = {
    'san josé': '01',
    'alajuela': '02',
    'cartago': '03',
    'heredia': '04',
    'guanacaste': '05',
    'puntarenas': '06',
    'limón': '07'
  }
  
  return municipalityMap[municipality.toLowerCase()] || ''
}

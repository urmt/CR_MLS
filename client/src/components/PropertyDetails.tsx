import React from 'react'
import { Property } from '../types/property'

interface PropertyDetailsProps {
  property: Property
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* ... existing property details ... */}
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-bold mb-4">Legal Verification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Folio Real:</p>
            <p>{property.legalDetails.folioReal}</p>
          </div>
          
          <div>
            <p className="font-medium">Water Concession:</p>
            <p>{property.legalDetails.waterConcession ? 'Yes' : 'No'}</p>
          </div>
          
          {property.legalDetails.waterConcession && (
            <div>
              <p className="font-medium">Concession Type:</p>
              <p>{property.legalDetails.concessionType}</p>
            </div>
          )}
          
          <div>
            <p className="font-medium">Registered:</p>
            <p>{property.legalDetails.registered ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <p className="font-medium">Municipal Permits:</p>
            <p>{property.legalDetails.municipalPermits ? 'Obtained' : 'Not obtained'}</p>
          </div>
          
          <div>
            <p className="font-medium">Boundaries Verified:</p>
            <p>{property.legalDetails.boundariesVerified ? 'Yes' : 'No'}</p>
          </div>
          
          {property.legalDetails.zoning && (
            <div>
              <p className="font-medium">Zoning:</p>
              <p>{property.legalDetails.zoning}</p>
            </div>
          )}
          
          {property.legalDetails.surveyPlan && (
            <div className="md:col-span-2">
              <p className="font-medium">Survey Plan:</p>
              <a 
                href={property.legalDetails.surveyPlan} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Survey Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

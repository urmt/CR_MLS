import React from 'react'
import { Property } from '../types/property'

interface PropertyCardProps {
  property: Property
  onViewDetails: () => void
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        {property.images[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded">
          ${property.price.toLocaleString()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{property.title}</h3>
        <p className="text-gray-600 mb-2">{property.location}</p>
        <div className="flex justify-between text-sm mb-3">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.area.toLocaleString()} sqft</span>
        </div>
        <button 
          onClick={onViewDetails}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default PropertyCard

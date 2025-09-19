import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import PropertyGallery from '../components/PropertyGallery'
import PropertyDetails from '../components/PropertyDetails'
import ContactAccessModal from '../components/ContactAccessModal'
import { Property } from '../types/property'

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [showContactModal, setShowContactModal] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}`)
      return response.data
    }
  })

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await api.get(`/properties/${id}/access`)
        setHasAccess(response.data.hasAccess)
      } catch (error) {
        setHasAccess(false)
      }
    }
    
    if (id) {
      checkAccess()
    }
  }, [id])

  if (isLoading) return <div>Loading property...</div>
  if (error) return <div>Error loading property</div>
  if (!property) return <div>Property not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PropertyGallery images={property.images} />
        </div>
        <div>
          <PropertyDetails property={property} />
          
          {!hasAccess && (
            <button
              onClick={() => setShowContactModal(true)}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Contact Information ($5)
            </button>
          )}
          
          {hasAccess && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-800">Contact Information</h3>
              <p className="mt-2">Agent: {property.agent.name}</p>
              <p>Email: {property.agent.email}</p>
              <p>Phone: {property.agent.phone}</p>
            </div>
          )}
        </div>
      </div>
      
      {showContactModal && (
        <ContactAccessModal 
          propertyId={property._id}
          price={5}
          onSuccess={() => {
            setHasAccess(true)
            setShowContactModal(false)
          }}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  )
}

export default PropertyDetailPage

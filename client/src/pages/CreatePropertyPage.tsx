import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import PropertyForm from '../components/PropertyForm'
import { Property } from '../types/property'

const CreatePropertyPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (propertyData: Property) => {
    setIsSubmitting(true)
    try {
      await api.post('/properties', propertyData)
      navigate('/')
    } catch (error) {
      console.error('Error creating property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">List a New Property</h1>
      <PropertyForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  )
}

export default CreatePropertyPage

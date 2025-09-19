import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Property } from '../types/property'

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  propertyType: z.enum(['house', 'apartment', 'land', 'commercial']),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative'),
  area: z.number().min(1, 'Area must be greater than 0'),
  images: z.array(z.string().url('Invalid URL')).min(1, 'At least one image is required'),
  contact: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(8, 'Phone must be at least 8 characters')
  })
})

interface PropertyFormProps {
  onSubmit: (data: Property) => void
  isSubmitting: boolean
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Property>({
    resolver: zodResolver(propertySchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input 
            {...register('title')} 
            className="w-full px-3 py-2 border rounded-md" 
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        // Add to the form component
<div className="mt-8 border-t pt-6">
  <h2 className="text-xl font-bold mb-4">Costa Rica Legal Verification</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium mb-1">Folio Real (National Registry ID)</label>
      <input 
        {...register('legalDetails.folioReal')} 
        className="w-full px-3 py-2 border rounded-md" 
        placeholder="e.g. 3-123456789"
      />
      {errors.legalDetails?.folioReal && <p className="text-red-500 text-sm mt-1">{errors.legalDetails.folioReal.message}</p>}
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-1">Water Concession</label>
      <select 
        {...register('legalDetails.waterConcession')} 
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="false">No water concession</option>
        <option value="true">Has water concession</option>
      </select>
    </div>
  </div>
  
  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium mb-1">Concession Type</label>
      <select 
        {...register('legalDetails.concessionType')} 
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="none">No concession</option>
        <option value="beach">Beach concession</option>
        <option value="navigable">Navigable water concession</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-1">Survey Plan URL</label>
      <input 
        {...register('legalDetails.surveyPlan')} 
        className="w-full px-3 py-2 border rounded-md" 
        placeholder="https://..."
      />
      {errors.legalDetails?.surveyPlan && <p className="text-red-500 text-sm mt-1">{errors.legalDetails.surveyPlan.message}</p>}
    </div>
  </div>
  
  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    <label className="flex items-center">
      <input 
        type="checkbox" 
        {...register('legalDetails.municipalPermits')} 
        className="mr-2"
      />
      Municipal Permits Obtained
    </label>
    
    <label className="flex items-center">
      <input 
        type="checkbox" 
        {...register('legalDetails.registered')} 
        className="mr-2"
      />
      Properly Registered
    </label>
    
    <label className="flex items-center">
      <input 
        type="checkbox" 
        {...register('legalDetails.boundariesVerified')} 
        className="mr-2"
      />
      Boundaries Verified
    </label>
  </div>
  
  <div className="mt-4">
    <label className="block text-sm font-medium mb-1">Zoning Classification</label>
    <input 
      {...register('legalDetails.zoning')} 
      className="w-full px-3 py-2 border rounded-md" 
      placeholder="e.g. Residential, Commercial, Mixed-Use"
    />
  </div>
</div>

        
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input 
            type="number" 
            {...register('price', { valueAsNumber: true })} 
            className="w-full px-3 py-2 border rounded-md" 
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          {...register('description')} 
          rows={4} 
          className="w-full px-3 py-2 border rounded-md" 
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input 
            {...register('location')} 
            className="w-full px-3 py-2 border rounded-md" 
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select 
            {...register('propertyType')} 
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Bedrooms</label>
          <input 
            type="number" 
            {...register('bedrooms', { valueAsNumber: true })} 
            className="w-full px-3 py-2 border rounded-md" 
          />
          {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Bathrooms</label>
          <input 
            type="number" 
            {...register('bathrooms', { valueAsNumber: true })} 
            className="w-full px-3 py-2 border rounded-md" 
          />
          {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Area (sqft)</label>
          <input 
            type="number" 
            {...register('area', { valueAsNumber: true })} 
            className="w-full px-3 py-2 border rounded-md" 
          />
          {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Contact Information</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input 
              {...register('contact.name')} 
              placeholder="Name" 
              className="w-full px-3 py-2 border rounded-md" 
            />
            {errors.contact?.name && <p className="text-red-500 text-sm mt-1">{errors.contact.name.message}</p>}
          </div>
          
          <div>
            <input 
              {...register('contact.email')} 
              placeholder="Email" 
              className="w-full px-3 py-2 border rounded-md" 
            />
            {errors.contact?.email && <p className="text-red-500 text-sm mt-1">{errors.contact.email.message}</p>}
          </div>
          
          <div>
            <input 
              {...register('contact.phone')} 
              placeholder="Phone" 
              className="w-full px-3 py-2 border rounded-md" 
            />
            {errors.contact?.phone && <p className="text-red-500 text-sm mt-1">{errors.contact.phone.message}</p>}
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Image URLs (one per line)</label>
        <textarea 
          {...register('images')} 
          rows={3} 
          className="w-full px-3 py-2 border rounded-md" 
          placeholder="https://example.com/image1.jpg"
        />
        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>}
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Creating Property...' : 'List Property'}
      </button>
    </form>
  )
}

export default PropertyForm

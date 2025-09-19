import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'

interface VerificationBadgeProps {
  propertyId: string
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ propertyId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['verification', propertyId],
    queryFn: async () => {
      const response = await api.get(`/properties/${propertyId}/verify`)
      return response.data
    }
  })

  if (isLoading) return <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">Verifying...</div>
  
  return data?.compliant ? (
    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
      Legally Verified
    </div>
  ) : (
    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
      Verification Issues
    </div>
  )
}

export default VerificationBadge

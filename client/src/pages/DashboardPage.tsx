import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import DashboardStats from '../components/DashboardStats'
import PropertyListings from '../components/PropertyListings'
import MarketAnalytics from '../components/MarketAnalytics'
import { Property } from '../types/property'

const DashboardPage = () => {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['dashboardProperties'],
    queryFn: async () => {
      const response = await api.get('/properties/me')
      return response.data
    }
  })

  const { data: analytics } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      const response = await api.get('/dashboard/analytics')
      return response.data
    }
  })

  if (isLoading) return <div>Loading dashboard...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>
      
      <DashboardStats 
        totalProperties={analytics?.totalProperties || 0}
        totalViews={analytics?.totalViews || 0}
        totalLeads={analytics?.totalLeads || 0}
        conversionRate={analytics?.conversionRate || 0}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <MarketAnalytics 
            propertiesByType={analytics?.propertiesByType || []}
            priceDistribution={analytics?.priceDistribution || []}
          />
        </div>
        <div>
          <PropertyListings properties={properties || []} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

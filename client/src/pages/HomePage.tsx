import React from 'react'
import { Link } from 'react-router-dom'
import FeaturedProperties from '../components/FeaturedProperties'

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Costa Rica MLS</h1>
        <p className="text-lg mb-6">
          Find your perfect property in Costa Rica. No accounts needed.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to="/search" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Properties
          </Link>
          <Link 
            to="/create" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            List a Property
          </Link>
        </div>
      </div>
      
      <FeaturedProperties />
    </div>
  )
}

export default HomePage

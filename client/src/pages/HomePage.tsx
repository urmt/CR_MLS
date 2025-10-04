import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GitHubDatabase from '../services/githubDatabase';

const HomePage: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  const { data: allProperties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => GitHubDatabase.getAllProperties(),
  });

  // Filter properties based on search criteria
  const properties = allProperties.filter(property => {
    const matchesCategory = !searchFilters.category || property.category === searchFilters.category;
    const matchesMinPrice = !searchFilters.minPrice || property.price_usd >= parseInt(searchFilters.minPrice);
    const matchesMaxPrice = !searchFilters.maxPrice || property.price_usd <= parseInt(searchFilters.maxPrice);
    const matchesLocation = !searchFilters.location || property.location.toLowerCase().includes(searchFilters.location.toLowerCase());
    
    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation;
  });

  const { data: stats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: () => GitHubDatabase.getPropertyStats(),
  });

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2>Error loading properties</h2>
          <p>Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🏠 Costa Rica MLS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover Premium Real Estate in Costa Rica
        </p>
        
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchFilters.category}
                  onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land & Lots</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input 
                  type="text"
                  placeholder="City or Province"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (USD)</label>
                <input 
                  type="number"
                  placeholder="50,000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchFilters.minPrice}
                  onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (USD)</label>
                <input 
                  type="number"
                  placeholder="1,000,000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchFilters.maxPrice}
                  onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                className="btn btn-primary px-8 py-3 text-lg"
                onClick={() => {/* Search handled by real-time filtering */}}
              >
                🔍 Search Properties
              </button>
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3"
                onClick={() => setSearchFilters({category: '', minPrice: '', maxPrice: '', location: ''})}
              >
                Clear Filters
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Showing {properties.length} of {allProperties.length} properties
              </p>
            </div>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(stats.avg_price / 1000)}K
              </div>
              <div className="text-sm text-gray-600">Avg Price</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.by_category).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(stats.by_source).length}
              </div>
              <div className="text-sm text-gray-600">Sources</div>
            </div>
          </div>
        )}
      </header>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.slice(0, 12).map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="relative">
              {property.images.length > 0 ? (
                <div className="w-full h-56 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="text-center z-10">
                    <div className="text-3xl mb-2">📷</div>
                    <span className="text-white text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
                      {property.images.length} Photo{property.images.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800 capitalize">
                      {property.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl text-gray-400 mb-2">🏠</div>
                    <span className="text-gray-500 text-sm">No Photos Available</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              
              <div className="text-3xl font-bold text-blue-600 mb-3">
                ${property.price_usd?.toLocaleString() || 'Contact for Price'}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <span className="text-sm">📍</span>
                <span className="ml-2 text-sm">{property.location.split(',').slice(0, 2).join(', ')}</span>
              </div>
              
              {property.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description.substring(0, 100)}...
                </p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Listed {new Date(property.scraped_at).toLocaleDateString()}
                </div>
                
                <button className="btn btn-primary text-sm px-6 py-2 hover:bg-blue-700 transition-colors">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl text-gray-600 mb-2">No properties available yet</h3>
          <p className="text-gray-500">Properties will appear here once our scraping system is active.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center mt-16 pt-8 border-t border-gray-200">
        <p className="text-gray-500">
          🏠 Costa Rica's Premier Property Listing Service
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Connecting buyers with Costa Rica's finest real estate opportunities
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
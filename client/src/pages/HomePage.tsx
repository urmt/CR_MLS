import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import GitHubDatabase from '../services/githubDatabase';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: ''
  });

  const { data: allProperties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => GitHubDatabase.getAllProperties(),
  });

  const { data: stats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: () => GitHubDatabase.getPropertyStats(),
  });

  // Filter properties based on search criteria
  const properties = allProperties.filter(property => {
    const matchesCategory = !searchFilters.category || property.category === searchFilters.category;
    const matchesMinPrice = !searchFilters.minPrice || property.price_usd >= parseInt(searchFilters.minPrice);
    const matchesMaxPrice = !searchFilters.maxPrice || property.price_usd <= parseInt(searchFilters.maxPrice);
    const matchesLocation = !searchFilters.location || property.location.toLowerCase().includes(searchFilters.location.toLowerCase());
    
    return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation;
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-blue-600">
                Costa Rica MLS
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Listings</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">New Homes</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Find an Agent</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Market Insights</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600 font-medium">Login</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Costa Rica MLS Listings
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Your Trusted Real Estate Source in Costa Rica
            </p>
            <p className="text-lg text-blue-200">
              Search Listings • Find Real Estate • Discover Your Dream Property
            </p>
          </div>

          {/* Search Tabs */}
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-1 mb-4">
              <button
                className={`px-6 py-3 font-semibold rounded-t-lg ${
                  activeTab === 'buy' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
                onClick={() => setActiveTab('buy')}
              >
                Find Real Estate
              </button>
              <button
                className={`px-6 py-3 font-semibold rounded-t-lg ${
                  activeTab === 'new' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
                onClick={() => setActiveTab('new')}
              >
                Find New Homes
              </button>
              <button
                className={`px-6 py-3 font-semibold rounded-t-lg ${
                  activeTab === 'agent' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
                onClick={() => setActiveTab('agent')}
              >
                Find Real Estate Agents
              </button>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-lg rounded-tl-none p-8 shadow-xl">
              {activeTab === 'buy' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Search for listings near you.
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City or Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="San José, Cartago, Guanacaste..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchFilters.location}
                        onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchFilters.category}
                        onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                      >
                        <option value="">All Property Types</option>
                        <option value="residential">Houses</option>
                        <option value="luxury">Luxury Homes</option>
                        <option value="land">Land & Lots</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={searchFilters.minPrice}
                          onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                        >
                          <option value="">No minimum</option>
                          <option value="50000">$50,000</option>
                          <option value="100000">$100,000</option>
                          <option value="150000">$150,000</option>
                          <option value="200000">$200,000</option>
                          <option value="250000">$250,000</option>
                          <option value="300000">$300,000</option>
                          <option value="400000">$400,000</option>
                          <option value="500000">$500,000</option>
                          <option value="750000">$750,000</option>
                          <option value="1000000">$1,000,000+</option>
                        </select>
                        <select
                          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={searchFilters.maxPrice}
                          onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                        >
                          <option value="">No maximum</option>
                          <option value="100000">$100,000</option>
                          <option value="150000">$150,000</option>
                          <option value="200000">$200,000</option>
                          <option value="250000">$250,000</option>
                          <option value="300000">$300,000</option>
                          <option value="400000">$400,000</option>
                          <option value="500000">$500,000</option>
                          <option value="750000">$750,000</option>
                          <option value="1000000">$1,000,000</option>
                          <option value="2000000">$2,000,000+</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-lg transition-colors">
                      Search Properties
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'new' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Search for new construction near you.
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please enter a City or Province
                      </label>
                      <input
                        type="text"
                        placeholder="Enter location in Costa Rica"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>No minimum</option>
                          <option>$100,000</option>
                          <option>$200,000</option>
                          <option>$300,000</option>
                          <option>$500,000</option>
                        </select>
                        <select className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>No maximum</option>
                          <option>$300,000</option>
                          <option>$500,000</option>
                          <option>$750,000</option>
                          <option>$1,000,000+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-lg transition-colors">
                      Search New Homes
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'agent' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Discover local experts in Costa Rica to help you buy or sell your home.
                  </h3>
                  <div className="max-w-md mx-auto mb-6">
                    <input
                      type="text"
                      placeholder="Enter City or Province"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-lg text-lg transition-colors">
                      Find An Agent
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Costa Rica Map Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Click on a Province to View MLS Listings in your area
          </h2>
          
          {/* Costa Rica Provinces Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              'San José', 'Alajuela', 'Cartago', 'Heredia',
              'Guanacaste', 'Puntarenas', 'Limón'
            ].map((province) => (
              <button
                key={province}
                className="bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 p-4 rounded-lg font-semibold text-gray-700 hover:text-blue-600 transition-all"
                onClick={() => setSearchFilters({...searchFilters, location: province})}
              >
                {province}
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-block bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🇨🇷 Costa Rica Real Estate
              </h3>
              <p className="text-gray-600">
                Explore properties across all 7 provinces of Costa Rica
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Properties</h2>
            {stats && (
              <div className="text-gray-600">
                Showing {properties.length} of {stats.total} properties
              </div>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.slice(0, 8).map((property) => (
              <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {property.images.length > 0 ? (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📷</div>
                        <span className="text-sm text-gray-600">
                          {property.images.length} Photo{property.images.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
                          {property.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl text-gray-400 mb-2">🏠</div>
                        <span className="text-sm text-gray-500">No Photos</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="text-xl font-bold text-blue-600 mb-2">
                    ${property.price_usd?.toLocaleString() || 'Contact for Price'}
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    📍 {property.location.split(',').slice(0, 2).join(', ')}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Listed {new Date(property.scraped_at).toLocaleDateString()}</span>
                    <button className="text-blue-600 hover:text-blue-800 font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No properties match your search</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search criteria to see more results.</p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                onClick={() => setSearchFilters({category: '', minPrice: '', maxPrice: '', location: '', bedrooms: '', bathrooms: ''})}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            What is Costa Rica MLS?
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Costa Rica MLS is a comprehensive property search platform to find real estate listings 
              throughout Costa Rica. We feature properties from trusted real estate professionals, 
              including residential homes, luxury properties, commercial real estate, and land opportunities. 
              Whether you're looking for a beachfront villa in Guanacaste, a mountain retreat in the Central Valley, 
              or commercial property in San José, Costa Rica MLS connects you with the finest real estate opportunities 
              in this beautiful Central American paradise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl mb-4">🏖️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Beach Properties</h3>
              <p className="text-gray-600">Discover oceanfront homes and beachside investments</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🏔️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Mountain Retreats</h3>
              <p className="text-gray-600">Find your perfect mountain getaway in the Central Valley</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Commercial Properties</h3>
              <p className="text-gray-600">Explore business opportunities and investment properties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Costa Rica MLS</h3>
              <p className="text-gray-300">
                Your trusted source for Costa Rica real estate listings and market insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Property Search</a></li>
                <li><a href="#" className="hover:text-white">New Listings</a></li>
                <li><a href="#" className="hover:text-white">Market Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Locations</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">San José</a></li>
                <li><a href="#" className="hover:text-white">Guanacaste</a></li>
                <li><a href="#" className="hover:text-white">Puntarenas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">
                Professional real estate services<br/>
                throughout Costa Rica
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Costa Rica MLS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
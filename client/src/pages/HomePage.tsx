import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GitHubDatabase from '../services/githubDatabase';

const HomePage: React.FC = () => {
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => GitHubDatabase.getAllProperties(),
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏠 Costa Rica MLS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find Your Dream Property in Costa Rica
        </p>
        
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.slice(0, 12).map((property) => (
          <div key={property.id} className="card hover:shadow-lg transition-shadow">
            <div className="mb-4">
              {property.images.length > 0 ? (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">📷 {property.images.length} Photo(s)</span>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">🏠 No Photos</span>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
              {property.title}
            </h3>
            
            <div className="text-2xl font-bold text-blue-600 mb-2">
              ${property.price_usd?.toLocaleString() || 'Price on request'}
            </div>
            
            <div className="text-gray-600 mb-4">
              📍 {property.location}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {property.category}
              </span>
              
              <button className="btn btn-primary text-sm">
                View Details
              </button>
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
          🌐 Powered by IPFS • 🤖 Autonomous Property Scraping • 📧 Automated Email Campaigns
        </p>
        <p className="text-sm text-gray-400 mt-2">
          This system operates autonomously with $0 maintenance costs
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GitHubDatabase from '../services/githubDatabase';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => GitHubDatabase.getPropertyById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-8">The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Properties
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {property.title}
            </h1>
            
            <div className="text-3xl font-bold text-blue-600 mb-6">
              ${property.price_usd?.toLocaleString() || 'Price on request'}
            </div>

            <div className="text-lg text-gray-600 mb-6">
              📍 {property.location}
            </div>

            {property.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}

            {property.images && property.images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.images.map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <span className="text-gray-500">📷 Photo {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Property Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{property.category}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Source:</span>
                <span className="font-medium">{property.source}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Listed:</span>
                <span className="font-medium">
                  {new Date(property.scraped_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Property ID:</span>
                <span className="font-mono text-sm">{property.id}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Get Contact Information</h3>
            <p className="text-gray-600 mb-4">
              Pay $5 to access the contact information for this property.
            </p>
            
            <button className="btn btn-primary w-full mb-3">
              💳 Pay with PayPal ($5)
            </button>
            
            <button className="btn bg-gray-800 text-white w-full hover:bg-gray-700">
              🪙 Pay with Crypto (USDC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
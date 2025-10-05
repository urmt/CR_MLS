import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GitHubDatabase from '../services/githubDatabase';
import CryptoPayment from '../components/CryptoPayment';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showCrypto, setShowCrypto] = useState<string | null>(null);
  
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
            <h3 className="text-lg font-semibold mb-4">Property Services</h3>
            
            {/* Contact Information */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">📞 Contact Information</h4>
                <span className="text-lg font-bold text-green-600">
                  ${property.category === 'luxury' ? '15.00' : 
                    property.category === 'commercial' ? '10.00' : 
                    property.category === 'land' ? '7.50' : '5.00'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Access seller or listing agent contact details
              </p>
              <button className="btn btn-primary w-full mb-2 text-sm">
                💳 PayPal (${property.category === 'luxury' ? '15.00' : 
                  property.category === 'commercial' ? '10.00' : 
                  property.category === 'land' ? '7.50' : '5.00'})
              </button>
              <button 
                onClick={() => setShowCrypto('contact')}
                className="btn bg-gray-800 text-white w-full hover:bg-gray-700 text-sm"
              >
                🪙 Crypto (ETH/LINK/USDC)
              </button>
            </div>

            {/* CR Concessions Info */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">🏛️ CR Legal Concessions</h4>
                <span className="text-lg font-bold text-green-600">$12.00</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Beach/water concessions, permits, legal status
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-outline text-sm">
                  💳 PayPal
                </button>
                <button 
                  onClick={() => setShowCrypto('concession')}
                  className="btn bg-gray-700 text-white hover:bg-gray-600 text-sm"
                >
                  🪙 Crypto
                </button>
              </div>
            </div>

            {/* Property History */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">📋 Property History</h4>
                <span className="text-lg font-bold text-green-600">$8.00</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Previous sales, price history, ownership records
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-outline text-sm">
                  💳 PayPal
                </button>
                <button 
                  onClick={() => setShowCrypto('history')}
                  className="btn bg-gray-700 text-white hover:bg-gray-600 text-sm"
                >
                  🪙 Crypto
                </button>
              </div>
            </div>

            {/* Agent Unlimited Access */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-blue-900 mb-2">🏆 Are you an Agent?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Get unlimited access to all property information
                </p>
                <button className="btn btn-primary w-full text-sm">
                  Agent Login - Free Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Payment Modal */}
      {showCrypto && property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {showCrypto === 'contact' ? 'Contact Information' :
                 showCrypto === 'concession' ? 'CR Legal Concessions' :
                 'Property History'} Payment
              </h3>
              <button
                onClick={() => setShowCrypto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <CryptoPayment
              amount={
                showCrypto === 'contact' ? 
                  (property.category === 'luxury' ? 15.00 : 
                   property.category === 'commercial' ? 10.00 : 
                   property.category === 'land' ? 7.50 : 5.00) :
                showCrypto === 'concession' ? 12.00 : 8.00
              }
              description={`${showCrypto === 'contact' ? 'Contact information' :
                             showCrypto === 'concession' ? 'Legal concessions report' :
                             'Property history report'} for ${property.title}`}
              onPaymentComplete={() => {
                setShowCrypto(null);
                alert(`Payment initiated! You'll receive the ${showCrypto} information via email once payment is confirmed.`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
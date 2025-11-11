import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import GitHubDatabase from '../services/githubDatabase';
import ReportPreview from '../components/ReportPreview';
import { COSTA_RICA_REPORT_TYPES } from '../types/reports';
// import CryptoPayment from '../components/CryptoPayment';
// import PropertyPayPalPayment from '../components/PropertyPayPalPayment';

// PayPal types handled via any

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showCrypto, setShowCrypto] = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => GitHubDatabase.getPropertyById(id!),
    enabled: !!id,
  });
  
  // Function to handle PayPal direct payment
  const handlePayPalPayment = (reportType: string) => {
    if (!(window as any).paypal) {
      alert('PayPal is not available. Please refresh the page and try again.');
      return;
    }

    const amount = reportType === 'contact' ? 
      (property!.category === 'luxury' ? '15.00' : 
       property!.category === 'commercial' ? '10.00' : 
       property!.category === 'land' ? '7.50' : '5.00') :
      reportType === 'concession' ? '12.00' : '8.00';

    // Create PayPal payment directly
    (window as any).paypal.Buttons({
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount,
              currency_code: 'USD'
            },
            description: `${reportType === 'contact' ? 'Contact Information' :
                         reportType === 'concession' ? 'CR Legal Concessions' :
                         'Property History'} - ${property!.title}`
          }]
        });
      },
      onApprove: function(data: any, actions: any) {
        return actions.order.capture().then(function(details: any) {
          alert(`Payment successful! You'll receive the ${reportType} information via email within 24 hours.`);
          console.log('PayPal payment completed:', details);
        });
      },
      onError: function(err: any) {
        console.error('PayPal payment error:', err);
        alert('Payment failed. Please try again.');
      },
      onCancel: function(data: any) {
        console.log('PayPal payment cancelled:', data);
      }
    }).render('body').then(() => {
      // The PayPal button is rendered as a popup, we don't need a container
    }).catch((error: any) => {
      console.error('PayPal render error:', error);
      alert('PayPal service is temporarily unavailable. Please try again later.');
    });
  };

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
                Listing source, agent contact info, property details & images
              </p>
              <button 
                className="btn btn-ghost w-full mb-2 text-sm"
                onClick={() => setShowPreview('basic_contact')}
              >
                👁️ Preview Sample Report
              </button>
              <button
                className="btn btn-primary w-full mb-2 text-sm"
                onClick={() => {
                  console.log('Contact PayPal payment for property:', property.id);
                  handlePayPalPayment('contact');
                }}
                style={{
                  pointerEvents: 'auto' as any,
                  zIndex: 999,
                  position: 'relative'
                }}
              >
                💳 PayPal (${property.category === 'luxury' ? '15.00' : 
                  property.category === 'commercial' ? '10.00' : 
                  property.category === 'land' ? '7.50' : '5.00'})
              </button>
                <button 
                onClick={() => {
                  console.log('Contact Crypto payment for property:', property.id);
                  setShowCrypto('contact');
                  // Auto-scroll to crypto modal after a brief delay
                  setTimeout(() => {
                    document.getElementById('crypto-modal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                className="btn bg-gray-800 text-white w-full hover:bg-gray-700 text-sm"
                style={{
                  pointerEvents: 'auto' as any,
                  zIndex: 999,
                  position: 'relative'
                }}
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
                Location analysis & future legal data integration
              </p>
              <button 
                className="btn btn-ghost w-full mb-2 text-sm"
                onClick={() => setShowPreview('legal_compliance')}
              >
                👁️ Preview Sample Report
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="btn btn-outline text-sm"
                  onClick={() => {
                    console.log('Concession PayPal payment for property:', property.id);
                    handlePayPalPayment('concession');
                  }}
                  style={{
                    pointerEvents: 'auto' as any,
                    zIndex: 999,
                    position: 'relative'
                  }}
                >
                  💳 PayPal
                </button>
                <button 
                  onClick={() => {
                    console.log('Concession Crypto payment for property:', property.id);
                    setShowCrypto('concession');
                    setTimeout(() => {
                      document.getElementById('crypto-modal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="btn bg-gray-700 text-white hover:bg-gray-600 text-sm"
                  style={{
                    pointerEvents: 'auto' as any,
                    zIndex: 999,
                    position: 'relative'
                  }}
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
                Complete listing data, market context & future enhancements
              </p>
              <button 
                className="btn btn-ghost w-full mb-2 text-sm"
                onClick={() => setShowPreview('complete_due_diligence')}
              >
                👁️ Preview Sample Report
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="btn btn-outline text-sm"
                  onClick={() => {
                    console.log('History PayPal payment for property:', property.id);
                    handlePayPalPayment('history');
                  }}
                  style={{
                    pointerEvents: 'auto' as any,
                    zIndex: 999,
                    position: 'relative'
                  }}
                >
                  💳 PayPal
                </button>
                <button 
                  onClick={() => {
                    console.log('History Crypto payment for property:', property.id);
                    setShowCrypto('history');
                    setTimeout(() => {
                      document.getElementById('crypto-modal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="btn bg-gray-700 text-white hover:bg-gray-600 text-sm"
                  style={{
                    pointerEvents: 'auto' as any,
                    zIndex: 999,
                    position: 'relative'
                  }}
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
                <button 
                  className="btn btn-primary w-full text-sm"
                  onClick={() => {
                    alert('Agent Login button clicked!');
                    console.log('Agent Login clicked');
                    // TODO: Navigate to agent login page
                  }}
                  style={{
                    pointerEvents: 'auto' as any,
                    zIndex: 999,
                    position: 'relative'
                  }}
                >
                  Agent Login - Free Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Payment Modal */}
      {showCrypto && property && (
        <div id="crypto-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            
            <div className="bg-gray-800 text-white rounded-lg p-4">
              <h4 className="font-semibold mb-3">🪙 Pay with Cryptocurrency</h4>
              <p className="text-sm text-gray-300 mb-4">
                {showCrypto === 'contact' ? 'Contact information' :
                 showCrypto === 'concession' ? 'Legal concessions report' :
                 'Property history report'} for {property.title}
              </p>
              
              <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                <QRCode 
                  value="0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79" 
                  size={200}
                  style={{ margin: '0 auto' }}
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Amount</div>
                  <div className="font-mono">
                    ${showCrypto === 'contact' ? 
                      (property.category === 'luxury' ? '15.00' : 
                       property.category === 'commercial' ? '10.00' : 
                       property.category === 'land' ? '7.50' : '5.00') :
                      showCrypto === 'concession' ? '12.00' : '8.00'} USDC
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Wallet Address</div>
                  <div className="font-mono text-xs bg-gray-700 p-2 rounded">
                    0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 bg-gray-700 p-3 rounded">
                  📱 <strong>Mobile:</strong> Scan QR code with your crypto wallet app<br />
                  💻 <strong>Desktop:</strong> Copy wallet address and send manually
                </div>
                
                <button
                  onClick={() => {
                    setShowCrypto(null);
                    alert(`Payment initiated! You'll receive the ${showCrypto} information via email once payment is confirmed.`);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                >
                  ✅ I've Sent the Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Preview Modal */}
      {showPreview && (
        <ReportPreview
          reportType={COSTA_RICA_REPORT_TYPES.find(r => r.id === showPreview)!}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  );
};

export default PropertyDetailPage;
import React, { useState } from 'react';
import { COSTA_RICA_REPORT_TYPES, ReportType } from '../types/reports';
import CryptoPayment from './CryptoPayment';
import PayPalPropertyPayment from './PayPalPropertyPayment';

interface PropertyReportSelectorProps {
  selectedProperties: string[];
  onClose: () => void;
  onSuccess: (reportType: ReportType, properties: string[]) => void;
}

const PropertyReportSelector: React.FC<PropertyReportSelectorProps> = ({
  selectedProperties,
  onClose,
  onSuccess
}) => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'crypto' | null>(null);

  const calculateTotal = (reportType: ReportType) => {
    return reportType.price * selectedProperties.length;
  };

  const handlePaymentSuccess = () => {
    if (selectedReportType) {
      onSuccess(selectedReportType, selectedProperties);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Report Type</h2>
              <p className="text-gray-600">
                {selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'} selected
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ✕
            </button>
          </div>

          {/* Report Type Selection */}
          {!selectedReportType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🇨🇷 Costa Rica Property Reports
              </h3>
              
              {COSTA_RICA_REPORT_TYPES.map((reportType) => (
                <div
                  key={reportType.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                    reportType.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReportType(reportType)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{reportType.icon}</span>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          {reportType.name}
                          {reportType.popular && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                              MOST POPULAR
                            </span>
                          )}
                        </h4>
                        <p className="text-gray-600">{reportType.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${reportType.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">per property</div>
                      <div className="text-xs text-gray-400">
                        {reportType.deliveryTime}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Included Features:</h5>
                      <ul className="space-y-1">
                        {reportType.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            {feature}
                          </li>
                        ))}
                        {reportType.features.length > 5 && (
                          <li className="text-sm text-gray-500">
                            + {reportType.features.length - 5} more features...
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Your Order:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>{selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'}</span>
                          <span>${reportType.price.toFixed(2)} each</span>
                        </div>
                        <div className="border-t pt-1 font-semibold flex justify-between">
                          <span>Total:</span>
                          <span className="text-green-600">${calculateTotal(reportType).toFixed(2)}</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        Select This Report Type
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Method Selection */}
          {selectedReportType && !paymentMethod && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {selectedReportType.icon} {selectedReportType.name} Selected
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Properties: {selectedProperties.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Price per report: ${selectedReportType.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Delivery: {selectedReportType.deliveryTime}</span>
                  </div>
                  <div className="font-semibold">
                    <span className="text-blue-900">Total: ${calculateTotal(selectedReportType).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    console.log('PayPal payment method selected');
                    setPaymentMethod('paypal');
                  }}
                  className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💳</div>
                    <h4 className="font-semibold text-gray-900">PayPal</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Credit/Debit Cards, PayPal Balance
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      ✓ Instant processing<br />
                      ✓ Buyer protection
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    console.log('Crypto payment method selected');
                    setPaymentMethod('crypto');
                  }}
                  className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🪙</div>
                    <h4 className="font-semibold text-gray-900">Cryptocurrency</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ETH, USDC, LINK
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      ✓ Lower fees<br />
                      ✓ Anonymous payment
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedReportType(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
                >
                  ← Back to Reports
                </button>
              </div>
            </div>
          )}

          {/* Payment Processing */}
          {selectedReportType && paymentMethod && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-900">
                  Ready to Purchase: {selectedReportType.name}
                </h3>
                <div className="text-sm text-green-700 mt-1">
                  Total: ${calculateTotal(selectedReportType).toFixed(2)} via {paymentMethod === 'paypal' ? 'PayPal' : 'Cryptocurrency'}
                </div>
              </div>

              {paymentMethod === 'paypal' && (
                <PayPalPropertyPayment
                  amount={calculateTotal(selectedReportType)}
                  propertyCount={selectedProperties.length}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    alert('Payment failed. Please try again.');
                  }}
                />
              )}

              {paymentMethod === 'crypto' && (
                <CryptoPayment
                  amount={calculateTotal(selectedReportType)}
                  description={`${selectedReportType.name} for ${selectedProperties.length} properties`}
                  onPaymentComplete={handlePaymentSuccess}
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
                >
                  ← Change Payment Method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyReportSelector;
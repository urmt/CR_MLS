import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const PaymentOptions = ({ propertyCID, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { contract, account } = useWeb3();
  
  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    try {
      await contract.methods.payWithCrypto(propertyCID).send({ from: account });
      onSuccess();
    } catch (error) {
      console.error("Crypto payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePayPalPayment = () => {
    setIsProcessing(true);
    // This would open PayPal checkout
    window.open(
      `https://www.paypal.com/checkout?propertyCID=${propertyCID}`,
      '_blank'
    );
  };
  
  return (
    <div className="payment-options">
      <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button
          className={`p-4 border rounded-lg text-center ${
            selectedMethod === 'crypto' ? 'border-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => setSelectedMethod('crypto')}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center">
            <CryptoIcon className="w-8 h-8 mb-2" />
            <span>Crypto (5 USDC)</span>
            <span className="text-sm text-gray-600">~$5.00</span>
          </div>
        </button>
        
        <button
          className={`p-4 border rounded-lg text-center ${
            selectedMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => setSelectedMethod('paypal')}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center">
            <PayPalIcon className="w-8 h-8 mb-2" />
            <span>PayPal</span>
            <span className="text-sm text-gray-600">$5.50</span>
          </div>
        </button>
        
        <button
          className={`p-4 border rounded-lg text-center ${
            selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => setSelectedMethod('card')}
          disabled={isProcessing}
        >
          <div className="flex flex-col items-center">
            <CreditCardIcon className="w-8 h-8 mb-2" />
            <span>Credit/Debit</span>
            <span className="text-sm text-gray-600">$5.50</span>
          </div>
        </button>
      </div>
      
      {selectedMethod && (
        <div className="mt-4">
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            onClick={selectedMethod === 'crypto' ? handleCryptoPayment : handlePayPalPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay with ${selectedMethod}`}
          </button>
          
          <p className="text-sm text-gray-600 mt-2">
            {selectedMethod === 'crypto'
              ? 'Pay directly with crypto wallet'
              : 'You will be redirected to payment processor'}
          </p>
        </div>
      )}
    </div>
  );
};

// Add these icon components in the same file
const CryptoIcon = () => <div>💰</div>;
const PayPalIcon = () => <div>P</div>;
const CreditCardIcon = () => <div>💳</div>;

export default PaymentOptions;

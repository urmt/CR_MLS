import React, { useState } from 'react';
import WorkingCryptoPayment from './WorkingCryptoPayment';

const ButtonTest: React.FC = () => {
  const [showCrypto, setShowCrypto] = useState(false);
  
  const handleBasicClick = () => {
    alert('Basic button clicked!');
    console.log('Basic button clicked');
  };

  const handleCryptoClick = () => {
    console.log('Crypto button clicked - showing modal');
    setShowCrypto(true);
  };

  const handlePayPalClick = () => {
    alert('PayPal button clicked! Would show PayPal interface.');
    console.log('PayPal button clicked');
  };

  return (
    <>
      <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4">
        <h3 className="text-lg font-bold mb-4">🧪 Button Test Area</h3>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleBasicClick}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Basic Test
          </button>
          
          <button 
            onClick={handleCryptoClick}
            className="btn btn-primary"
          >
            🪙 Test Crypto
          </button>
          
          <button 
            onClick={handlePayPalClick}
            className="btn btn-secondary"
          >
            💳 Test PayPal
          </button>

          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log('Event object:', e);
              alert('Event test clicked');
            }}
            className="bg-red-500 text-white px-3 py-2 rounded text-sm"
          >
            Event Test
          </button>
        </div>
      </div>
      
      {/* Crypto Payment Modal */}
      {showCrypto && (
        <WorkingCryptoPayment
          amount={25.00}
          description="Test crypto payment for property reports"
          onClose={() => setShowCrypto(false)}
        />
      )}
    </>
  );
};

export default ButtonTest;
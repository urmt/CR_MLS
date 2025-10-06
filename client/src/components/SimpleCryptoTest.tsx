import React, { useState } from 'react';

interface SimpleCryptoTestProps {
  amount: number;
  description: string;
}

const SimpleCryptoTest: React.FC<SimpleCryptoTestProps> = ({ amount, description }) => {
  const [showQR, setShowQR] = useState(false);
  
  if (!showQR) {
    return (
      <div className="bg-gray-800 text-white rounded p-4 mt-4">
        <h4 className="font-bold">🪙 Test Crypto Payment</h4>
        <p className="text-sm mb-2">{description}</p>
        <p className="text-lg font-bold text-green-400">${amount}</p>
        <button 
          onClick={() => {
            console.log('Simple crypto test clicked');
            setShowQR(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Show Payment Details
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white rounded p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold">💰 Crypto Payment: ${amount}</h4>
        <button onClick={() => setShowQR(false)} className="text-gray-400">✕</button>
      </div>
      
      <div className="bg-white text-black p-4 rounded mb-4 text-center">
        <div className="text-6xl mb-2">📱</div>
        <p className="font-bold">QR Code Would Appear Here</p>
        <p className="text-sm">Send ${amount} worth of ETH to:</p>
        <p className="font-mono text-xs bg-gray-200 p-2 rounded mt-2">
          0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79
        </p>
      </div>
      
      <div className="space-y-2">
        <div><strong>Amount:</strong> ${amount} USD</div>
        <div><strong>ETH Amount:</strong> ≈ {(amount / 2500).toFixed(6)} ETH</div>
        <div><strong>Description:</strong> {description}</div>
      </div>
      
      <button 
        onClick={() => {
          alert('Payment confirmed! This is a test - no real payment was made.');
          setShowQR(false);
        }}
        className="w-full bg-green-600 text-white py-2 rounded mt-4"
      >
        ✅ Confirm Payment (TEST)
      </button>
    </div>
  );
};

export default SimpleCryptoTest;
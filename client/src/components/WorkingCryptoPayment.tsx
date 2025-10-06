import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface WorkingCryptoPaymentProps {
  amount: number;
  description: string;
  onClose: () => void;
}

const WorkingCryptoPayment: React.FC<WorkingCryptoPaymentProps> = ({ 
  amount, 
  description,
  onClose 
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<'ETH' | 'USDC'>('ETH');
  
  const walletAddress = "0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79";
  const ethAmount = (amount / 2500).toFixed(6); // $2500 per ETH
  const usdcAmount = amount.toFixed(2);
  
  // Generate simple payment data for QR code
  const qrData = selectedCrypto === 'ETH' 
    ? `ethereum:${walletAddress}?value=${ethAmount}` 
    : `Send ${usdcAmount} USDC to: ${walletAddress}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">🪙 Crypto Payment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="text-2xl font-bold text-green-600 mb-6">${amount}</div>

        {/* Crypto Selection */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedCrypto('ETH')}
            className={`flex-1 p-3 rounded border ${
              selectedCrypto === 'ETH' 
                ? 'bg-blue-100 border-blue-500 text-blue-700' 
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="font-semibold">ETH</div>
            <div className="text-sm">{ethAmount}</div>
          </button>
          <button
            onClick={() => setSelectedCrypto('USDC')}
            className={`flex-1 p-3 rounded border ${
              selectedCrypto === 'USDC' 
                ? 'bg-blue-100 border-blue-500 text-blue-700' 
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="font-semibold">USDC</div>
            <div className="text-sm">{usdcAmount}</div>
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 border rounded-lg mb-6 text-center">
          <QRCode
            value={qrData}
            size={200}
            className="mx-auto mb-4"
          />
          <div className="text-sm text-gray-600">
            Scan with your crypto wallet
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="text-sm text-gray-500">Amount to Send</div>
            <div className="font-mono font-bold">
              {selectedCrypto === 'ETH' ? `${ethAmount} ETH` : `${usdcAmount} USDC`}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Wallet Address</div>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
              {walletAddress}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Scan QR code with your crypto wallet</li>
            <li>2. Verify the amount and address</li>
            <li>3. Send the payment</li>
            <li>4. Click "I've Sent Payment" below</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              alert(`Payment confirmed for ${selectedCrypto === 'ETH' ? ethAmount + ' ETH' : usdcAmount + ' USDC'}! This is a test.`);
              onClose();
            }}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            ✅ I've Sent Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkingCryptoPayment;
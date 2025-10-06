import React, { useState, useMemo } from 'react';
import QRCode from 'react-qr-code';

interface CryptoPaymentProps {
  amount: number;
  description: string;
  onPaymentComplete?: () => void;
  className?: string;
}

// Approximate crypto prices (in a real app, you'd fetch from an API)
const CRYPTO_PRICES = {
  ETH: 2500, // $2500 per ETH
  LINK: 12,  // $12 per LINK
  USDC: 1    // $1 per USDC
};

const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  amount,
  description,
  onPaymentComplete,
  className = ""
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<'ETH' | 'LINK' | 'USDC'>('ETH');
  const [showQR, setShowQR] = useState(false);

  // Calculate crypto amounts
  const cryptoAmounts = useMemo(() => ({
    ETH: (amount / CRYPTO_PRICES.ETH).toFixed(6),
    LINK: (amount / CRYPTO_PRICES.LINK).toFixed(2),
    USDC: amount.toFixed(2)
  }), [amount]);

  // Your crypto wallet addresses
  const walletAddresses = {
    ETH: '0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79',
    LINK: '0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79',
    USDC: '0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79'
  };

  // Generate payment URI for QR code
  const generatePaymentURI = (crypto: 'ETH' | 'LINK' | 'USDC') => {
    const address = walletAddresses[crypto];
    const amount = cryptoAmounts[crypto];
    
    // For Ethereum and ERC-20 tokens, use ethereum: URI scheme
    if (crypto === 'ETH') {
      return `ethereum:${address}?value=${parseFloat(amount) * 1e18}`;
    } else {
      // For ERC-20 tokens like LINK and USDC, include contract address
      const contractAddresses = {
        LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        USDC: '0xA0b86a33E6040b40A5bc8A8e5C229D4eb1E0094F'
      };
      return `ethereum:${contractAddresses[crypto]}@1/transfer?address=${address}&uint256=${parseFloat(amount) * (crypto === 'USDC' ? 1e6 : 1e18)}`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!showQR) {
    return (
      <div className={`bg-gray-800 text-white rounded-lg p-4 ${className}`}>
        <h4 className="font-semibold mb-3">🪙 Pay with Cryptocurrency</h4>
        <p className="text-sm text-gray-300 mb-4">{description}</p>
        
        {/* Crypto Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['ETH', 'LINK', 'USDC'] as const).map((crypto) => (
            <button
              key={crypto}
              className={`p-3 rounded text-center transition-colors ${
                selectedCrypto === crypto
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedCrypto(crypto)}
            >
              <div className="font-semibold">{crypto}</div>
              <div className="text-sm">{cryptoAmounts[crypto]}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            console.log('Crypto payment button clicked', { selectedCrypto, amount: cryptoAmounts[selectedCrypto] });
            setShowQR(true);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Generate QR Code ({cryptoAmounts[selectedCrypto]} {selectedCrypto})
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 text-white rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Pay {cryptoAmounts[selectedCrypto]} {selectedCrypto}</h4>
        <button
          onClick={() => setShowQR(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
        <QRCode
          value={generatePaymentURI(selectedCrypto)}
          size={200}
          level="M"
        />
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-400">Amount</div>
          <div className="font-mono">{cryptoAmounts[selectedCrypto]} {selectedCrypto}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400">Wallet Address</div>
          <div className="font-mono text-xs bg-gray-700 p-2 rounded flex justify-between items-center">
            <span className="truncate mr-2">{walletAddresses[selectedCrypto]}</span>
            <button
              onClick={() => copyToClipboard(walletAddresses[selectedCrypto])}
              className="text-blue-400 hover:text-blue-300 flex-shrink-0"
            >
              📋
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-400 bg-gray-700 p-3 rounded">
          📱 <strong>Mobile:</strong> Scan QR code with your crypto wallet app<br />
          💻 <strong>Desktop:</strong> Copy wallet address and send manually
        </div>

        <div className="border-t border-gray-600 pt-3">
          <button
            onClick={() => {
              setShowQR(false);
              onPaymentComplete?.();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            ✅ I've Sent the Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoPayment;
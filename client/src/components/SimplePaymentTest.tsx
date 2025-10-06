import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
const SimplePaymentTest: React.FC = () => {
  const [showCrypto, setShowCrypto] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);

  const handleClick = (type: string) => {
    console.log(`${type} button clicked!`);
    alert(`${type} button works!`);
  };

  return (
    <div className="bg-red-100 border-2 border-red-500 p-4 rounded mb-4">
      <h3 className="text-xl font-bold mb-4">🚨 EMERGENCY BUTTON TEST</h3>
      <p className="mb-4">If these don't work, there's a fundamental JavaScript error:</p>
      
      <div className="space-y-2">
        <button 
          onClick={(e) => {
            console.log('EMERGENCY: Basic button clicked!', e);
            e.stopPropagation();
            handleClick('Basic');
          }}
          onMouseDown={(e) => console.log('EMERGENCY: Basic button mouse down', e)}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔴 BASIC TEST BUTTON
        </button>

        <br />

        <button 
          onClick={(e) => {
            console.log('EMERGENCY: Crypto button clicked!', e);
            e.stopPropagation();
            setShowCrypto(!showCrypto);
          }}
          onMouseDown={(e) => console.log('EMERGENCY: Crypto button mouse down', e)}
          style={{
            backgroundColor: '#1f2937',
            color: 'white', 
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🪙 CRYPTO PAYMENT ($25)
        </button>

        <br />

        <button 
          onClick={(e) => {
            console.log('EMERGENCY: PayPal button clicked!', e);
            alert('PayPal button works!');
            e.stopPropagation();
            setShowPayPal(!showPayPal);
          }}
          onMouseDown={(e) => console.log('EMERGENCY: PayPal button mouse down', e)}
          style={{
            backgroundColor: '#0070ba',
            color: 'white',
            padding: '12px 24px', 
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          💳 PAYPAL PAYMENT ($25)
        </button>
      </div>

      {showCrypto && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          width: '400px',
          color: 'black'
        }}>
          <h3>🪙 Crypto Payment - Basic Report ($25)</h3>
          <p>Send USDC to this address:</p>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            margin: '10px 0',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            <QRCode 
              value="0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79" 
              size={200}
              style={{ margin: '0 auto' }}
            />
            <p style={{ 
              fontSize: '12px', 
              fontFamily: 'monospace',
              marginTop: '10px',
              wordBreak: 'break-all'
            }}>
              0x9686beb7a2Dfd4D3362452DD1EB99a6fDFE30E79
            </p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              <strong>Amount: $25 USDC (Polygon Network)</strong>
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => {
                alert('Payment confirmation received! Your report will be generated.');
                console.log('Crypto payment confirmed');
                setShowCrypto(false);
              }}
              style={{
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              ✅ I've Sent Payment
            </button>
            <button 
              onClick={() => setShowCrypto(false)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white', 
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPayPal && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          width: '400px',
          color: 'black'
        }}>
          <h3>💳 PayPal Payment - Basic Report ($25)</h3>
          <PayPalScriptProvider options={{
            "client-id": "test", // Replace with actual client ID from environment
            currency: "USD"
          }}>
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: "25.00"
                    },
                    description: "Basic Property Report - Costa Rica MLS"
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  alert(`Payment completed by ${details.payer.name.given_name}!`);
                  console.log('Payment details:', details);
                  setShowPayPal(false);
                });
              }}
              onError={(err) => {
                console.error('PayPal error:', err);
                alert('Payment failed. Please try again.');
              }}
              onCancel={() => {
                console.log('Payment cancelled');
                alert('Payment cancelled');
              }}
            />
          </PayPalScriptProvider>
          <button 
            onClick={() => setShowPayPal(false)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#ccc',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default SimplePaymentTest;
import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PropertyPayPalPaymentProps {
  amount: number;
  description: string;
  propertyId: string;
  serviceType: 'contact' | 'concession' | 'history';
  onSuccess: () => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PropertyPayPalPayment: React.FC<PropertyPayPalPaymentProps> = ({
  amount,
  description,
  propertyId,
  serviceType,
  onSuccess,
  onError,
  onCancel
}) => {
  return (
    <div className="w-full">
      <PayPalScriptProvider 
        options={{
          "client-id": "test", // TODO: Replace with real PayPal client ID
          currency: "USD",
          intent: "capture"
        }}
      >
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 40
          }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2),
                  currency_code: "USD"
                },
                description: description,
                custom_id: `${propertyId}-${serviceType}`,
                reference_id: propertyId
              }],
              application_context: {
                shipping_preference: "NO_SHIPPING"
              }
            });
          }}
          onApprove={async (data, actions) => {
            try {
              const details = await actions.order.capture();
              console.log('PayPal payment successful:', details);
              
              // Here you would typically send the payment details to your backend
              // For now, we'll just call the success callback
              onSuccess();
            } catch (error) {
              console.error('PayPal capture error:', error);
              onError(error);
            }
          }}
          onError={(err) => {
            console.error('PayPal payment error:', err);
            onError(err);
          }}
          onCancel={() => {
            console.log('PayPal payment cancelled');
            if (onCancel) onCancel();
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PropertyPayPalPayment;
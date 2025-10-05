import React, { useEffect, useRef } from 'react';

interface PayPalPaymentProps {
  type: 'individual_subscription' | 'office_subscription' | 'individual_onetime' | 'office_onetime';
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({ type, onSuccess, onError }) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // PayPal configuration based on payment type
    const config = {
      individual_subscription: {
        containerId: 'paypal-individual-subscription',
        planId: 'P-12W6852680972851UNDQ3SWQ',
        isSubscription: true,
        description: 'Individual Agent - $30/month'
      },
      office_subscription: {
        containerId: 'paypal-office-subscription', 
        planId: 'P-38787126Y9243002ENDQ3ZGI',
        isSubscription: true,
        description: 'Office Plan - $100/month'
      },
      individual_onetime: {
        containerId: 'paypal-individual-onetime',
        paymentUrl: 'https://www.paypal.com/ncp/payment/6C24XL9TFH9W6',
        isSubscription: false,
        description: 'Individual Agent - $30 (1 month)'
      },
      office_onetime: {
        containerId: 'paypal-office-onetime',
        paymentUrl: 'https://www.paypal.com/ncp/payment/K9FD8T9LSK6UJ', 
        isSubscription: false,
        description: 'Office Plan - $100 (1 month)'
      }
    }[type];

    // Load PayPal SDK if not already loaded
    if (!window.paypal && config.isSubscription) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=ASmvU1Q4s4Usoe7eDuwmVyWC6I1H-O7Sm10dy2bv5Al2rUq824OVmCezuLQ6MsAEdf-oLqTegFCRrduA&vault=true&intent=subscription';
      script.onload = () => {
        renderPayPalButton();
      };
      document.body.appendChild(script);
    } else if (window.paypal && config.isSubscription) {
      renderPayPalButton();
    }

    function renderPayPalButton() {
      if (!paypalRef.current || !config.isSubscription) return;

      // Clear any existing buttons
      paypalRef.current.innerHTML = '';

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(_data: any, actions: any) {
          return actions.subscription.create({
            plan_id: config.planId
          });
        },
        onApprove: function(data: any, _actions: any) {
          console.log('PayPal subscription approved:', data.subscriptionID);
          onSuccess?.({
            subscriptionId: data.subscriptionID,
            type: 'subscription',
            plan: type
          });
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          onError?.(err);
        }
      }).render(paypalRef.current);
    }
  }, [type, onSuccess, onError]);

  const handleOneTimePayment = () => {
    const config = {
      individual_onetime: {
        paymentUrl: 'https://www.paypal.com/ncp/payment/6C24XL9TFH9W6',
        description: 'Individual Agent - $30 (1 month)'
      },
      office_onetime: {
        paymentUrl: 'https://www.paypal.com/ncp/payment/K9FD8T9LSK6UJ',
        description: 'Office Plan - $100 (1 month)'
      }
    }[type as 'individual_onetime' | 'office_onetime'];

    if (config) {
      window.open(config.paymentUrl, '_blank');
      // Simulate success after user returns (in a real app, you'd verify payment)
      setTimeout(() => {
        onSuccess?.({
          paymentUrl: config.paymentUrl,
          type: 'onetime',
          plan: type
        });
      }, 2000);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'individual_subscription':
        return '💳 Individual Agent Subscription';
      case 'office_subscription':
        return '💳 Office Plan Subscription';
      case 'individual_onetime':
        return '💳 Individual Agent (One-Time)';
      case 'office_onetime':
        return '💳 Office Plan (One-Time)';
      default:
        return '💳 PayPal Payment';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'individual_subscription':
        return '$30/month - Recurring subscription with unlimited downloads';
      case 'office_subscription':
        return '$100/month - Up to 5 agents, unlimited downloads';
      case 'individual_onetime':
        return '$30 for 1 month access - No recurring charges';
      case 'office_onetime':
        return '$100 for 1 month access - Up to 5 agents';
      default:
        return '';
    }
  };

  const isSubscription = type.includes('subscription');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-2">{getTitle()}</h4>
      <p className="text-sm text-gray-600 mb-4">{getDescription()}</p>
      
      {isSubscription ? (
        <div ref={paypalRef} className="min-h-[50px]">
          {/* PayPal button will be rendered here */}
        </div>
      ) : (
        <button
          onClick={handleOneTimePayment}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>💳</span>
          Pay with PayPal
        </button>
      )}
      
      {isSubscription && (
        <div className="text-xs text-gray-500 mt-2">
          ✅ Automatic monthly billing<br />
          ✅ Cancel anytime<br />
          ✅ Immediate access
        </div>
      )}
      
      {!isSubscription && (
        <div className="text-xs text-gray-500 mt-2">
          ✅ One-time payment only<br />
          ✅ 30-day access<br />
          ✅ No recurring charges
        </div>
      )}
    </div>
  );
};

// Extend Window interface for PayPal
declare global {
  interface Window {
    paypal: any;
  }
}

export default PayPalPayment;
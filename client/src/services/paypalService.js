import paypal from '@paypal/checkout-server-sdk';
import { config } from '../config';

// PayPal client setup
const environment = new paypal.core.SandboxEnvironment(
  config.paypal.clientId,
  config.paypal.clientSecret
);
const client = new paypal.core.PayPalHttpClient(environment);

export const createOrder = async (propertyCID) => {
  const request = new paypal.orders.OrdersCreateRequest();
  
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '5.50'
      },
      custom_id: propertyCID,
      description: `Property Listing: ${propertyCID}`
    }],
    metadata: { propertyCID }
  });

  const response = await client.execute(request);
  return response.result.id;
};

export const capturePayment = async (orderId) => {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  
  const response = await client.execute(request);
  return response.result.status === 'COMPLETED';
};

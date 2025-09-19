import axios from 'axios';

export const createPayPalOrder = async (propertyCID) => {
  try {
    // This would be called when user selects PayPal payment
    const response = await axios.post('/api/payments/create-paypal-order', {
      propertyCID
    });
    
    return response.data.orderId;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

export const capturePayPalPayment = async (orderId) => {
  try {
    const response = await axios.post('/api/payments/capture-paypal-payment', {
      orderId
    });
    
    return response.data.success;
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
};

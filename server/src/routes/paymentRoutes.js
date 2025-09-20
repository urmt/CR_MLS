import express from 'express';
import { createOrder, capturePayment } from '../services/paypalService';
import { verifyPayPalWebhook } from '../middleware/verifyWebhook';

const router = express.Router();

// PayPal webhook endpoint
router.post('/paypal-webhook', verifyPayPalWebhook, async (req, res) => {
  try {
    const { propertyCID } = req.body.metadata;
    const paymentId = req.body.resource.id;
    
    // Process payment conversion
    // This would call your fiat-to-crypto conversion service
    console.log(`Received PayPal payment for property ${propertyCID}, payment ID: ${paymentId}`);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('PayPal webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Create PayPal order endpoint
router.post('/create-paypal-order', async (req, res) => {
  try {
    const { propertyCID } = req.body;
    const orderId = await createOrder(propertyCID);
    res.json({ orderId });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Capture PayPal payment endpoint
router.post('/capture-paypal-payment', async (req, res) => {
  try {
    const { orderId } = req.body;
    const success = await capturePayment(orderId);
    res.json({ success });
  } catch (error) {
    console.error('PayPal payment capture error:', error);
    res.status(500).json({ error: 'Failed to capture PayPal payment' });
  }
});

export default router;


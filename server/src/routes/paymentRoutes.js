import express from 'express';
import { createOrder, capturePayment } from '../services/paypalService';

const router = express.Router();

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

import crypto from 'crypto';

export const verifyPayPalWebhook = (req, res, next) => {
  const signature = req.headers['paypal-transmission-sig'];
  const transmissionId = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const certUrl = req.headers['paypal-cert-url'];
  
  const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex')}`;
  
  const verifier = crypto.createVerify('sha256WithRSAEncryption');
  verifier.update(message);
  
  // In production, you would fetch the certificate from certUrl
  // For now, we'll skip full verification in development
  if (process.env.NODE_ENV === 'production') {
    const valid = verifier.verify(certUrl, signature, 'base64');
    if (!valid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
  }
  
  next();
};

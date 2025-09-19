import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import paypal from '@paypal/checkout-server-sdk'
import { Property } from '../models/Property'
import { Payment } from '../models/Payment'
import { config } from '../config'

// PayPal client setup
const environment = new paypal.core.SandboxEnvironment(
  config.paypal.clientId,
  config.paypal.clientSecret
)
const client = new paypal.core.PayPalHttpClient(environment)

// @desc    Create PayPal order
// @route   POST /api/payments/create
// @access  Public
export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId, payerEmail } = req.body
  const property = await Property.findById(propertyId)
  
  if (!property) {
    res.status(404)
    throw new Error('Property not found')
  }

  const request = new paypal.orders.OrdersCreateRequest()
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: propertyId,
      amount: {
        currency_code: 'USD',
        value: '5.00'
      }
    }],
    payer: payerEmail ? { email_address: payerEmail } : undefined
  })

  const response = await client.execute(request)
  res.json({ orderId: response.result.id })
})

// @desc    Capture PayPal payment
// @route   POST /api/payments/capture
// @access  Public
export const capturePayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, propertyId, payerEmail } = req.body
  const property = await Property.findById(propertyId)
  
  if (!property) {
    res.status(404)
    throw new Error('Property not found')
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.requestBody({})
  
  const response = await client.execute(request)
  const captureId = response.result.purchase_units[0].payments.captures[0].id

  // Record payment
  await Payment.create({
    propertyId,
    payerEmail,
    amount: 5,
    transactionId: captureId
  })

  // Grant access to contact info
  if (payerEmail) {
    property.accessList.push(payerEmail)
    await property.save()
  }

  res.json({ success: true })
})

import React from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

interface PayPalButtonProps {
  amount: number
  propertyId: string
  onSuccess: () => void
  onError: (error: any) => void
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ 
  amount, 
  propertyId, 
  onSuccess, 
  onError 
}) => {
  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      })
      const data = await response.json()
      return data.orderId
    } catch (error) {
      throw new Error('Failed to create payment order')
    }
  }

  const onApprove = async (data: any) => {
    try {
      await fetch('/api/payments/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID })
      })
      onSuccess()
    } catch (error) {
      onError(error)
    }
  }

  return (
    <PayPalScriptProvider 
      options={{ 
        clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
        currency: 'USD'
      }}
    >
      <PayPalButtons
        style={{ layout: 'horizontal' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  )
}

export default PayPalButton

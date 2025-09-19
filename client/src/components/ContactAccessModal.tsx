import React, { useState } from 'react'
import PayPalButton from './PayPalButton'

interface ContactAccessModalProps {
  propertyId: string
  price: number
  onSuccess: (email: string) => void
  onClose: () => void
}

const ContactAccessModal: React.FC<ContactAccessModalProps> = ({
  propertyId,
  price,
  onSuccess,
  onClose
}) => {
  const [email, setEmail] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Get Contact Information</h2>
        <p className="mb-4">
          Pay ${price} to access the contact information for this property.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Your Email (for access)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="mb-4">
          <PayPalButton 
            amount={price}
            propertyId={propertyId}
            payerEmail={email}
            onSuccess={() => onSuccess(email)}
            onError={(error) => console.error('Payment error:', error)}
          />
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ContactAccessModal

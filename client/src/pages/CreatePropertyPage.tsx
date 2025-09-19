import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrbitDB } from '../contexts/OrbitDBContext';
import PropertyForm from '../components/PropertyForm';
import PaymentOptions from '../components/PaymentOptions';
import { generateCID } from '../utils/ipfsUtils';

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const { db } = useOrbitDB();
  const [propertyData, setPropertyData] = useState(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [cid, setCid] = useState('');

  const handleSubmit = async (data) => {
    // Generate CID for the property data
    const propertyCID = await generateCID(data);
    setCid(propertyCID);
    
    // Save data temporarily with CID
    setPropertyData({ ...data, cid: propertyCID });
    setPaymentStep(true);
  };

  const handlePaymentSuccess = async () => {
    // Add to OrbitDB after payment
    await db.put(cid, propertyData);
    navigate(`/property/${cid}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">List a New Property</h1>
      
      {!paymentStep ? (
        <PropertyForm onSubmit={handleSubmit} />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Complete Listing</h2>
          <p className="mb-6">
            Pay a small fee to publish your property listing permanently. 
            Crypto payments are cheaper and processed instantly.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-blue-800 mb-2">Your Property CID:</h3>
            <code className="break-all text-sm">{cid}</code>
          </div>
          
          <PaymentOptions 
            propertyCID={cid} 
            onSuccess={handlePaymentSuccess} 
          />
          
          <button
            onClick={() => setPaymentStep(false)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to property details
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatePropertyPage;

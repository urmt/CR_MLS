#!/usr/bin/env node

// Test script for EmailJS configuration
// Run: node scripts/test-emailjs.js

const axios = require('axios');

// Your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_6ugwtxp';
const EMAILJS_TEMPLATE_ID = 'template_4utmu3q';  
const EMAILJS_PUBLIC_KEY = 'jLhgILj-InZ13jqzk';

async function testEmailJS() {
  console.log('🧪 Testing EmailJS configuration...\n');

  const testData = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email: 'test@example.com', // This will use the default recipient from your template
      to_name: 'Test User',
      subject: 'New Properties Available',
      category_name: 'Residential Properties',
      property_count: 3,
      properties_summary: `1. Beautiful House - $250,000 - San Jose, Costa Rica
2. Modern Condo - $180,000 - Escazu, Costa Rica  
3. Beach Front Villa - $450,000 - Guanacaste, Costa Rica`,
      pdf_url: 'https://example.com/sample-properties.pdf',
      generated_date: new Date().toLocaleDateString()
    }
  };

  try {
    console.log('📧 Sending test email...');
    
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ SUCCESS! Test email sent successfully!');
      console.log('📧 Check your inbox for the test email.');
      console.log('\n🎉 EmailJS is configured correctly!');
    } else {
      console.log('❌ FAILED: Unexpected response status:', response.status);
    }

  } catch (error) {
    console.log('❌ FAILED: Error sending test email');
    console.log('Error details:', error.response?.data || error.message);
    console.log('\n💡 Check your credentials:');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);  
    console.log('Public Key:', EMAILJS_PUBLIC_KEY.substring(0, 10) + '...');
  }
}

// Validate credentials first
if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID_HERE' || 
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID_HERE' || 
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY_HERE') {
  
  console.log('❌ Please update the credentials in this file first!');
  console.log('Edit scripts/test-emailjs.js and replace:');
  console.log('- YOUR_SERVICE_ID_HERE with your actual Service ID');
  console.log('- YOUR_TEMPLATE_ID_HERE with your actual Template ID');
  console.log('- YOUR_PUBLIC_KEY_HERE with your actual Public Key');
  console.log('- your-test-email@example.com with your real email');
  process.exit(1);
}

testEmailJS();
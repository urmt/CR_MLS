const axios = require('axios');
const Web3 = require('web3');
const contractAbi = require('./PropertyEscrowAbi.json');

// Environment variables
const PAYPAL_API_KEY = process.env.PAYPAL_API_KEY;
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;
const POLYGON_RPC = process.env.POLYGON_RPC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const web3 = new Web3(POLYGON_RPC);
const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const paymentId = body.resource.id;
  const propertyCID = body.metadata.propertyCID;

  try {
    // 1. Verify PayPal payment
    const payment = await axios.get(
      `https://api.paypal.com/v2/payments/${paymentId}`, 
      { headers: { Authorization: `Bearer ${PAYPAL_API_KEY}` } }
    );
    
    // 2. Convert USD to USDC
    const usdcAmount = payment.data.amount * 0.98; // 2% fee
    const coinbaseRes = await axios.post(
      'https://api.coinbase.com/v2/transactions',
      { amount: usdcAmount, currency: 'USDC' },
      { headers: { 'Authorization': `Bearer ${COINBASE_API_KEY}` } }
    );
    
    // 3. Call smart contract
    const txData = contract.methods.payWithFiat(propertyCID).encodeABI();
    const tx = {
      from: account.address,
      to: CONTRACT_ADDRESS,
      data: txData,
      gas: 200000
    };
    
    const signedTx = await account.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, txHash: receipt.transactionHash })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

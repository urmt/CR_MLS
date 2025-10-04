#!/bin/bash

# Deploy Lambda function
aws lambda create-function \
  --function-name PayPalConverter \
  --runtime nodejs18.x \
  --handler paypal-converter.handler \
  --zip-file fileb://serverless/paypal-converter.zip \
  --environment Variables=$(
    jq -n \
    --arg pp "$PAYPAL_API_KEY" \
    --arg cb "$COINBASE_API_KEY" \
    --arg rpc "$POLYGON_RPC" \
    --arg addr "$CONTRACT_ADDRESS" \
    --arg pk "$PRIVATE_KEY" \
    '{
      PAYPAL_API_KEY: $pp,
      COINBASE_API_KEY: $cb,
      POLYGON_RPC: $rpc,
      CONTRACT_ADDRESS: $addr,
      PRIVATE_KEY: $pk
    }' | jq -c
  )

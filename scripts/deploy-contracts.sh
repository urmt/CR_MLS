#!/bin/bash

# Deploy contract
npx hardhat run scripts/deploy.js --network polygon

# Verify contract
npx hardhat verify --network polygon \
  $CONTRACT_ADDRESS

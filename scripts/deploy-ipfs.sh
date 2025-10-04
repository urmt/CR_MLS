#!/bin/bash

# Build client
cd client
npm install
npm run build

# Install IPFS if not installed
if ! command -v ipfs &> /dev/null; then
  echo "IPFS not found. Installing..."
  wget https://dist.ipfs.tech/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz
  tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
  cd kubo
  sudo ./install.sh
  cd ..
fi

# Start IPFS daemon if not running
if ! pgrep -x "ipfs" > /dev/null; then
  echo "Starting IPFS daemon..."
  ipfs daemon --init > /dev/null 2>&1 &
  sleep 10 # Wait for daemon to start
fi

# Add build directory to IPFS
echo "Adding build to IPFS..."
hash=$(ipfs add -r dist -Q)

# Pin to our own node
echo "Pinning content..."
ipfs pin add $hash

# Publish to IPNS
echo "Publishing to IPNS..."
ipns_key=$(ipfs key list -l | grep 'my-ipns-key' | cut -d' ' -f1)
if [ -z "$ipns_key" ]; then
  ipns_key=$(ipfs key gen my-ipns-key --type=rsa --size=2048)
fi

ipfs name publish --key=my-ipns-key $hash

echo "Deployed to IPFS:"
echo "https://ipfs.io/ipfs/$hash"
echo "IPNS address:"
echo "https://ipfs.io/ipns/$ipns_key"

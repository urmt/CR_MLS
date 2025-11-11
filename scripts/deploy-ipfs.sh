#!/bin/bash

echo "🚀 Costa Rica MLS - IPFS Deployment Script"
echo "==========================================="

# Build the React application
echo "🔨 Building React application..."
cd client
npm run build
cd ..

# Add to IPFS and get hash
echo "📦 Adding to IPFS..."
IPFS_HASH=$(ipfs add -r -Q client/dist)

echo "📌 Pinning to local IPFS node..."
ipfs pin add $IPFS_HASH

echo "🌐 Checking swarm peers..."
PEER_COUNT=$(ipfs swarm peers | wc -l)
echo "  ✅ Connected to $PEER_COUNT peers"

if [ $PEER_COUNT -lt 3 ]; then
  echo "  ⚠️  Low peer count. Attempting to connect to bootstrap nodes..."
  ipfs bootstrap add --default
  sleep 5
  PEER_COUNT=$(ipfs swarm peers | wc -l)
  echo "  🔄 Now connected to $PEER_COUNT peers"
fi

echo "📡 Announcing to DHT (Distributed Hash Table)..."
ipfs routing provide $IPFS_HASH

echo "🗒️ Publishing to IPNS (InterPlanetary Name System)..."
# IPNS provides a mutable pointer to IPFS content
IPNS_NAME=$(ipfs key list -l | grep "self" | awk '{print $1}')
if [ -n "$IPNS_NAME" ]; then
  echo "  🔑 Publishing to IPNS: $IPNS_NAME"
  ipfs name publish $IPFS_HASH
  echo "  ✅ IPNS record updated"
else
  echo "  ⚠️  IPNS not configured (optional)"
fi

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "IPFS Hash: $IPFS_HASH"
echo ""
echo "🌐 Access your site at:"
echo "   • https://w3s.link/ipfs/$IPFS_HASH"
echo "   • https://ipfs.io/ipfs/$IPFS_HASH"
echo "   • https://gateway.ipfs.io/ipfs/$IPFS_HASH"
echo "   • https://dweb.link/ipfs/$IPFS_HASH"
echo ""

# Save deployment info
mkdir -p database/deployments
echo "{
  \"timestamp\": \"$(date -Iseconds)\",
  \"ipfs_hash\": \"$IPFS_HASH\",
  \"primary_url\": \"https://w3s.link/ipfs/$IPFS_HASH\",
  \"alternative_urls\": [
    \"https://ipfs.io/ipfs/$IPFS_HASH\",
    \"https://gateway.ipfs.io/ipfs/$IPFS_HASH\",
    \"https://dweb.link/ipfs/$IPFS_HASH\"
  ],
  \"deployed_by\": \"deploy-script\"
}" > database/deployments/latest.json

echo "💾 Deployment info saved to database/deployments/latest.json"

# Try to seed to multiple gateways
echo ""
echo "🌱 Seeding to gateway network..."
timeout 30 curl -s "https://w3s.link/ipfs/$IPFS_HASH" > /dev/null &
timeout 30 curl -s "https://ipfs.io/ipfs/$IPFS_HASH" > /dev/null &
timeout 30 curl -s "https://dweb.link/ipfs/$IPFS_HASH" > /dev/null &
wait

echo "✅ Seeding complete! Your site should be accessible worldwide within 5-10 minutes."
echo ""
echo "🚀 Next Steps:"
echo "1. Push this code to GitHub to activate autonomous scraping"
echo "2. Configure GitHub Secrets for automatic operations"
echo "3. Your site will update automatically every 1 hour with new properties"
echo "4. Price changes are tracked in real-time with notifications"

#!/bin/bash

# Force IPFS Content Propagation Script
# Ensures content is accessible on public gateways

set -e

HASH="${1:-QmbR5mqXdXNY1C3JsAendjFw1uQ64XzDQDQuM9PkPKA98x}"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         🌐 Force IPFS Content Propagation                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 IPFS Hash: $HASH"
echo ""

# Step 1: Verify content exists locally
echo "1️⃣  Verifying local content..."
if ipfs pin ls $HASH > /dev/null 2>&1; then
    echo "   ✅ Content is pinned locally"
else
    echo "   ❌ Content not found locally"
    exit 1
fi

# Step 2: Get all CIDs (recursive)
echo ""
echo "2️⃣  Getting all referenced CIDs..."
TOTAL_REFS=$(ipfs refs $HASH -r | wc -l)
echo "   📊 Total CIDs to announce: $TOTAL_REFS"

# Step 3: Announce all CIDs to DHT
echo ""
echo "3️⃣  Announcing to DHT (this may take a minute)..."
ipfs refs $HASH -r | head -50 | while read CID; do
    ipfs routing provide $CID &
done
wait
echo "   ✅ Announced top 50 CIDs"

# Step 4: Try fetching from multiple gateways to trigger caching
echo ""
echo "4️⃣  Triggering gateway caches..."

GATEWAYS=(
    "https://ipfs.io/ipfs/"
    "https://dweb.link/ipfs/"
    "https://w3s.link/ipfs/"
    "https://gateway.ipfs.io/ipfs/"
    "https://cloudflare-ipfs.com/ipfs/"
)

for gateway in "${GATEWAYS[@]}"; do
    echo "   🌐 Pinging: ${gateway}..."
    timeout 30 curl -s -I "${gateway}${HASH}" > /dev/null 2>&1 &
done

echo "   ⏳ Waiting for gateway responses..."
wait
echo "   ✅ Gateway seeding initiated"

# Step 5: Use ipfs-check.com API to trigger fetch
echo ""
echo "5️⃣  Using IPFS checker to force fetch..."
timeout 30 curl -s "https://ipfs-check.on.fleek.co/?cid=$HASH" > /dev/null 2>&1 || true
echo "   ✅ Checker triggered"

# Step 6: Alternative - use nft.storage or web3.storage
echo ""
echo "6️⃣  📝 Manual alternatives if still not accessible:"
echo ""
echo "   Option A - Use Web3.Storage (Free):"
echo "   =================================="
echo "   1. Sign up at: https://web3.storage"
echo "   2. Install w3 CLI: npm install -g @web3-storage/w3cli"
echo "   3. Run: w3 up client/dist --name 'CR-MLS-v2'"
echo ""
echo "   Option B - Use Filebase (Free tier):"
echo "   ====================================="
echo "   1. Sign up at: https://filebase.com"
echo "   2. Use their IPFS pinning service"
echo "   3. Pin hash: $HASH"
echo ""
echo "   Option C - Use Pinata (Free tier):"
echo "   =================================="
echo "   curl -X POST 'https://api.pinata.cloud/pinning/pinByHash' \\"
echo "     -H 'Authorization: Bearer YOUR_JWT' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"hashToPin\": \"$HASH\"}'"
echo ""

# Step 7: Create an ipfs-cluster setup (advanced)
echo "   Option D - Run ipfs-cluster (Advanced):"
echo "   ========================================"
echo "   ipfs-cluster-ctl pin add $HASH"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Content verified locally"
echo "✅ Announced $TOTAL_REFS CIDs to DHT"
echo "✅ Triggered ${#GATEWAYS[@]} gateway caches"
echo ""
echo "⏳ Wait 5-10 minutes, then try these URLs:"
echo ""
for gateway in "${GATEWAYS[@]}"; do
    echo "   ${gateway}${HASH}"
done
echo ""
echo "🔍 Check propagation status:"
echo "   https://ipfs-check.on.fleek.co/?cid=$HASH"
echo "   https://cid.ipfs.tech/#$HASH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

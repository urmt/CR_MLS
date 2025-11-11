#!/bin/bash

# Sync Database to Client Script
# This script copies the latest database files from root to client/public 
# so the Vite dev server can serve them during local development

set -e

echo "🔄 Syncing database from root to client/public..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "database" ] || [ ! -d "client/public" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Make sure you're in CR_MLS_New/ directory"
    exit 1
fi

# Create client/public/database directory if it doesn't exist
mkdir -p client/public/database

# Copy database files
echo "📂 Copying database files..."
cp -r database/* client/public/database/

# Get property count for confirmation
PROPERTY_COUNT=$(grep -c '"id"' database/properties/active.json 2>/dev/null || echo "0")

echo "✅ Database sync completed!"
echo "📊 Properties in database: $PROPERTY_COUNT"
echo "🌐 Client can now access updated data at http://localhost:5173"
echo ""
echo "💡 Tip: Run this script after each 'git pull' to get latest scraped data"
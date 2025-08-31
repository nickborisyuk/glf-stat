#!/bin/bash

echo "🚀 Starting deployment process..."

# Update version
echo "📝 Updating version..."
cd /Users/nb/G/sandbox/glf-stat
node update-version.js

# Get current version from version.json
CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('version.json')).version)")

# Clear any existing data from the most recent API before deployment
echo "🧹 Clearing existing data from recent API..."
RECENT_API=$(vercel ls --prod | grep glf-stat | head -1 | awk '{print $2}')
if [ -n "$RECENT_API" ]; then
    echo "🧹 Clearing data from: $RECENT_API"
    curl -X POST "$RECENT_API/api/clear-all-data" > /dev/null 2>&1 || true
    echo "✅ Existing data cleared"
else
    echo "⚠️ No recent API found to clear"
fi

# Deploy backend
echo "📦 Deploying backend..."
DEPLOY_OUTPUT=$(vercel --prod --force)
echo "$DEPLOY_OUTPUT"

# Extract the backend URL from deployment output
BACKEND_URL=$(echo "$DEPLOY_OUTPUT" | grep "Production:" | awk '{print $2}')
echo "🔗 Backend URL: $BACKEND_URL"

# If backend URL is empty, try alternative method
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ Could not get backend URL from deployment output, trying vercel ls..."
    BACKEND_URL=$(vercel ls --prod | grep glf-stat | head -1 | awk '{print $2}')
    echo "🔗 Backend URL (from vercel ls): $BACKEND_URL"
fi

# If still empty, try another alternative
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ Could not get backend URL from vercel ls, trying alternative method..."
    BACKEND_URL=$(vercel ls --prod | grep -E "https://glf-stat-.*\.vercel\.app" | head -1 | awk '{print $2}')
    echo "🔗 Backend URL (alternative): $BACKEND_URL"
fi

# If still empty, try to extract from the last line of deployment output
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ Could not get backend URL from deployment output, trying last line of output..."
    BACKEND_URL=$(echo "$DEPLOY_OUTPUT" | tail -1 | grep -E "https://glf-stat-.*\.vercel\.app")
    echo "🔗 Backend URL (from last line): $BACKEND_URL"
fi

# If still empty, try to extract from any line containing the URL
if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ Could not get backend URL from last line, trying any line with URL..."
    BACKEND_URL=$(echo "$DEPLOY_OUTPUT" | grep -E "https://glf-stat-.*\.vercel\.app" | head -1)
    echo "🔗 Backend URL (from any line): $BACKEND_URL"
fi

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Verify backend version
echo "🔍 Verifying backend version..."
BACKEND_VERSION_RESPONSE=$(curl -s "$BACKEND_URL/api/version")
if [ $? -eq 0 ] && [ -n "$BACKEND_VERSION_RESPONSE" ]; then
    BACKEND_VERSION=$(echo "$BACKEND_VERSION_RESPONSE" | node -e "console.log(JSON.parse(require('fs').readFileSync(0)).version)")
    echo "📊 Backend version: $BACKEND_VERSION"
else
    echo "❌ Failed to get backend version. Response: $BACKEND_VERSION_RESPONSE"
    BACKEND_VERSION=""
fi

if [ "$BACKEND_VERSION" != "$CURRENT_VERSION" ]; then
    echo "❌ Backend version mismatch! Expected: $CURRENT_VERSION, Got: $BACKEND_VERSION"
    echo "🔄 Redeploying backend..."
    vercel --prod --force
    sleep 10
    BACKEND_VERSION_RESPONSE=$(curl -s "$BACKEND_URL/api/version")
    if [ $? -eq 0 ] && [ -n "$BACKEND_VERSION_RESPONSE" ]; then
        BACKEND_VERSION=$(echo "$BACKEND_VERSION_RESPONSE" | node -e "console.log(JSON.parse(require('fs').readFileSync(0)).version)")
        echo "📊 Backend version after redeploy: $BACKEND_VERSION"
    else
        echo "❌ Failed to get backend version after redeploy"
        BACKEND_VERSION=""
    fi
fi

# Deploy frontend
echo "📱 Deploying frontend..."
cd client

# Note: Environment variable needs to be set manually
echo "🔧 Backend URL for environment variable: $BACKEND_URL/api"
echo "⚠️  IMPORTANT: Set VITE_API_URL=$BACKEND_URL/api in Vercel dashboard manually"
echo "⚠️  Go to: https://vercel.com/dashboard -> glf-stat -> Settings -> Environment Variables"

vercel --prod --force

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

# Get frontend URL
FRONTEND_URL=$(vercel ls --prod | grep glf-stat | head -1 | awk '{print $2}')
echo "🌐 Frontend URL: $FRONTEND_URL"

# Verify version synchronization
echo "🔍 Verifying version synchronization..."
echo "📊 Expected version: $CURRENT_VERSION"
echo "📊 Backend version: $BACKEND_VERSION"

# Test API connectivity from frontend
echo "🧪 Testing API connectivity..."
API_TEST=$(curl -s "$BACKEND_URL/api/version")
if [ $? -eq 0 ]; then
    echo "✅ API is accessible"
else
    echo "❌ API is not accessible"
fi

echo "✅ Deployment completed!"
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔗 Backend: $BACKEND_URL"

echo ""
echo "🧪 Testing functionality..."
echo "📝 Creating test players and rounds..."

# Create test data for verification
echo "👤 Creating test players..."
curl -X POST "$BACKEND_URL/api/players" -H "Content-Type: application/json" -d '{"name":"Test1","color":"#3B82F6"}' > /dev/null 2>&1
curl -X POST "$BACKEND_URL/api/players" -H "Content-Type: application/json" -d '{"name":"Test2","color":"#EF4444"}' > /dev/null 2>&1

echo "🏌️ Creating test round..."
ROUND_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/rounds" -H "Content-Type: application/json" -d '{"date":"2024-01-16","course":"МГК","courseType":"championship","playerIds":["BK78hhng4V","-A15ewALgW"]}')

echo "✅ Test data created successfully!"

echo ""
echo "🧹 Clearing all test data..."

# Clear data with retry mechanism
CLEAR_ATTEMPTS=0
MAX_CLEAR_ATTEMPTS=3
CLEAR_SUCCESS=false

while [ $CLEAR_ATTEMPTS -lt $MAX_CLEAR_ATTEMPTS ] && [ "$CLEAR_SUCCESS" = false ]; do
    CLEAR_ATTEMPTS=$((CLEAR_ATTEMPTS + 1))
    echo "🧹 Clearing attempt $CLEAR_ATTEMPTS/$MAX_CLEAR_ATTEMPTS..."
    
    CLEAR_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/clear-all-data")
    if [ $? -eq 0 ] && echo "$CLEAR_RESPONSE" | grep -q "successfully"; then
        CLEAR_SUCCESS=true
        echo "✅ Data cleared successfully!"
    else
        echo "⚠️ Clear attempt $CLEAR_ATTEMPTS failed, retrying..."
        sleep 2
    fi
done

if [ "$CLEAR_SUCCESS" = false ]; then
    echo "❌ Failed to clear data after $MAX_CLEAR_ATTEMPTS attempts"
    exit 1
fi

# Verify data is actually cleared
echo "🔍 Verifying data is cleared..."
ROUNDS_COUNT=$(curl -s "$BACKEND_URL/api/rounds" | node -e "console.log(JSON.parse(require('fs').readFileSync(0)).length)")
PLAYERS_COUNT=$(curl -s "$BACKEND_URL/api/players" | node -e "console.log(JSON.parse(require('fs').readFileSync(0)).length)")

if [ "$ROUNDS_COUNT" = "0" ] && [ "$PLAYERS_COUNT" = "0" ]; then
    echo "✅ Verification successful: $ROUNDS_COUNT rounds, $PLAYERS_COUNT players"
else
    echo "❌ Verification failed: $ROUNDS_COUNT rounds, $PLAYERS_COUNT players still exist"
    exit 1
fi

echo "✅ All data cleared and verified! Ready for production use."

echo ""
echo "📋 Version Summary:"
echo "   Expected: $CURRENT_VERSION"
echo "   Backend:  $BACKEND_VERSION"
echo "   Status:   $(if [ "$BACKEND_VERSION" = "$CURRENT_VERSION" ]; then echo "✅ SYNCED"; else echo "❌ OUT OF SYNC"; fi)"

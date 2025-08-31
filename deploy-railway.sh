#!/bin/bash

echo "🚂 Starting Railway deployment process..."

# Update version
echo "📝 Updating version..."
node update-version.js

# Get current version from version.json
CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('version.json')).version)")

echo "📦 Current version: $CURRENT_VERSION"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway login status..."
if ! railway whoami &> /dev/null; then
    echo "⚠️  Please login to Railway:"
    echo "   1. Go to https://railway.app"
    echo "   2. Create an account or login"
    echo "   3. Run: railway login"
    echo ""
    echo "   Or set RAILWAY_TOKEN environment variable"
    exit 1
fi

echo "✅ Railway login confirmed"

# Check if project exists
echo "🔍 Checking Railway project..."
if ! railway project &> /dev/null; then
    echo "📁 Initializing Railway project..."
    railway init
fi

# Link to existing project if not linked
echo "🔗 Linking to Railway project..."
railway link

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Railway deployment completed!"

# Get service URLs
echo "🌐 Getting service URLs..."
API_URL=$(railway domain)
FRONTEND_URL=$(railway domain --service glf-stat-frontend 2>/dev/null || echo "Frontend will be deployed separately")

echo ""
echo "📋 Deployment Summary:"
echo "   Backend API: $API_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   Version: $CURRENT_VERSION"
echo ""
echo "🔧 Next steps:"
echo "   1. Go to https://railway.app/dashboard"
echo "   2. Check your service status"
echo "   3. Test the API endpoints"
echo "   4. Deploy frontend separately if needed"
echo ""
echo "🧪 Test API:"
echo "   curl $API_URL/api/health"
echo "   curl $API_URL/api/version"

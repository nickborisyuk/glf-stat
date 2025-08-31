#!/bin/bash

echo "🚀 Starting Render deployment process..."

# Update version
echo "📝 Updating version..."
node update-version.js

# Get current version from version.json
CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('version.json')).version)")

echo "📦 Current version: $CURRENT_VERSION"

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Installing..."
    curl -sL https://render.com/download-cli/install.sh | bash
    export PATH="$HOME/.render/bin:$PATH"
fi

# Login to Render (if not already logged in)
echo "🔐 Checking Render login status..."
if ! render whoami &> /dev/null; then
    echo "⚠️  Please login to Render:"
    echo "   1. Go to https://render.com"
    echo "   2. Create an account or login"
    echo "   3. Get your API key from https://render.com/docs/api"
    echo "   4. Run: render login"
    echo ""
    echo "   Or set RENDER_API_KEY environment variable"
    exit 1
fi

echo "✅ Render login confirmed"

# Deploy to Render
echo "🚀 Deploying to Render..."
render deploy

echo "✅ Render deployment completed!"

echo ""
echo "📋 Next steps:"
echo "   1. Go to https://render.com/dashboard"
echo "   2. Check your services: glf-stat-api and glf-stat-frontend"
echo "   3. Wait for deployment to complete"
echo "   4. Test the application"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: https://glf-stat-frontend.onrender.com"
echo "   Backend:  https://glf-stat-api.onrender.com"
echo ""
echo "📊 Version: $CURRENT_VERSION"

#!/bin/bash

echo "🚀 Starting Netlify deployment process..."

# Update version
echo "📝 Updating version..."
node update-version.js

# Get current version
CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('version.json')).version)")
echo "📦 Current version: $CURRENT_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify login status..."
if ! netlify status &> /dev/null; then
    echo "⚠️  Please login to Netlify:"
    echo "   1. Go to https://netlify.com"
    echo "   2. Create an account or login"
    echo "   3. Run: netlify login"
    echo ""
    echo "   Or set NETLIFY_AUTH_TOKEN environment variable"
    exit 1
fi

echo "✅ Netlify login confirmed"

# Check if site is linked
echo "🔗 Checking site link..."
if ! netlify status &> /dev/null; then
    echo "📁 Linking to Netlify site..."
    netlify link
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo "✅ Netlify deployment completed!"

# Get site URL
echo "🌐 Getting site URL..."
SITE_URL=$(netlify status | grep -o 'https://[^[:space:]]*' | head -1)

echo ""
echo "📋 Deployment Summary:"
echo "   Site URL: $SITE_URL"
echo "   Version: $CURRENT_VERSION"
echo ""
echo "🔧 Next steps:"
echo "   1. Go to https://app.netlify.com"
echo "   2. Check your site status"
echo "   3. Test the application"
echo ""
echo "🧪 Test API:"
echo "   curl $SITE_URL/.netlify/functions/api/health"
echo "   curl $SITE_URL/.netlify/functions/api/version"

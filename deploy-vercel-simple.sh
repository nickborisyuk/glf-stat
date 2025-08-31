#!/bin/bash

echo "🚀 Starting simple Vercel deployment..."

# Update version
echo "📝 Updating version..."
node update-version.js

# Get current version
CURRENT_VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('version.json')).version)")
echo "📦 Current version: $CURRENT_VERSION"

# Deploy backend API
echo "🔧 Deploying backend API..."
cd server
vercel --prod --force

# Get backend URL
BACKEND_URL=$(vercel --prod --force | grep -o 'https://[^[:space:]]*' | head -1)
echo "🌐 Backend URL: $BACKEND_URL"

# Deploy frontend
echo "🎨 Deploying frontend..."
cd ../client

# Set environment variable
echo "🔧 Setting API URL..."
vercel env add VITE_API_URL production
echo "$BACKEND_URL" | vercel env pull .env.local

# Deploy frontend
vercel --prod --force

echo "✅ Deployment completed!"
echo "🌐 Backend: $BACKEND_URL"
echo "📊 Version: $CURRENT_VERSION"

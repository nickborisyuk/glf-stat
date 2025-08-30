#!/bin/bash

echo "🏌️ Building GLF Stat Frontend..."

# Build the frontend
cd client
npm run build

echo "✅ Frontend built successfully!"
echo ""
echo "🚀 Deployment Options:"
echo ""
echo "1. Netlify (Easiest):"
echo "   - Go to https://netlify.com"
echo "   - Drag and drop the 'client/dist' folder"
echo "   - Set environment variable: VITE_API_URL=https://glf-stat.vercel.app/api"
echo ""
echo "2. Vercel (Separate Project):"
echo "   - cd client && vercel"
echo "   - Set environment variable: VITE_API_URL=https://glf-stat.vercel.app/api"
echo ""
echo "3. GitHub Pages:"
echo "   - Copy client/dist contents to /docs folder"
echo "   - Enable GitHub Pages in repository settings"
echo ""
echo "🌐 Your API is live at: https://glf-stat.vercel.app/api"
echo "📊 Health check: https://glf-stat.vercel.app/api/health"

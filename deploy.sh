#!/bin/bash

# GLF Stat Deployment Script
set -e

echo "🚀 Starting GLF Stat deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "prompt.txt" ]; then
    echo -e "${RED}Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building client...${NC}"
cd client
npm run build
cd ..

echo -e "${GREEN}✅ Client built successfully${NC}"

# Create deployment directory
DEPLOY_DIR="deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo -e "${YELLOW}📁 Preparing deployment files...${NC}"

# Copy server files
cp -r server $DEPLOY_DIR/
rm -rf $DEPLOY_DIR/server/node_modules

# Copy built client
cp -r client/dist $DEPLOY_DIR/client-dist

# Create deployment README
cat > $DEPLOY_DIR/README.md << 'EOF'
# GLF Stat Deployment

## Quick Start

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Set environment variables:
   ```bash
   export PORT=4000
   export NODE_ENV=production
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Serve the client (using nginx, Apache, or any static file server):
   ```bash
   # Example with Python
   cd ../client-dist
   python3 -m http.server 8080
   ```

## Deployment Options

### Option 1: Railway/Render (Recommended)
- Connect your GitHub repo
- Set build command: `cd server && npm install`
- Set start command: `cd server && npm start`
- Set static files: `client/dist` → `/`

### Option 2: Vercel
- Deploy server as serverless function
- Deploy client as static site

### Option 3: DigitalOcean App Platform
- Deploy as a containerized app
- Set build command: `./deploy.sh`
- Set run command: `cd server && npm start`

## Environment Variables
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (production/development)
- `CORS_ORIGIN`: Allowed origins for CORS
EOF

echo -e "${GREEN}✅ Deployment package created in '$DEPLOY_DIR'${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Upload the '$DEPLOY_DIR' folder to your hosting provider"
echo "2. Follow the README.md instructions in the deployment directory"
echo "3. Set up environment variables on your hosting platform"
echo ""
echo -e "${GREEN}🎉 Deployment package ready!${NC}"

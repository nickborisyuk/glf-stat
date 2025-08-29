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

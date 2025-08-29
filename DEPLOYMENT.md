# 🚀 GLF Stat Deployment Guide

Your golf statistics app is ready for deployment! Here are several options to make it accessible from anywhere.

## 📦 Quick Deployment Options

### Option 1: Railway (Recommended - Free Tier)
**Best for: Quick deployment with automatic HTTPS**

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub** repository
3. **Deploy settings:**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Root Directory: `/` (leave empty)
4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `4000` (or leave empty for auto-assignment)
5. **Static Files:** Upload the `client/dist` folder to serve the frontend

**Result:** Your app will be available at `https://your-app-name.railway.app`

### Option 2: Render (Free Tier)
**Best for: Simple deployment with good performance**

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub** repository
4. **Configure:**
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: `Node`
5. **Environment Variables:**
   - `NODE_ENV`: `production`

**Result:** Your app will be available at `https://your-app-name.onrender.com`

### Option 3: Vercel (Free Tier)
**Best for: Fast deployment with edge functions**

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import your GitHub** repository
3. **Framework Preset:** Other
4. **Build Command:** `cd client && npm run build`
5. **Output Directory:** `client/dist`
6. **Install Command:** `npm install`
7. **Root Directory:** Leave empty

**Result:** Your app will be available at `https://your-app-name.vercel.app`

### Option 4: Netlify (Free Tier)
**Best for: Static site hosting with serverless functions**

1. **Sign up** at [netlify.com](https://netlify.com)
2. **Deploy manually** by dragging the `client/dist` folder
3. **For the API:** Use Netlify Functions or deploy server separately

## 🔧 Manual Deployment

### Step 1: Build the Project
```bash
# Run the deployment script
./deploy.sh
```

### Step 2: Deploy Server
```bash
# Upload server folder to your hosting provider
cd deploy/server
npm install
npm start
```

### Step 3: Deploy Client
```bash
# Serve the client-dist folder with any static file server
cd deploy/client-dist
# Using Python
python3 -m http.server 8080
# Using Node.js
npx serve .
# Using nginx (copy files to /var/www/html)
```

## 🌐 Domain & HTTPS

### Custom Domain Setup
1. **Purchase a domain** (Namecheap, GoDaddy, etc.)
2. **Point DNS** to your hosting provider
3. **Enable HTTPS** (most providers do this automatically)

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-domain.com
```

## 📱 Mobile Access

### PWA Features (Optional)
To make it feel like a native app:

1. **Add to home screen** on iOS/Android
2. **Offline support** (requires service worker)
3. **Push notifications** (requires additional setup)

### iOS Safari Optimization
The app is already optimized for iPhone with:
- Safe area support
- Touch-friendly buttons
- Responsive design
- iOS-style UI

## 🔍 Monitoring & Maintenance

### Health Checks
Your server includes a health endpoint:
```
GET /health
```

### Logs
Monitor your application logs through your hosting provider's dashboard.

### Updates
To update your deployed app:
1. Push changes to GitHub
2. Your hosting provider will automatically redeploy
3. Or manually trigger a new deployment

## 🚨 Troubleshooting

### Common Issues

**Build fails:**
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check for syntax errors in code

**API not working:**
- Verify CORS settings
- Check environment variables
- Ensure server is running on correct port

**Client not loading:**
- Check if static files are served correctly
- Verify API URL configuration
- Check browser console for errors

### Support
If you encounter issues:
1. Check the hosting provider's documentation
2. Review the deployment logs
3. Test locally first with `npm run dev`

## 🎉 Success!

Once deployed, your golf statistics app will be accessible from anywhere in the world. Share the URL with friends and start tracking your golf performance!

---

**Need help?** Check the hosting provider's documentation or create an issue in your repository.

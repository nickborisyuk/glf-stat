# 🎨 Frontend Deployment Guide

Since the backend is now deployed on Vercel, you can deploy the React frontend separately.

## Option 1: Netlify (Recommended)

### Quick Deploy:
1. **Build the frontend:**
   ```bash
   cd /Users/nb/G/sandbox/glf-stat/client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `client/dist` folder
   - Your site will be live instantly!

3. **Configure API URL:**
   - In Netlify dashboard, go to Site Settings > Environment Variables
   - Add: `VITE_API_URL=https://glf-stat.vercel.app/api`

## Option 2: Vercel (Separate Project)

1. **Create new Vercel project for frontend:**
   ```bash
   cd /Users/nb/G/sandbox/glf-stat/client
   vercel
   ```

2. **Set environment variable:**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add: `VITE_API_URL=https://glf-stat.vercel.app/api`

## Option 3: GitHub Pages

1. **Build and push:**
   ```bash
   cd /Users/nb/G/sandbox/glf-stat/client
   npm run build
   git add dist
   git commit -m "Add build"
   git push
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: main, folder: /docs
   - Copy dist contents to /docs folder

## Option 4: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize and deploy:**
   ```bash
   cd /Users/nb/G/sandbox/glf-stat/client
   firebase login
   firebase init hosting
   npm run build
   firebase deploy
   ```

## Environment Configuration

For all deployments, set the API URL to point to your Vercel backend:

```bash
VITE_API_URL=https://glf-stat.vercel.app/api
```

## Testing the Connection

After deploying the frontend:

1. **Test API connection:**
   - Visit: `https://your-frontend-url.com`
   - Try creating a round
   - Check browser console for API calls

2. **Verify CORS:**
   - The backend is configured to accept requests from any origin
   - If you get CORS errors, check the API URL configuration

## Current Setup

- **Backend:** `https://glf-stat.vercel.app/api` (Vercel)
- **Frontend:** Deploy to any static hosting service
- **Database:** In-memory (data resets on server restart)

## Next Steps

1. Deploy frontend to your preferred platform
2. Test the full application
3. Consider adding persistent storage (SQLite, MongoDB, etc.)
4. Add authentication if needed

---

**Need help?** Check the hosting provider's documentation or create an issue in your repository.

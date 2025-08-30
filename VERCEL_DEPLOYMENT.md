# 🚀 Vercel Deployment Guide for GLF Stat

## Quick Deploy to Vercel

### Option 1: Deploy Button (Easiest)
1. Click this button to deploy directly to Vercel:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/glf-stat)

### Option 2: Manual Deploy
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project root:**
   ```bash
   cd /Users/nb/G/sandbox/glf-stat
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `glf-stat` (or leave default)
   - Directory: `./` (current directory)

### Option 3: GitHub Integration
1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/glf-stat.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

## Configuration Details

The project is configured for Vercel with:

- **Build Command:** `npm run build` (builds React client)
- **Output Directory:** `client/dist` (served by Express)
- **API Routes:** All `/api/*` routes go to Express server
- **Static Files:** React app served by Express in production

## Environment Variables

No environment variables needed for basic deployment. The app uses:
- `NODE_ENV=production` (set automatically by Vercel)
- `PORT` (set automatically by Vercel)

## Troubleshooting

### If you get 404 errors:
1. Make sure the build completed successfully
2. Check that `client/dist` folder exists after build
3. Verify the `vercel.json` configuration

### If API calls fail:
1. Check that the server is running
2. Verify API routes are prefixed with `/api`
3. Check browser console for CORS errors

### Build fails:
1. Ensure all dependencies are installed
2. Check Node.js version (requires 18+)
3. Verify Tailwind CSS configuration

## Post-Deployment

After successful deployment:
1. Your app will be available at `https://your-project-name.vercel.app`
2. The API will be at `https://your-project-name.vercel.app/api`
3. Health check: `https://your-project-name.vercel.app/api/health`

## Updates

To update your deployed app:
1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Or run `vercel --prod` to deploy manually

---

**Need help?** Check the [Vercel documentation](https://vercel.com/docs) or create an issue in your repository.

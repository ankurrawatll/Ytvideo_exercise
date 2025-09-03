# Deployment Guide for InteractiveEdu

This guide will help you deploy your InteractiveEdu application to Vercel or Render.

## Prerequisites

- GitHub account with your repository
- Node.js 18+ installed locally
- Git installed locally

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: InteractiveEdu MVP"

# Add your GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/ankurrawatll/Ytvideo_exercise.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `Ytvideo_exercise` repository
4. Vercel will automatically detect it's a Next.js project
5. Click "Deploy"
6. Your app will be live in minutes!

**Vercel will automatically:**
- Build your Next.js app
- Deploy to a global CDN
- Provide HTTPS
- Auto-deploy on every push to main branch

## Option 2: Deploy to Render

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect your `Ytvideo_exercise` repository
4. Configure:
   - **Name**: `interactive-edu`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Wait for build and deployment

## Environment Variables

No environment variables are required for this project as it's fully client-side.

## Build Process

The deployment platforms will automatically:
1. Install dependencies: `npm install`
2. Build the app: `npm run build`
3. Start the server: `npm start`

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Port Issues**: Render/Vercel handle ports automatically
3. **API Errors**: This app is client-side only, no backend needed

### Local Testing:
```bash
# Test production build locally
npm run build
npm start
```

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render:
1. Go to your service → Settings → Custom Domains
2. Add your domain
3. Update DNS records

## Monitoring

- **Vercel**: Built-in analytics and performance monitoring
- **Render**: Basic logs and uptime monitoring

## Cost

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Render**: Free tier includes 750 hours/month

## Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Render**: [render.com/docs](https://render.com/docs)

---

Your InteractiveEdu app will be live and accessible to anyone with an internet connection! 🚀

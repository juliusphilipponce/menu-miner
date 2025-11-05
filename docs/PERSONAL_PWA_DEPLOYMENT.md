# MenuMiner - Personal PWA Deployment Guide

**Last Updated**: 2025-11-05  
**Implementation**: Full PWA with Email Authentication  
**Security**: API keys protected server-side  
**Estimated Time**: 30-45 minutes

---

## 🎯 What's Been Implemented

### ✅ Completed Features

1. **Email Authentication**
   - Login page with email verification
   - Session-based authentication
   - Environment variable for allowed email
   - Sign out functionality

2. **Serverless Functions (API Keys Protected)**
   - `/api/auth` - Email authentication
   - `/api/analyze-menu` - Gemini AI proxy
   - `/api/search-images` - Google Search proxy
   - All API keys kept server-side

3. **PWA Features**
   - Service worker with offline caching
   - Web app manifest
   - Installable on mobile devices
   - Optimized caching strategies

4. **Build Optimizations**
   - Tailwind CSS properly installed
   - No CDN dependencies
   - Optimized bundle size
   - Production-ready configuration

---

## 🚀 Deployment Steps

### Step 1: Generate PWA Icons (5 minutes)

1. Open `scripts/generate-icons.html` in your browser
2. Click "Generate All Icons"
3. Download each icon (72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)
4. Move all downloaded icons to `public/icons/` folder
5. Rename them to match the pattern: `icon-72x72.png`, `icon-96x96.png`, etc.

**Alternative**: Use an online tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) with your own logo.

### Step 2: Configure Environment Variables Locally (2 minutes)

Create `.env.local` file in the project root:

```env
# Your personal email for authentication
ALLOWED_EMAIL=your.email@example.com

# Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key

# Google Search API
GOOGLE_SEARCH_API_KEY=your_actual_google_search_key
GOOGLE_SEARCH_CX=your_actual_search_engine_id
```

### Step 3: Test Locally (5 minutes)

```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` and test:
- [ ] Login with your email works
- [ ] Upload a menu image
- [ ] Menu extraction works
- [ ] Image search works
- [ ] Sign out works
- [ ] No console errors

### Step 4: Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Implement full PWA with authentication"
git push origin main
```

### Step 5: Deploy to Vercel (10 minutes)

#### 5.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Framework: **Vite** (should auto-detect)
5. Build Command: `npm run build`
6. Output Directory: `dist`

#### 5.2 Configure Environment Variables

In Vercel project settings → Environment Variables, add:

**For Production:**
```
ALLOWED_EMAIL=your.email@example.com
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_SEARCH_API_KEY=your_actual_google_search_key
GOOGLE_SEARCH_CX=your_actual_search_engine_id
```

**For Preview (optional but recommended):**
Add the same variables to "Preview" environment.

**Important**: Make sure to add all 4 variables!

#### 5.3 Deploy

Click "Deploy" and wait ~2-3 minutes for the build to complete.

### Step 6: Test Production Deployment (5 minutes)

Once deployed, visit your Vercel URL (e.g., `https://your-project.vercel.app`):

- [ ] Login page appears
- [ ] Login with your email works
- [ ] Upload and analyze menu works
- [ ] Images load correctly
- [ ] PWA install prompt appears (on mobile)
- [ ] Sign out works
- [ ] Try logging in with wrong email (should fail)

### Step 7: Install as PWA on Mobile (5 minutes)

#### On iOS (Safari):
1. Visit your Vercel URL
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

#### On Android (Chrome):
1. Visit your Vercel URL
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"
5. App icon appears on home screen

### Step 8: Test PWA Features (5 minutes)

- [ ] App opens in standalone mode (no browser UI)
- [ ] App icon looks good
- [ ] Splash screen appears on launch
- [ ] App works offline (try airplane mode - cached pages should work)
- [ ] App feels native and responsive

---

## 🔒 Security Notes

### What's Secure

✅ **API Keys Protected**: All API keys are server-side only  
✅ **Email Authentication**: Only your email can access the app  
✅ **Session-Based**: Authentication stored in sessionStorage  
✅ **HTTPS**: Vercel provides automatic HTTPS  
✅ **Security Headers**: X-Frame-Options, CSP, etc.

### What's NOT Secure (But OK for Personal Use)

⚠️ **Simple Authentication**: Email check only, no password  
⚠️ **No Rate Limiting**: Could be abused if someone gets your email  
⚠️ **Session Storage**: Cleared when browser closes

### Recommendations

1. **Don't share your Vercel URL** publicly
2. **Monitor API usage** in Google Cloud Console
3. **Set quota limits** on your API keys (100 requests/day recommended)
4. **Rotate API keys** if you suspect unauthorized access

---

## 📱 PWA Features Explained

### Service Worker
- Caches static assets (HTML, CSS, JS)
- Caches API responses for 5 minutes
- Provides offline fallback
- Auto-updates when new version deployed

### Manifest
- App name: "MenuMiner"
- Theme color: Dark gray (#111827)
- Display mode: Standalone (full-screen)
- Orientation: Portrait
- Icons: 8 sizes for all devices

### Caching Strategy
- **Static assets**: Cache-first (instant load)
- **API calls**: Network-first with cache fallback
- **Images**: Cache-first with size limit

---

## 🛠️ Troubleshooting

### Login Fails
- Check `ALLOWED_EMAIL` is set in Vercel environment variables
- Ensure email matches exactly (case-insensitive)
- Check browser console for errors

### API Calls Fail
- Verify all 4 environment variables are set in Vercel
- Check Vercel function logs for errors
- Ensure API keys are valid

### PWA Not Installing
- Ensure HTTPS is enabled (Vercel does this automatically)
- Check manifest.json is accessible at `/manifest.webmanifest`
- Verify all icons exist in `/icons/` folder
- Try clearing browser cache

### Icons Not Showing
- Ensure icons are in `public/icons/` folder
- Check icon filenames match manifest (e.g., `icon-192x192.png`)
- Verify icons are PNG format
- Try regenerating icons

### Build Fails
- Check Node version (should be 16+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`
- Review Vercel build logs

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function invocations
- Check error rates
- View analytics

### Google Cloud Console
- Monitor API usage
- Check quota consumption
- Set up billing alerts
- Review API errors

### Recommended Alerts
1. **API Quota**: Alert at 80% of daily quota
2. **Vercel Functions**: Alert on error rate > 5%
3. **Billing**: Alert if costs exceed $5/month

---

## 🔄 Updating the App

### To Deploy Updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build the new version
3. Deploy to production
4. Update the service worker
5. Notify users of updates

### Users Will See:
- Automatic update on next visit
- Service worker updates in background
- No manual update required

---

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ALLOWED_EMAIL` | Yes | Your email for authentication | `john@example.com` |
| `GEMINI_API_KEY` | Yes | Google Gemini AI API key | `AIza...` |
| `GOOGLE_SEARCH_API_KEY` | Yes | Google Custom Search API key | `AIza...` |
| `GOOGLE_SEARCH_CX` | Yes | Custom Search Engine ID | `432a2...` |

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Login works with your email
- [ ] Menu extraction works
- [ ] Image search works
- [ ] PWA installs on mobile
- [ ] App works offline (cached content)
- [ ] Icons display correctly
- [ ] Sign out works
- [ ] No console errors
- [ ] API usage monitored
- [ ] Quota alerts set up

---

## 🎉 You're Done!

Your MenuMiner PWA is now deployed and ready to use! You can:

- Access it from any device via your Vercel URL
- Install it as an app on your phone
- Use it offline (for cached content)
- Enjoy fast, secure menu extraction

### Next Steps (Optional)

1. **Custom Domain**: Add a custom domain in Vercel settings
2. **Better Icons**: Create custom icons with your own design
3. **Analytics**: Add Vercel Analytics or Google Analytics
4. **Monitoring**: Set up error tracking with Sentry

---

**Need Help?** Check the troubleshooting section above or review the Vercel deployment logs.

**Enjoy your personal MenuMiner PWA! 🎉**


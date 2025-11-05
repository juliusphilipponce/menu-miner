# MenuMiner - Vercel Deployment Quick Reference Card

**Last Updated**: 2025-11-05  
**Quick Start**: 30 minutes to deploy

---

## 🚨 CRITICAL FIXES REQUIRED BEFORE DEPLOYMENT

### 1. Install Tailwind CSS Properly (5 min)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

Create `tailwind.config.js`:
```javascript
export default {
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### 2. Update index.html (2 min)
**DELETE these lines:**
- `<script src="https://cdn.tailwindcss.com"></script>`
- The entire `<script type="importmap">` block
- The `<style>` block with fadeIn animation

**KEEP this line:**
- `<link rel="stylesheet" href="/index.css">`

### 3. Create vercel.json (2 min)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 4. Test Build (2 min)
```bash
npm run build
npm run preview
```

---

## 🔒 SECURE YOUR API KEYS (10 min)

### Google Cloud Console
1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your Gemini API key:
   - Application restrictions → HTTP referrers
   - Add: `https://*.vercel.app/*`
   - API restrictions → Generative Language API
   - Set quota: 100 requests/day
3. Edit your Google Search API key:
   - Application restrictions → HTTP referrers
   - Add: `https://*.vercel.app/*`
   - API restrictions → Custom Search API
   - Set quota: 100 queries/day

---

## 🚀 DEPLOY TO VERCEL (10 min)

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Framework: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`

### 3. Add Environment Variables
In Vercel dashboard, add these to **both Production and Preview**:
```
GEMINI_API_KEY=your_actual_key_here
GOOGLE_SEARCH_API_KEY=your_actual_key_here
GOOGLE_SEARCH_CX=your_actual_cx_here
```

### 4. Deploy
Click "Deploy" and wait ~2 minutes.

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Application loads without errors
- [ ] Upload a menu image - works?
- [ ] Menu extraction works?
- [ ] Image search works?
- [ ] Test on mobile device
- [ ] Check browser console - no errors?
- [ ] Monitor API usage in Google Cloud Console

---

## ⚠️ SECURITY WARNING

**Current Setup**: API keys are exposed in client JavaScript bundle.

**Safe for**:
- ✅ Personal use
- ✅ Testing
- ✅ Internal tools

**NOT safe for**:
- ❌ Public websites
- ❌ Commercial apps
- ❌ Untrusted users

**For public deployment**: Implement serverless functions (see full guide).

---

## 🆘 TROUBLESHOOTING

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Check they're added in Vercel dashboard
- Check spelling matches exactly
- Redeploy after adding variables

### API Calls Failing
- Verify API key restrictions include your Vercel URL
- Check Google Cloud Console quotas
- Check browser console for errors

### Images Not Loading
- Check Google Search API quota
- Verify Custom Search Engine is configured
- Check CORS errors in console

---

## 📚 FULL DOCUMENTATION

- **Start Here**: `docs/DEPLOYMENT_SUMMARY.md`
- **Step-by-Step**: `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- **Complete Audit**: `docs/MOBILE_PWA_DEPLOYMENT_AUDIT.md`
- **Security**: `docs/CRITICAL_ISSUES_PLAN.md`

---

## 🎯 DEPLOYMENT OPTIONS

### Option A: Quick (30 min) - Personal Use
Current setup with API restrictions. **You are here.**

### Option B: Secure (4-6 hours) - Public Use
Add serverless functions to protect API keys.
See: `docs/VERCEL_DEPLOYMENT_GUIDE.md` Option B

### Option C: Full PWA (1-2 weeks) - Best Experience
Complete PWA with offline support.
See: `docs/MOBILE_PWA_DEPLOYMENT_AUDIT.md`

---

## 📊 CURRENT STATUS

- **Mobile Responsive**: ✅ Good
- **Build Ready**: ⚠️ Needs fixes above
- **Security**: ⚠️ API keys exposed (with restrictions)
- **PWA**: ❌ Not implemented
- **Vercel Ready**: ✅ Yes (after fixes)

**Deployment Readiness**: 7/10 for personal use

---

**Need more details?** See `docs/DEPLOYMENT_SUMMARY.md`

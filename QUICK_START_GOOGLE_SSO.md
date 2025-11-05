# Quick Start: Google SSO Setup

**Time**: 5 minutes  
**Status**: Fixed for local development

---

## ✅ What's Fixed

1. **Dev mode authentication** - No API calls needed locally
2. **Origin error** - Instructions to fix in Google Cloud Console

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Update .env.local (1 minute)

Your `.env.local` should have:

```env
# Your email (the one you'll sign in with)
ALLOWED_EMAIL=your.email@gmail.com
VITE_ALLOWED_EMAIL=your.email@gmail.com

# Your Google Client ID (from Google Cloud Console)
GOOGLE_CLIENT_ID=858989469306-6jrk2q2odde9ld26hti7c79pninifc8k.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=858989469306-6jrk2q2odde9ld26hti7c79pninifc8k.apps.googleusercontent.com

# Your existing API keys
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_key
GOOGLE_SEARCH_CX=your_search_engine_id
```

**Important**: 
- Replace `your.email@gmail.com` with YOUR actual Google email
- The Client ID shown above is yours (I can see it in the error)
- Make sure `VITE_ALLOWED_EMAIL` matches your Google account email

### Step 2: Fix Google Cloud Console Origin (2 minutes)

1. Go to: [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth Client ID: `Web client 1`
3. Under **"Authorized JavaScript origins"**:
   - Click "Add URI"
   - Add: `http://localhost:3001`
4. Under **"Authorized redirect URIs"**:
   - Click "Add URI"  
   - Add: `http://localhost:3001`
5. Click **"Save"**
6. **Wait 2-3 minutes** for changes to take effect

### Step 3: Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Clear Browser Cache (30 seconds)

- Press `Ctrl + Shift + R` (hard refresh)
- Or open in **Incognito mode**

### Step 5: Test (1 minute)

1. Visit `http://localhost:3001`
2. Click "Sign in with Google"
3. Sign in with your Google account
4. ✅ Success!

---

## 🔍 How It Works Now

### Development Mode (localhost)
- ✅ Google Sign-In button appears
- ✅ You sign in with Google
- ✅ App checks email against `VITE_ALLOWED_EMAIL`
- ✅ No API call needed
- ✅ Works offline

### Production Mode (Vercel)
- ✅ Google Sign-In button appears
- ✅ You sign in with Google
- ✅ Token sent to `/api/auth`
- ✅ Server verifies with Google
- ✅ Server checks against `ALLOWED_EMAIL`
- ✅ Fully secure

---

## ⚠️ Common Issues

### "The given origin is not allowed"

**Problem**: `http://localhost:3001` not in authorized origins  
**Solution**: 
1. Add `http://localhost:3001` to Google Cloud Console
2. Wait 2-3 minutes
3. Hard refresh browser

### "Your email is not authorized"

**Problem**: Email doesn't match `VITE_ALLOWED_EMAIL`  
**Solution**:
1. Check `.env.local` has `VITE_ALLOWED_EMAIL=your.actual.email@gmail.com`
2. Make sure it matches the Google account you're signing in with
3. Restart dev server

### "VITE_ALLOWED_EMAIL not configured"

**Problem**: Missing environment variable  
**Solution**:
1. Add `VITE_ALLOWED_EMAIL=your.email@gmail.com` to `.env.local`
2. Restart dev server

### Google button not appearing

**Problem**: `VITE_GOOGLE_CLIENT_ID` not set  
**Solution**:
1. Add `VITE_GOOGLE_CLIENT_ID=858989469306-6jrk2q2odde9ld26hti7c79pninifc8k.apps.googleusercontent.com` to `.env.local`
2. Restart dev server

---

## 📋 Your .env.local Checklist

Make sure your `.env.local` has ALL of these:

```env
✅ ALLOWED_EMAIL=your.email@gmail.com
✅ VITE_ALLOWED_EMAIL=your.email@gmail.com
✅ GOOGLE_CLIENT_ID=858989469306-6jrk2q2odde9ld26hti7c79pninifc8k.apps.googleusercontent.com
✅ VITE_GOOGLE_CLIENT_ID=858989469306-6jrk2q2odde9ld26hti7c79pninifc8k.apps.googleusercontent.com
✅ GEMINI_API_KEY=your_key
✅ GOOGLE_SEARCH_API_KEY=your_key
✅ GOOGLE_SEARCH_CX=your_cx
```

---

## 🎯 Quick Test

After setup:

1. ✅ Dev server running on `http://localhost:3001`
2. ✅ Google Sign-In button visible
3. ✅ Click button → Google popup appears
4. ✅ Sign in → Success message
5. ✅ Redirected to main app

---

**Still having issues?** Share the error message and I'll help! 🚀


# Google SSO Setup Guide

**Last Updated**: 2025-11-05  
**Estimated Time**: 10 minutes

---

## 🔐 Overview

MenuMiner now uses Google Sign-In (OAuth 2.0) for secure authentication. This provides:
- ✅ Secure authentication via Google
- ✅ No password management needed
- ✅ One-tap sign-in experience
- ✅ Email verification by Google
- ✅ Still restricted to your allowed email

---

## 📋 Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown (top left)
3. Click **"New Project"**
4. Enter project name: `MenuMiner` (or any name you prefer)
5. Click **"Create"**
6. Wait for the project to be created
7. Select your new project from the dropdown

### Step 2: Enable Google+ API (1 minute)

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on **"Google+ API"**
4. Click **"Enable"**

### Step 3: Configure OAuth Consent Screen (3 minutes)

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for personal use)
3. Click **"Create"**

**Fill in the required fields:**
- **App name**: `MenuMiner`
- **User support email**: Your email
- **Developer contact email**: Your email
- **App logo** (optional): Upload an icon if you have one

4. Click **"Save and Continue"**
5. **Scopes**: Click **"Add or Remove Scopes"**
   - Select: `email`
   - Select: `profile`
   - Select: `openid`
6. Click **"Update"** → **"Save and Continue"**
7. **Test users**: Click **"Add Users"**
   - Add your email address (the one you'll use to sign in)
8. Click **"Save and Continue"**
9. Click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Client ID (3 minutes)

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type**: Select **"Web application"**
4. **Name**: `MenuMiner Web Client`

**Authorized JavaScript origins:**
- Click **"Add URI"**
- Add: `http://localhost:3000`
- Click **"Add URI"** again
- Add: `http://localhost:3001`
- Click **"Add URI"** again
- Add: `https://your-project-name.vercel.app` (replace with your actual Vercel URL)

**Authorized redirect URIs:**
- Click **"Add URI"**
- Add: `http://localhost:3000`
- Click **"Add URI"** again
- Add: `http://localhost:3001`
- Click **"Add URI"** again
- Add: `https://your-project-name.vercel.app` (replace with your actual Vercel URL)

5. Click **"Create"**
6. **Copy your Client ID** - it will look like: `123456789-abc123.apps.googleusercontent.com`
7. Click **"OK"**

### Step 5: Update Environment Variables (1 minute)

**For Local Development** (`.env.local`):
```env
ALLOWED_EMAIL=your.email@example.com
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

**For Vercel Deployment**:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add these variables to **both Production and Preview**:
   - `ALLOWED_EMAIL` = your email
   - `GOOGLE_CLIENT_ID` = your client ID
   - `VITE_GOOGLE_CLIENT_ID` = your client ID (same as above)

---

## ✅ Testing

### Local Testing

1. Make sure `.env.local` is configured
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000` or `http://localhost:3001`
4. You should see the **"Sign in with Google"** button
5. Click it and sign in with your Google account
6. If your email matches `ALLOWED_EMAIL`, you'll be logged in!

### Production Testing

1. Deploy to Vercel with environment variables set
2. Visit your Vercel URL
3. Sign in with Google
4. Verify authentication works

---

## 🔒 Security Features

### What's Secure

✅ **Google OAuth 2.0**: Industry-standard authentication  
✅ **Token Verification**: Server-side verification of Google tokens  
✅ **Email Verification**: Only Google-verified emails allowed  
✅ **Audience Check**: Tokens must be for your app  
✅ **Email Restriction**: Only your allowed email can access  
✅ **No Password Storage**: Google handles authentication

### How It Works

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User signs in with Google
4. Google returns a JWT token
5. Client sends token to `/api/auth`
6. Server verifies token with Google
7. Server checks if email matches `ALLOWED_EMAIL`
8. If match, user is authenticated

---

## 🛠️ Troubleshooting

### "Google Client ID not configured" Error

**Problem**: `VITE_GOOGLE_CLIENT_ID` not set  
**Solution**: 
1. Check `.env.local` has `VITE_GOOGLE_CLIENT_ID`
2. Restart dev server after adding env variables
3. Make sure the variable starts with `VITE_`

### "Invalid Google token" Error

**Problem**: Token verification failed  
**Solution**:
1. Check `GOOGLE_CLIENT_ID` is set in Vercel (server-side)
2. Verify the Client ID matches the one from Google Cloud Console
3. Make sure OAuth consent screen is configured

### "Your email is not authorized" Error

**Problem**: Email doesn't match `ALLOWED_EMAIL`  
**Solution**:
1. Check `ALLOWED_EMAIL` in environment variables
2. Make sure it matches exactly (case-insensitive)
3. Sign in with the correct Google account

### "Redirect URI mismatch" Error

**Problem**: Your domain not in authorized origins  
**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth Client ID
3. Add your domain to "Authorized JavaScript origins"
4. Add your domain to "Authorized redirect URIs"
5. Wait a few minutes for changes to propagate

### Sign-In Button Not Appearing

**Problem**: Google library not loading  
**Solution**:
1. Check browser console for errors
2. Verify `VITE_GOOGLE_CLIENT_ID` is set
3. Check internet connection
4. Try clearing browser cache

---

## 📝 Important Notes

### For Development

- Use `http://localhost:3000` or `http://localhost:3001`
- Both must be in authorized origins
- Restart dev server after changing env variables

### For Production

- Use your actual Vercel URL
- Add it to authorized origins before deploying
- Set all 3 environment variables in Vercel
- Test in incognito mode to verify

### OAuth Consent Screen

- **External** type is fine for personal use
- You can have up to 100 test users
- No need to publish the app for personal use
- Keep it in "Testing" mode

---

## 🔄 Updating Authorized Domains

When you get your Vercel URL or add a custom domain:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click on your OAuth Client ID
4. Add new domain to:
   - Authorized JavaScript origins
   - Authorized redirect URIs
5. Click **"Save"**
6. Wait 5 minutes for changes to take effect

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)
- [OAuth Consent Screen Guide](https://support.google.com/cloud/answer/10311615)

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Test user (your email) added
- [ ] OAuth Client ID created
- [ ] Client ID copied
- [ ] Authorized origins added (localhost + Vercel)
- [ ] `.env.local` updated with Client ID
- [ ] Vercel environment variables set
- [ ] Local testing successful
- [ ] Production testing successful

---

**Need Help?** Check the troubleshooting section above or review the Google OAuth documentation.

**Ready to test!** 🚀


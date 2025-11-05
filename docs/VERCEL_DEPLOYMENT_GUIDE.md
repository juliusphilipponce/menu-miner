# MenuMiner - Vercel Deployment Quick Start Guide

**Last Updated**: 2025-11-05  
**Estimated Time**: 30-60 minutes (Option A) or 4-6 hours (Option B)

---

## 🚀 Choose Your Deployment Path

### Option A: Quick Deploy (Personal Use) - 30 minutes
- ⚠️ API keys will be exposed in client bundle
- ✅ Good for personal projects and testing
- ✅ Fastest to deploy
- ⚠️ Requires API key restrictions

### Option B: Secure Deploy (Recommended) - 4-6 hours
- ✅ API keys protected server-side
- ✅ Production-ready security
- ✅ Suitable for public deployment
- ✅ Uses Vercel Serverless Functions

---

## 📋 OPTION A: Quick Deploy (Personal Use)

### Prerequisites
- Vercel account (free tier works)
- GitHub account
- API keys ready (Gemini, Google Search)

### Step 1: Fix Critical Issues (15 minutes)

#### 1.1 Install Tailwind CSS Properly

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Create `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Create `postcss.config.js`:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Create `index.css`:**
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

#### 1.2 Update index.html

**Remove these lines:**
```html
<!-- DELETE THIS LINE -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- DELETE THIS ENTIRE BLOCK -->
<script type="importmap">
{
  "imports": {
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.28.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/"
  }
}
</script>

<!-- DELETE THIS BLOCK (fadeIn animation - now in index.css) -->
<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
</style>
```

**The `<link rel="stylesheet" href="/index.css">` line should remain.**

#### 1.3 Create vercel.json

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
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 1.4 Test Build Locally

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` and verify everything works.

### Step 2: Secure Your API Keys (10 minutes)

#### 2.1 Google Cloud Console - Gemini API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your Gemini API key
3. Click "Edit API key"
4. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `https://your-project-name.vercel.app/*`
   - Add: `https://*.vercel.app/*` (for preview deployments)
5. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Generative Language API"
6. Set quota limits (recommended: 100 requests/day for testing)
7. Save

#### 2.2 Google Search API Key

1. Same console, find your Google Search API key
2. Click "Edit API key"
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `https://your-project-name.vercel.app/*`
   - Add: `https://*.vercel.app/*`
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Custom Search API"
5. Set quota limits (recommended: 100 queries/day)
6. Save

### Step 3: Deploy to Vercel (5 minutes)

#### 3.1 Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 3.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3.3 Add Environment Variables

In Vercel project settings, add:

```
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_SEARCH_API_KEY=your_actual_google_search_key
GOOGLE_SEARCH_CX=your_actual_search_engine_id
```

**Important**: Add these to both "Production" and "Preview" environments.

#### 3.4 Deploy

Click "Deploy" and wait for build to complete.

### Step 4: Post-Deployment (5 minutes)

#### 4.1 Update API Key Restrictions

Now that you have your Vercel URL, update the API key restrictions:

1. Replace `your-project-name.vercel.app` with your actual Vercel URL
2. Test the application
3. Monitor API usage in Google Cloud Console

#### 4.2 Test Thoroughly

- [ ] Upload a menu image
- [ ] Verify extraction works
- [ ] Check image search works
- [ ] Test on mobile device
- [ ] Verify no console errors

#### 4.3 Monitor Usage

- Check Vercel Analytics
- Monitor Google Cloud Console for API usage
- Set up billing alerts

---

## 🔒 OPTION B: Secure Deploy with Serverless Functions

### Prerequisites
- All prerequisites from Option A
- Familiarity with TypeScript
- Understanding of API routes

### Step 1: Complete Option A Steps 1-2

Follow all steps in Option A first.

### Step 2: Install Vercel Dependencies

```bash
npm install @vercel/node
npm install -D @types/node
```

### Step 3: Create API Directory Structure

```bash
mkdir api
```

### Step 4: Create Serverless Function for Gemini

**File**: `api/analyze-menu.ts`

```typescript
import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const menuSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The name of the menu item." },
      description: { type: Type.STRING, description: "A brief description of the menu item." },
      price: { type: Type.STRING, description: "The price of the menu item as a string." }
    },
    required: ["name", "description", "price"]
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, mimeType } = req.body;
    
    // Validate input
    if (!imageData || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate file size (10MB limit)
    const sizeInBytes = (imageData.length * 3) / 4;
    if (sizeInBytes > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    // API key from environment (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };

    const prompt = "Extract all menu items from this image. For each item, provide its name, a brief description, and its price. If a description is not available, create a concise, plausible one. Ensure the output is a valid JSON array of objects, where each object represents a menu item.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuSchema,
      },
    });

    const jsonText = response.text.trim();
    
    // Validate response size
    if (jsonText.length > 1000000) {
      return res.status(500).json({ error: 'Response too large' });
    }

    const parsedJson = JSON.parse(jsonText);

    if (!Array.isArray(parsedJson)) {
      return res.status(500).json({ error: 'Invalid response format' });
    }

    if (parsedJson.length > 100) {
      return res.status(500).json({ error: 'Too many items' });
    }

    return res.status(200).json({ items: parsedJson });
    
  } catch (error) {
    console.error('Error analyzing menu:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
```

### Step 5: Create Serverless Function for Image Search

**File**: `api/search-images.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemName, restaurantName, numImages = 10 } = req.body;
    
    // Validate inputs
    if (!itemName || !restaurantName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validatedNumImages = Math.max(1, Math.min(10, numImages));

    // API credentials from environment
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    if (!apiKey || !cx) {
      console.error('Google Search API credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const searchQuery = `${restaurantName} ${itemName} food`;
    const query = encodeURIComponent(searchQuery);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image&num=${validatedNumImages}&imgType=photo&imgSize=large&imgColorType=color`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Google Search API error: ${response.statusText}`);
      return res.status(response.status).json({ error: 'Search API error' });
    }

    const data = await response.json();

    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      const imageUrls = data.items
        .map((item: any) => item?.link)
        .filter((link: any): link is string => typeof link === 'string')
        .slice(0, validatedNumImages);

      return res.status(200).json({ imageUrls });
    }

    return res.status(200).json({ imageUrls: [] });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
```

### Step 6: Update Client Services

This step requires updating your service files to call the serverless functions instead of calling APIs directly. See the full implementation in `docs/MOBILE_PWA_DEPLOYMENT_AUDIT.md` Section 4.

### Step 7: Update vite.config.ts

Remove the `define` block that exposes environment variables:

```typescript
// DELETE THIS ENTIRE BLOCK
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GOOGLE_SEARCH_API_KEY': JSON.stringify(env.GOOGLE_SEARCH_API_KEY),
  'process.env.GOOGLE_SEARCH_CX': JSON.stringify(env.GOOGLE_SEARCH_CX)
}
```

### Step 8: Deploy

Follow the same deployment steps as Option A, but now your API keys are secure!

---

## 📱 Adding PWA Features (Optional)

See `docs/MOBILE_PWA_DEPLOYMENT_AUDIT.md` for complete PWA implementation guide.

**Quick PWA Setup** (30 minutes):

1. Install Vite PWA plugin:
```bash
npm install vite-plugin-pwa -D
```

2. Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MenuMiner - AI Menu Extraction',
        short_name: 'MenuMiner',
        description: 'Extract menu items from photos using AI',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

3. Create app icons (192x192 and 512x512) and place in `public/`

---

## ✅ Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All features work (upload, analyze, search)
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] API keys are restricted
- [ ] Environment variables are set
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Performance is acceptable (run Lighthouse)
- [ ] Error handling works
- [ ] Rate limiting is functional

---

## 🆘 Troubleshooting

### Build Fails
- Check Node version (should be 16+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### Environment Variables Not Working
- Ensure they're added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### API Calls Failing
- Check API key restrictions
- Verify environment variables are set
- Check Vercel function logs
- Ensure CORS headers are correct

### Images Not Loading
- Check Google Search API quota
- Verify Custom Search Engine is configured
- Check browser console for errors

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

**Need Help?** Refer to the comprehensive audit in `docs/MOBILE_PWA_DEPLOYMENT_AUDIT.md`

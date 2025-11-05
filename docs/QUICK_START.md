# MenuMiner - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env.local
```

### Step 3: Get Your API Keys

#### Gemini API Key (Required)
1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

#### Google Search API Key (Required)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing
3. Enable "Custom Search API"
4. Create credentials → API Key
5. Copy the key

#### Custom Search Engine ID (Required)
1. Visit https://programmablesearchengine.google.com/
2. Click "Add" to create new search engine
3. Configure to search the entire web
4. Enable "Image search"
5. Copy the "Search engine ID" (CX)

### Step 4: Update .env.local
```env
GEMINI_API_KEY=paste_your_gemini_key_here
GOOGLE_SEARCH_API_KEY=paste_your_google_search_key_here
GOOGLE_SEARCH_CX=paste_your_search_engine_id_here
```

### Step 5: Run the App
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## 📸 How to Use

1. **Upload a menu image** - Click "Upload Menu Photo" and select a clear photo of a menu
2. **Enter restaurant name** - Type the name of the restaurant
3. **Extract menu** - Click "Extract & Find Images" button
4. **View results** - Menu items appear with images on the right
5. **Browse images** - Click any menu item to see all images in a gallery

---

## ⚠️ Important Notes

### For Development & Personal Use
✅ This setup is perfect for:
- Personal projects
- Learning and experimentation
- Development and testing
- Internal tools

### For Production Deployment
❌ **DO NOT deploy publicly without a backend proxy**

API keys are exposed in the browser. For production:
1. Implement a backend server (Express, Next.js, serverless)
2. Move API calls to server-side
3. Hide API keys server-side only

See [docs/CRITICAL_ISSUES_PLAN.md](CRITICAL_ISSUES_PLAN.md) for details.

---

## 🐛 Troubleshooting

### "API_KEY environment variable is not set"
- Make sure `.env.local` exists
- Verify all three API keys are filled in
- Restart the dev server (`npm run dev`)

### "Google Search API Key or CX is not set"
- Check that `GOOGLE_SEARCH_API_KEY` is in `.env.local`
- Check that `GOOGLE_SEARCH_CX` is in `.env.local`
- Verify no typos in variable names

### Images not loading
- Verify Custom Search Engine is configured for image search
- Check that "Search the entire web" is enabled
- Verify API key has Custom Search API enabled

### Rate limit errors
- Wait 1 minute between requests (10 requests/minute limit)
- This is a client-side rate limit for protection

---

## 📚 More Information

- [../README.md](../README.md) - Full documentation
- [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) - Security features
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Production deployment guide

---

## 🎉 You're Ready!

Start uploading menu images and extracting delicious data!


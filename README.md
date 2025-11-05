<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MenuMiner - AI-Powered Menu Extraction PWA

MenuMiner uses Google's Gemini AI to extract menu items from uploaded images and enriches them with relevant food images from Google Search.

**🎉 NEW: Full PWA with Email Authentication!**

> 📚 **Full documentation available in the [`docs/`](docs/) folder** - See [docs/README.md](docs/README.md) for the complete documentation index.

> 🚀 **Ready to Deploy?** See [`IMPLEMENTATION_COMPLETE.md`](IMPLEMENTATION_COMPLETE.md) and [`docs/PERSONAL_PWA_DEPLOYMENT.md`](docs/PERSONAL_PWA_DEPLOYMENT.md)

## ✨ What's New

### Full PWA Implementation (Option C)
- ✅ **Email Authentication** - Secure login for personal use
- ✅ **API Keys Protected** - All keys server-side via Vercel Functions
- ✅ **Installable PWA** - Add to home screen on mobile
- ✅ **Offline Support** - Service worker with caching
- ✅ **Production Ready** - Optimized build and deployment

**See [`IMPLEMENTATION_COMPLETE.md`](IMPLEMENTATION_COMPLETE.md) for details!**

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Your Email** - For authentication
- **Gemini API Key** - [Get it here](https://aistudio.google.com/app/apikey)
- **Google Custom Search API Key** - [Get it here](https://console.cloud.google.com/apis/credentials)
- **Custom Search Engine ID** - [Create one here](https://programmablesearchengine.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd menu-miner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

4. **Get your API keys**

   **Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key

   **Google Custom Search API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project (or select existing)
   - Enable "Custom Search API"
   - Create credentials → API Key
   - Copy the API key

   **Custom Search Engine ID:**
   - Visit [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Click "Add" to create a new search engine
   - Configure to search the entire web
   - Enable "Image search"
   - Copy the "Search engine ID" (CX)

5. **Update `.env.local` with your keys**
   ```env
   ALLOWED_EMAIL=your.email@example.com
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
   GOOGLE_SEARCH_CX=your_custom_search_engine_id_here
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Upload a menu image and start extracting!

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 🔒 Security

**✅ SECURE**: API keys are now protected server-side via Vercel Serverless Functions!

### Authentication
- Email-based authentication for personal use
- Session-based access control
- Only your email can access the app

### API Security
- All API keys stored server-side only
- Serverless functions proxy API calls
- No keys exposed in client bundle
- HTTPS enforced (automatic on Vercel)

**Perfect for personal use!** 🎉

## 📁 Project Structure

```
menu-miner/
├── components/          # React components
│   ├── FileUploadButton.tsx
│   ├── ResultDisplay.tsx
│   ├── GalleryModal.tsx
│   ├── Spinner.tsx
│   └── Icons.tsx
├── services/           # API service layers
│   ├── geminiService.ts
│   └── googleSearchService.ts
├── utils/              # Utility functions
│   └── security.ts
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── index.tsx           # Application entry point
├── vite.config.ts      # Vite configuration
└── .env.local          # Environment variables (not in git)
```

## 🔒 Security Features

- Input validation and sanitization
- File upload restrictions (type, size)
- Rate limiting (10 requests/minute)
- XSS prevention
- SSRF protection
- API key validation

See [docs/SECURITY_IMPROVEMENTS.md](docs/SECURITY_IMPROVEMENTS.md) for details.

## 🛠️ Technologies

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 6.2.0** - Build tool
- **Tailwind CSS** - Styling (via @tailwindcss/postcss)

### Backend (Serverless)
- **Vercel Functions** - Serverless API routes
- **Google Gemini AI** - Menu extraction
- **Google Custom Search** - Image search

### PWA
- **vite-plugin-pwa** - PWA generation
- **Workbox** - Service worker
- **Web App Manifest** - App metadata

## 📚 Documentation

All documentation is organized in the `docs/` folder:

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Security Improvements](docs/SECURITY_IMPROVEMENTS.md)** - Comprehensive security features
- **[Critical Issues Plan](docs/CRITICAL_ISSUES_PLAN.md)** - Security implementation plan (Phase 1 & 2)
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - What was changed and why
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

## 📝 License

See LICENSE file for details.

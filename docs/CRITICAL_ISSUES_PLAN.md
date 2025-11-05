# Critical Security Issues - Implementation Plan

## 🎯 Objective
Address critical security vulnerabilities related to API credential exposure in the MenuMiner application.

---

## 🔴 Critical Issues Identified

### Issue #1: Hardcoded API Credentials
**Location**: `services/googleSearchService.ts` lines 23-24  
**Problem**: Google Search API key and Custom Search Engine ID (CX) are hardcoded in source code  
**Risk Level**: CRITICAL  
**Impact**: 
- Credentials exposed in version control history
- Anyone with access to the code can abuse the API
- Potential quota exhaustion and unexpected costs

### Issue #2: Client-Side API Key Exposure
**Location**: `vite.config.ts` and all client-side code  
**Problem**: All API keys are bundled into client-side JavaScript  
**Risk Level**: CRITICAL  
**Impact**:
- API keys visible in browser DevTools
- Keys can be extracted from production bundles
- No way to rotate keys without redeploying

### Issue #3: No Backend Architecture
**Problem**: All API calls made directly from browser  
**Risk Level**: HIGH  
**Impact**:
- Cannot properly secure API keys
- No server-side rate limiting
- CORS limitations
- No request logging or monitoring

---

## 📋 Implementation Plan

### Phase 1: Immediate Fixes (Environment Variables)
**Goal**: Move hardcoded credentials to environment variables  
**Timeline**: Immediate  
**Limitations**: Still client-side, but better than hardcoded

#### Steps:
1. ✅ Move Google Search API credentials to `.env.local`
2. ✅ Update Vite config to expose new environment variables
3. ✅ Update `googleSearchService.ts` to use `process.env`
4. ✅ Create `.env.example` template file
5. ✅ Verify `.gitignore` excludes `.env` files
6. ✅ Update README with setup instructions
7. ✅ Add warning comments about client-side exposure

**Result**: Credentials no longer in source code, but still exposed in browser.

---

### Phase 2: Backend Proxy (Recommended for Production)
**Goal**: Hide API keys server-side  
**Timeline**: Future enhancement  
**Status**: NOT IMPLEMENTED (out of scope for current fix)

#### Option A: Add Express Backend
```
menu-miner/
├── client/          # Current React app
└── server/          # New Express server
    ├── routes/
    │   ├── gemini.ts    # Proxy for Gemini API
    │   └── search.ts    # Proxy for Google Search
    └── index.ts
```

#### Option B: Migrate to Next.js
- Use Next.js API routes (`/pages/api/`)
- Server-side rendering capabilities
- Built-in API route protection

#### Option C: Serverless Functions
- Vercel Functions
- Netlify Functions
- AWS Lambda

**Benefits**:
- API keys never exposed to client
- Server-side rate limiting
- Request logging and monitoring
- Better security controls

---

## 🛠️ Phase 1 Implementation Details

### 1. Update `.env.local`
```env
# Gemini API Key (existing)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Custom Search API (new)
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_CX=your_custom_search_engine_id_here
```

### 2. Update `vite.config.ts`
```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GOOGLE_SEARCH_API_KEY': JSON.stringify(env.GOOGLE_SEARCH_API_KEY),
  'process.env.GOOGLE_SEARCH_CX': JSON.stringify(env.GOOGLE_SEARCH_CX)
}
```

### 3. Update `googleSearchService.ts`
```typescript
// Before:
const apiKey = "AIzaSyDZDzzVHAsivXV_s1kDo9EGZ69yzu9wJnY";
const cx = "432a25196149f425a";

// After:
const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
const cx = process.env.GOOGLE_SEARCH_CX;
```

### 4. Create `.env.example`
Template file for developers to copy and fill in their own keys.

### 5. Update README.md
Add clear instructions for obtaining and configuring API keys.

---

## ⚠️ Important Limitations

### What Phase 1 DOES:
✅ Removes credentials from source code  
✅ Prevents accidental commits of API keys  
✅ Makes key rotation easier (just update `.env.local`)  
✅ Follows environment variable best practices  

### What Phase 1 DOES NOT:
❌ Hide keys from end users (still in browser bundle)  
❌ Prevent key extraction from DevTools  
❌ Provide server-side rate limiting  
❌ Enable proper security controls  

### Production Recommendation:
**DO NOT deploy this application to production without implementing Phase 2 (backend proxy).**

For production use:
1. Implement a backend server (Express, Next.js, or serverless)
2. Move all API calls to server-side routes
3. Implement proper authentication and authorization
4. Add server-side rate limiting
5. Set up monitoring and logging
6. Use secret management services (AWS Secrets Manager, etc.)

---

## 🔒 Security Best Practices

### For Development:
- Never commit `.env.local` or `.env` files
- Use `.env.example` as a template
- Rotate keys if accidentally exposed
- Use separate API keys for dev/staging/prod

### For Production:
- Implement backend proxy (Phase 2)
- Use environment-specific keys
- Enable API key restrictions (IP, domain, etc.)
- Set up quota alerts
- Monitor API usage
- Implement request logging
- Use HTTPS only
- Add authentication/authorization

---

## 📊 Risk Assessment

### Before Fix:
- **Exposure Risk**: 🔴 CRITICAL (keys in source code)
- **Abuse Risk**: 🔴 CRITICAL (anyone can use keys)
- **Cost Risk**: 🔴 HIGH (quota exhaustion possible)

### After Phase 1:
- **Exposure Risk**: 🟡 MEDIUM (keys in browser bundle)
- **Abuse Risk**: 🟡 MEDIUM (requires technical knowledge)
- **Cost Risk**: 🟡 MEDIUM (rate limiting helps)

### After Phase 2 (Backend):
- **Exposure Risk**: 🟢 LOW (keys server-side only)
- **Abuse Risk**: 🟢 LOW (proper auth required)
- **Cost Risk**: 🟢 LOW (server-side controls)

---

## ✅ Acceptance Criteria

Phase 1 is complete when:
- [ ] No hardcoded API credentials in source code
- [ ] All API keys loaded from environment variables
- [ ] `.env.example` file created with all required variables
- [ ] `.gitignore` properly excludes `.env*` files
- [ ] README updated with setup instructions
- [ ] Warning comments added about client-side exposure
- [ ] Application runs successfully with environment variables
- [ ] All existing functionality works as before

---

## 📝 Next Steps After Phase 1

1. **Immediate**: Test the application with environment variables
2. **Short-term**: Plan Phase 2 backend implementation
3. **Medium-term**: Implement backend proxy
4. **Long-term**: Add authentication, monitoring, and advanced security

---

## 🔗 References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Twelve-Factor App: Config](https://12factor.net/config)

---

**Status**: Phase 1 implementation in progress  
**Last Updated**: 2025-11-05  
**Owner**: Development Team


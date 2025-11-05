# MenuMiner Deployment Checklist

## 🔧 Development Setup

### Initial Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Obtain Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- [ ] Obtain Google Search API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Create Custom Search Engine at [Programmable Search](https://programmablesearchengine.google.com/)
- [ ] Fill in all API keys in `.env.local`
- [ ] Run `npm run dev` to test locally
- [ ] Verify all functionality works

### Environment Variables Required
```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_CX=your_custom_search_engine_id_here
```

---

## 🧪 Testing Checklist

### Functionality Tests
- [ ] Upload menu image (JPEG, PNG, WebP, GIF)
- [ ] Verify image preview displays
- [ ] Enter restaurant name
- [ ] Click "Extract & Find Images"
- [ ] Verify loading spinner appears
- [ ] Verify menu items are extracted
- [ ] Verify images load for each item
- [ ] Click menu item to open gallery
- [ ] Verify gallery modal displays all images
- [ ] Click image in gallery to zoom
- [ ] Press Escape to close gallery
- [ ] Click "Clear Image" button
- [ ] Verify state resets

### Security Tests
- [ ] Try uploading non-image file (should reject)
- [ ] Try uploading file > 10MB (should reject)
- [ ] Try empty restaurant name (should show error)
- [ ] Try restaurant name < 2 chars (should show error)
- [ ] Make 11 requests quickly (should hit rate limit)
- [ ] Verify XSS protection (try `<script>` in restaurant name)

### Error Handling Tests
- [ ] Test with invalid API keys (should show error)
- [ ] Test with missing environment variables (should show error)
- [ ] Test with poor quality menu image
- [ ] Test with network disconnected
- [ ] Verify error messages are user-friendly

---

## 🏗️ Build & Production

### Pre-Deployment Checks
- [ ] Run `npm run build` successfully
- [ ] Run `npm run preview` to test production build
- [ ] Verify no console errors in production mode
- [ ] Test all functionality in production build
- [ ] Check bundle size (should be ~400KB)
- [ ] Verify environment variables are loaded

### ⚠️ CRITICAL: Production Security

**DO NOT DEPLOY TO PUBLIC PRODUCTION WITHOUT BACKEND PROXY**

Current implementation exposes API keys in client-side bundle. This is acceptable for:
- ✅ Personal projects
- ✅ Internal tools
- ✅ Development/testing
- ✅ Localhost usage

This is NOT acceptable for:
- ❌ Public websites
- ❌ Commercial applications
- ❌ Applications with untrusted users
- ❌ High-traffic applications

### For Production Deployment

**Option 1: Add Backend Proxy (Recommended)**
- [ ] Implement Express/Next.js backend
- [ ] Create API proxy endpoints
- [ ] Move API keys to server-side
- [ ] Update client to call backend instead of Google APIs
- [ ] Add server-side rate limiting
- [ ] Implement authentication
- [ ] Add request logging

**Option 2: Use Serverless Functions**
- [ ] Create Vercel/Netlify functions
- [ ] Move API calls to serverless functions
- [ ] Configure environment variables in platform
- [ ] Update client to call functions
- [ ] Add rate limiting
- [ ] Add monitoring

**Option 3: Migrate to Next.js**
- [ ] Convert to Next.js project
- [ ] Use API routes for backend
- [ ] Move API keys to server-side
- [ ] Implement SSR/SSG where appropriate
- [ ] Add authentication
- [ ] Deploy to Vercel/Netlify

---

## 🔒 Security Hardening

### API Key Management
- [ ] Use separate API keys for dev/staging/prod
- [ ] Enable API key restrictions in Google Cloud Console
  - [ ] Set HTTP referrer restrictions
  - [ ] Set IP address restrictions (if using backend)
  - [ ] Limit to specific APIs only
- [ ] Set up quota alerts in Google Cloud Console
- [ ] Monitor API usage regularly
- [ ] Rotate keys quarterly (or if compromised)

### Application Security
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure Content Security Policy headers
- [ ] Add security headers (X-Frame-Options, etc.)
- [ ] Implement CSRF protection (if using backend)
- [ ] Add authentication/authorization (if needed)
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Configure rate limiting
- [ ] Add request monitoring

### Infrastructure Security
- [ ] Use environment variables (never hardcode)
- [ ] Exclude `.env` files from version control
- [ ] Use secret management service (AWS Secrets Manager, etc.)
- [ ] Enable automatic security updates
- [ ] Set up vulnerability scanning
- [ ] Configure firewall rules
- [ ] Enable DDoS protection
- [ ] Set up backup and recovery

---

## 📊 Monitoring & Maintenance

### Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure API usage alerts
- [ ] Set up performance monitoring
- [ ] Enable log aggregation

### Regular Maintenance
- [ ] Update dependencies monthly (`npm update`)
- [ ] Run security audit weekly (`npm audit`)
- [ ] Review API usage and costs
- [ ] Check error logs
- [ ] Monitor rate limit violations
- [ ] Review and rotate API keys quarterly
- [ ] Update documentation as needed

---

## 🚀 Deployment Platforms

### Vercel (Recommended for Next.js)
- [ ] Connect GitHub repository
- [ ] Configure environment variables in dashboard
- [ ] Set up production/preview environments
- [ ] Configure custom domain
- [ ] Enable automatic deployments
- [ ] Set up monitoring

### Netlify
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Set up Netlify Functions (if using)
- [ ] Configure custom domain
- [ ] Enable automatic deployments

### AWS (S3 + CloudFront)
- [ ] Create S3 bucket
- [ ] Configure static website hosting
- [ ] Set up CloudFront distribution
- [ ] Configure SSL certificate
- [ ] Set up environment variables (if using Lambda)
- [ ] Configure CloudWatch monitoring

### Self-Hosted
- [ ] Set up web server (Nginx, Apache)
- [ ] Configure SSL certificate (Let's Encrypt)
- [ ] Set up environment variables
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Configure automatic updates
- [ ] Set up backup system

---

## 📝 Documentation

### Required Documentation
- [ ] README.md with setup instructions
- [ ] API key acquisition guide
- [ ] Environment variable configuration
- [ ] Deployment instructions
- [ ] Security considerations
- [ ] Troubleshooting guide
- [ ] Contributing guidelines (if open source)

### Code Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Document security utilities
- [ ] Explain design decisions
- [ ] Add inline comments for tricky code
- [ ] Update architecture documentation

---

## ✅ Final Pre-Launch Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] Code follows project style guide
- [ ] All functions have proper error handling
- [ ] No TODO comments left unresolved

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Caching headers set

### Accessibility
- [ ] All images have alt text
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader tested

### SEO (if applicable)
- [ ] Meta tags configured
- [ ] Open Graph tags added
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Analytics set up

### Legal
- [ ] Privacy policy added (if collecting data)
- [ ] Terms of service added (if needed)
- [ ] Cookie consent (if using cookies)
- [ ] License file included
- [ ] Attribution for third-party code

---

## 🎯 Post-Deployment

### Immediate (First 24 Hours)
- [ ] Monitor error logs
- [ ] Check API usage
- [ ] Verify all functionality works
- [ ] Test from different devices/browsers
- [ ] Monitor performance metrics
- [ ] Check for any security alerts

### First Week
- [ ] Review user feedback (if applicable)
- [ ] Monitor API costs
- [ ] Check for any errors or issues
- [ ] Verify rate limiting is working
- [ ] Review analytics data

### Ongoing
- [ ] Weekly security audits
- [ ] Monthly dependency updates
- [ ] Quarterly API key rotation
- [ ] Regular performance reviews
- [ ] Continuous monitoring

---

## 📞 Support & Resources

### Documentation
- [../README.md](../README.md) - Setup and usage
- [CRITICAL_ISSUES_PLAN.md](CRITICAL_ISSUES_PLAN.md) - Security implementation plan
- [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) - Security features
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was implemented

### External Resources
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Google Gemini API](https://ai.google.dev/)
- [Google Custom Search API](https://developers.google.com/custom-search)
- [OWASP Security Guidelines](https://owasp.org/)

### Getting Help
- Check documentation first
- Search existing issues
- Create detailed bug reports
- Include error messages and logs
- Provide steps to reproduce

---

**Last Updated**: 2025-11-05  
**Version**: 1.0.0  
**Status**: Phase 1 Complete (Environment Variables)


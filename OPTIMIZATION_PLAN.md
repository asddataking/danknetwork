# Comprehensive Optimization Plan

This document outlines remaining easy wins and additional optimizations for the Dank Network codebase.

## ✅ Completed

- SEO Enhancements (sitemap, robots.txt, structured data, enhanced metadata)
- Accessibility Improvements (ARIA labels, keyboard navigation, semantic HTML, skip links)

---

## 🎯 Phase 1: Remaining Easy Wins (4-8 hours)

### 1.1 Image Optimization with Next.js Image (2-3 hours)

**Current State**: Using regular `<img>` tags in several components, missing Next.js Image optimization benefits.

**Impact**: High - Better performance, faster page loads, automatic image optimization

**Files to Update**:
- `components/ShopShowcase.tsx` - Replace `<img>` with Next.js `<Image>` (already imports it but doesn't use it)
- `components/FreshDrops.tsx` - Replace `<img>` tags
- `components/VideoCard.tsx` - Replace thumbnail `<img>` with Next.js `<Image>`
- `app/shop/page.tsx` - Replace product images
- `components/FeaturedEpisodeHero.tsx` - Replace hero images

**Tasks**:
- Configure image domains in `next.config.js`:
  - YouTube thumbnails (`i.ytimg.com`, `*.ytimg.com`)
  - Fourthwall images (`*.fourthwall.com`, `*.fourthwallcdn.com`)
  - Unsplash images (`images.unsplash.com`, `*.unsplash.com`)
- Replace all `<img>` tags with `<Image>` component
- Add `width` and `height` or use `fill` for responsive images
- Add `loading="lazy"` for below-fold images
- Add `priority` for above-fold images (hero, featured content)
- Add proper `alt` attributes for all images

**Expected Benefits**:
- Automatic image optimization (WebP, AVIF formats)
- Responsive image serving
- Reduced bandwidth usage
- Better Core Web Vitals scores

---

### 1.2 Replace Console Logs with Structured Logging (2-3 hours)

**Current State**: 61 files contain `console.log`, `console.error`, or `console.warn` statements.

**Impact**: Medium-High - Better production debugging, centralized logging, Sentry integration ready

**Files to Create**:
- `lib/logger.ts` - Centralized logging utility

**Files to Update**:
- `app/api/**/*.ts` - All API routes (10+ files)
- `lib/**/*.ts` - Library functions
- `components/**/*.tsx` - Component error handlers

**Tasks**:
- Create `lib/logger.ts` with:
  - Log levels (debug, info, warn, error)
  - Context tracking (user ID, page, action)
  - Sentry integration hooks
  - Development vs production behavior
  - Sensitive data filtering
- Replace console statements in:
  - API routes (priority: error handling)
  - Critical user flows (auth, payments, uploads)
  - Error boundaries and catch blocks
- Keep `console.log` for development-only debugging (wrapped in `if (process.env.NODE_ENV === 'development')`)

**Expected Benefits**:
- Centralized logging configuration
- Better production error tracking
- Ready for Sentry integration
- Consistent log format across app

---

### 1.3 Sentry Integration (2-3 hours)

**Current State**: ErrorBoundary has TODO for Sentry, but Sentry is not installed.

**Impact**: High - Production error monitoring and debugging

**Tasks**:
- Install `@sentry/nextjs` package
- Create Sentry configuration files:
  - `sentry.client.config.ts` - Client-side initialization
  - `sentry.server.config.ts` - Server-side initialization
  - `sentry.edge.config.ts` - Edge runtime initialization
  - `instrumentation.ts` - Next.js instrumentation hook
- Update `components/ui/ErrorBoundary.tsx` to use `Sentry.captureException()`
- Add Sentry DSN to environment variables
- Configure error sampling and release tracking
- Add user context tracking
- Test error capture in development

**Files to Create**:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`

**Files to Modify**:
- `package.json` - Add Sentry dependency
- `components/ui/ErrorBoundary.tsx` - Add Sentry integration
- `.env.local` - Add `NEXT_PUBLIC_SENTRY_DSN`

**Expected Benefits**:
- Real-time error tracking
- Error grouping and deduplication
- User context in errors
- Performance monitoring
- Release tracking

---

### 1.4 React Performance Optimizations (1-2 hours)

**Current State**: Some components could benefit from memoization and optimization.

**Impact**: Medium - Better rendering performance, reduced re-renders

**Files to Update**:
- `components/VideoCard.tsx` - Add `React.memo`
- `components/RecipeCard.tsx` - Add `React.memo`
- `components/PlaceCard.tsx` - Add `React.memo`
- `components/VideoFeed.tsx` - Add `useCallback` for handlers
- `app/page.tsx` - Optimize video sorting with `useMemo`

**Tasks**:
- Wrap expensive components with `React.memo`
- Use `useCallback` for event handlers passed as props
- Optimize `useMemo` dependencies
- Add `key` props optimization where needed
- Review and optimize expensive computations

**Expected Benefits**:
- Reduced unnecessary re-renders
- Better scroll performance
- Improved interaction responsiveness

---

## 🚀 Phase 2: API & Backend Optimizations (4-6 hours)

### 2.1 API Route Error Handling & Validation (2-3 hours)

**Current State**: Some API routes have basic error handling but could be improved.

**Impact**: High - Better error messages, security, reliability

**Files to Create**:
- `lib/api/validation.ts` - Input validation utilities
- `lib/api/errors.ts` - Standardized error responses
- `lib/api/rate-limit.ts` - Rate limiting utility

**Files to Update**:
- `app/api/subscribe/route.ts` - Enhanced validation
- `app/api/receipts/upload/route.ts` - File validation, size limits
- `app/api/stripe/create-checkout/route.ts` - Input sanitization
- `app/api/places/route.ts` - Query parameter validation

**Tasks**:
- Create validation utilities:
  - Email validation
  - ZIP code validation
  - File type/size validation
  - Input sanitization
- Standardize error responses:
  - Consistent error format
  - Proper HTTP status codes
  - Error codes for client handling
- Add rate limiting:
  - Per-IP rate limiting
  - Per-user rate limiting (for authenticated routes)
  - Configurable limits per endpoint
- Add request logging:
  - Log all API requests
  - Track response times
  - Monitor error rates

**Expected Benefits**:
- Better security (input validation)
- Improved error messages
- Protection against abuse
- Better debugging capabilities

---

### 2.2 API Response Caching (1-2 hours)

**Current State**: Some endpoints have caching, but it's inconsistent.

**Impact**: Medium - Reduced server load, faster responses

**Files to Update**:
- `app/api/filter-options/route.ts` - Already has caching, verify it's optimal
- `app/api/places/route.ts` - Add caching headers
- `app/api/fourthwall/products/route.ts` - Add caching headers
- `app/api/youtube/videos/route.ts` - Add caching headers

**Tasks**:
- Add `Cache-Control` headers to appropriate endpoints
- Use Next.js `revalidate` for ISR where applicable
- Implement stale-while-revalidate for dynamic data
- Add ETag support for conditional requests
- Document cache strategies per endpoint

**Expected Benefits**:
- Reduced API calls
- Faster response times
- Lower server costs
- Better user experience

---

### 2.3 API Route Security Enhancements (1 hour)

**Current State**: Basic security, but could be improved.

**Impact**: High - Protection against common attacks

**Tasks**:
- Add CORS configuration
- Add request size limits
- Add timeout handling
- Validate Content-Type headers
- Add CSRF protection where needed
- Sanitize all user inputs
- Add request ID tracking

**Files to Create**:
- `lib/api/security.ts` - Security utilities

**Expected Benefits**:
- Protection against common attacks
- Better security posture
- Compliance readiness

---

## ⚡ Phase 3: Performance & Bundle Optimizations (3-5 hours)

### 3.1 Code Splitting & Dynamic Imports (2-3 hours)

**Current State**: MapContainer is dynamically imported, but more could be done.

**Impact**: Medium-High - Smaller initial bundle, faster page loads

**Files to Update**:
- `components/VideoModal.tsx` - Dynamic import (heavy component)
- `components/map/MapContainer.tsx` - Already dynamic, verify optimization
- `app/rewards/upload/page.tsx` - Dynamic import file upload components
- `components/auth/AuthModal.tsx` - Consider dynamic import if not critical

**Tasks**:
- Identify heavy components (>50KB)
- Convert to dynamic imports with loading states
- Add prefetching for likely-to-be-used components
- Optimize bundle size analysis

**Expected Benefits**:
- Smaller initial JavaScript bundle
- Faster Time to Interactive (TTI)
- Better Core Web Vitals
- Improved mobile performance

---

### 3.2 Bundle Size Optimization (1-2 hours)

**Current State**: No bundle analysis configured.

**Impact**: Medium - Smaller bundles, faster loads

**Tasks**:
- Add bundle analyzer (`@next/bundle-analyzer`)
- Identify large dependencies
- Replace heavy libraries with lighter alternatives where possible
- Remove unused dependencies
- Optimize imports (tree-shaking)
- Add bundle size monitoring

**Files to Create**:
- `next.config.js` - Add bundle analyzer config
- `scripts/analyze-bundle.js` - Bundle analysis script

**Expected Benefits**:
- Smaller bundle sizes
- Faster page loads
- Better mobile performance
- Lower bandwidth usage

---

## 🔒 Phase 4: Type Safety & Code Quality (2-3 hours)

### 4.1 TypeScript Strict Mode Improvements (1-2 hours)

**Current State**: TypeScript is configured but may not be in strict mode.

**Impact**: Medium - Better type safety, fewer runtime errors

**Tasks**:
- Enable TypeScript strict mode
- Fix any resulting type errors
- Add stricter ESLint rules
- Add type coverage reporting
- Improve type definitions

**Files to Update**:
- `tsconfig.json` - Enable strict mode
- Fix type errors across codebase

**Expected Benefits**:
- Better type safety
- Fewer runtime errors
- Better IDE support
- Self-documenting code

---

### 4.2 Code Quality Improvements (1 hour)

**Current State**: Some TODOs and console statements remain.

**Impact**: Low-Medium - Better maintainability

**Tasks**:
- Remove or address remaining TODOs:
  - `app/api/receipts/upload/route.ts` - Upload limit check
  - `app/rewards/upload/page.tsx` - Upload count from DB
  - `app/account/subscription/page.tsx` - Cancel subscription API
- Add JSDoc comments to key functions
- Ensure consistent error handling patterns
- Add inline documentation for complex logic

**Expected Benefits**:
- Better code maintainability
- Easier onboarding for new developers
- Reduced technical debt

---

## 📊 Phase 5: Monitoring & Analytics (2-3 hours)

### 5.1 Performance Monitoring (1-2 hours)

**Current State**: No performance monitoring in place.

**Impact**: Medium - Visibility into performance issues

**Tasks**:
- Add Web Vitals tracking
- Implement Real User Monitoring (RUM)
- Add performance budgets
- Track Core Web Vitals
- Set up performance alerts

**Expected Benefits**:
- Visibility into performance issues
- Data-driven optimization decisions
- Better user experience monitoring

---

### 5.2 Analytics Integration (1 hour)

**Current State**: CSP mentions Google Analytics but may not be implemented.

**Impact**: Low-Medium - User behavior insights

**Tasks**:
- Verify Google Analytics implementation
- Add event tracking for key actions
- Set up conversion tracking
- Add privacy-compliant analytics
- Document analytics events

**Expected Benefits**:
- User behavior insights
- Conversion tracking
- Data-driven product decisions

---

## 🎯 Priority Order & Time Estimates

### Quick Wins (Can do today - 4-6 hours)
1. **Image Optimization** (2-3 hours) - High impact
2. **React Performance** (1-2 hours) - Medium impact
3. **Code Quality** (1 hour) - Low impact, easy cleanup

### This Week (8-12 hours)
1. **Replace Console Logs** (2-3 hours)
2. **Sentry Integration** (2-3 hours)
3. **API Error Handling** (2-3 hours)
4. **Bundle Optimization** (1-2 hours)

### This Month (15-20 hours)
1. **API Caching** (1-2 hours)
2. **API Security** (1 hour)
3. **Code Splitting** (2-3 hours)
4. **TypeScript Strict** (1-2 hours)
5. **Performance Monitoring** (1-2 hours)

---

## 📈 Success Metrics

Track these metrics to measure optimization impact:

### Performance
- Lighthouse scores (aim for 90+)
- Core Web Vitals (LCP, FID, CLS)
- Bundle size reduction
- API response times

### Quality
- Error rate reduction
- Type coverage percentage
- Test coverage (if tests added)
- Code quality scores

### Developer Experience
- Build time reduction
- Development server startup time
- Hot reload performance
- TypeScript compilation time

---

## 🚦 Implementation Notes

1. **Test after each change**: Don't batch too many updates
2. **Measure before/after**: Use Lighthouse and bundle analyzer
3. **Incremental improvements**: Small, focused changes are better
4. **Document decisions**: Update relevant docs as you go
5. **Monitor in production**: Watch for regressions

---

## 📝 Next Steps

1. Start with Image Optimization (highest impact, easy win)
2. Then React Performance (quick improvements)
3. Then Sentry Integration (critical for production)
4. Then API improvements (security and reliability)

**Current Focus**: Phase 1 Easy Wins  
**Next Milestone**: All Phase 1 items complete  
**Long-term Goal**: Production-ready, performant, maintainable codebase


# Dank Network - Master Guide

**Complete guide to the unified Dank Network application.**

---

## 📚 Quick Links

- **[Setup Guide](#setup-guide)** - Get started quickly
- **[Architecture](#architecture)** - System overview
- **[Components](#components)** - Reusable UI components
- **[Next Steps](#next-steps)** - What to build next

---

## Setup Guide

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (for payments)
- Google Gemini API key (for receipt OCR)

### Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_PREMIUM_PRICE_ID=your_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Gemini (for receipt OCR)
GEMINI_API_KEY=your_gemini_key

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

1. Apply migrations:
```bash
# In Supabase Dashboard > SQL Editor, run:
supabase/migrations/001_create_deals_tables.sql
supabase/migrations/002_add_user_preferences_and_brand.sql
supabase/migrations/004_create_rewards_system.sql (when ready)
supabase/migrations/005_unified_subscriptions.sql
```

2. Create storage bucket:
- Go to Storage > Create bucket
- Name: `receipts`
- Public: ✅ Yes
- Configure RLS policies (see PUBLIC_ACCESS_GUIDE.md)

### Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## Architecture

### Core Systems

#### 1. Authentication (Supabase Auth)
- **Single source**: `useAuth()` hook
- **Public by default**: Only interactive features require auth
- **Components**: `AuthGuard`, `AuthModal`

#### 2. Premium Subscriptions
- **Single source**: `subscriptions` table
- **Check**: `usePremium()` hook
- **Plan**: $4.20/month network-wide premium
- **Components**: `PremiumGuard`, `PremiumBadge`, `UpgradePrompt`

#### 3. Receipt Upload & OCR
- **Engine**: Google Gemini Flash
- **Cost**: ~$0.0001 per receipt
- **Storage**: Supabase Storage (`receipts` bucket)
- **Points**: $1 = 2 points (3x for premium)

#### 4. Daily Dispo Deals
- **Extraction**: Gemini Flash from HTML
- **Newsletter**: MailerSend
- **Tiers**: Free (top 3) vs Premium (full list)

### Database Schema

```
auth.users (Supabase managed)
  ↓
subscriptions (network-wide premium)
  ↓
user_profiles (DankPass rewards)
  ↓
receipts, perks, points_transactions

newsletter_subscribers (Daily Deals)
  ↓ links to
auth.users (via user_id)
```

### Key Helpers

```typescript
// Auth
import { useAuth } from '@/hooks/useAuth';
const { user, isAuthenticated, signIn, signOut } = useAuth();

// Premium
import { usePremium } from '@/hooks/usePremium';
const { isPremium, subscription } = usePremium();

// Server-side premium check
import { isUserPremium } from '@/lib/subscription/premium';
const premium = await isUserPremium(userId);
```

---

## Components

See **COMPONENTS_GUIDE.md** for full documentation.

### Auth Components
- `<AuthGuard>` - Protect auth-required pages
- `<PremiumGuard>` - Protect premium features
- `<AuthModal>` - Sign in/sign up modal

### Premium Components
- `<PremiumBadge>` - Show premium status
- `<SubscriptionStatus>` - Subscription details
- `<UpgradePrompt>` - Encourage upgrades

### UI Components
- `<LoadingSkeleton>` - Better loading UX
- `<ErrorBoundary>` - Catch errors
- `<ErrorMessage>` - Display errors

---

## Features

### ✅ Implemented

#### DankPass Rewards
- Profile dashboard with points & tier
- Receipt upload with Gemini OCR
- Perks browsing & redemption
- Premium multipliers (1.5x points)

#### Daily Dispo Deals
- Email newsletter subscription
- Premium vs free tiers
- Gemini-powered deal extraction
- Cron-based daily sends

#### Subscription System
- Unified premium ($4.20/mo)
- Stripe integration
- Subscription management page
- Webhook handling

### 🚧 Ready When Tables Applied

- Receipt points awarded to accounts
- Perk redemption tracking
- Points transactions log
- Partner multipliers

---

## Next Steps

See **NEXT_STEPS.md** for detailed roadmap.

### Phase 1: Polish & Test (1-2 days)
- Test receipt upload flow
- Configure storage policies
- Test auth flow end-to-end
- Mobile responsive check

### Phase 2: Public-First UI (2-3 days)
- Make rewards pages browsable
- Add auth CTAs to interactions
- Demo content for non-auth users
- Smooth sign-in redirects

### Phase 3: Apply Rewards Tables (When Ready)
- Run migration 004
- Connect receipt upload to DB
- Enable perk redemption
- Points transactions

### Phase 4: Admin Dashboard (Future)
- Manual receipt review
- User management
- Analytics dashboard
- Partner management

---

## Key Learnings

1. **Public First**: Let users explore before auth
2. **One Premium**: Single subscription unlocks everything
3. **Gemini Flash**: 100x cheaper than GPT-4 Vision
4. **Unified Auth**: One `useAuth()` hook everywhere
5. **Component Library**: Build once, use everywhere

---

## Troubleshooting

### Receipt Upload Fails
- Check `GEMINI_API_KEY` is set
- Restart dev server after env changes
- Verify storage bucket exists
- Check console for detailed errors

### Auth Not Working
- Verify Supabase env vars
- Check RLS policies
- Clear browser cache
- Check auth.users table

### Premium Not Showing
- Verify subscriptions table migration
- Check RPC functions exist
- Test with actual Stripe subscription
- Check webhook is configured

---

## Documentation Files

- **MASTER_GUIDE.md** (this file) - Complete overview
- **COMPONENTS_GUIDE.md** - Component API reference
- **PUBLIC_ACCESS_GUIDE.md** - Public vs auth patterns
- **RECEIPT_UPLOAD_IMPLEMENTATION.md** - Receipt system details
- **FINAL_IMPLEMENTATION_SUMMARY.md** - What was built
- **SETUP_CHECKLIST.md** - Step-by-step setup
- **ENV_SETUP.md** - Environment variables
- **DEAL_EXTRACTION_*.md** - Daily deals system
- **STRIPE_INTEGRATION_SETUP.md** - Stripe configuration

---

## Support

Questions? Check:
1. This guide first
2. Specific guide for your feature
3. Code comments in `lib/` and `components/`
4. Supabase/Stripe/Gemini docs

---

**Built with**: Next.js 14 • TypeScript • Supabase • Stripe • Gemini Flash • Tailwind CSS


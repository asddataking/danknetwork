# 🚀 Quick Start - Unified Premium System

## ⚡ Instant Reference

### What Was Built
✅ **One $4.20/month subscription** unlocks ALL premium features  
✅ **Supabase Auth** powers authentication  
✅ **Unified subscriptions table** is the single source of truth  
✅ **Stripe integration** handles payments & webhooks  
✅ **React hooks** make it easy to use in components  

---

## 🔥 For Development

### 1. Environment Setup
Copy these to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Database
The migration is **already applied** to your Supabase project! ✅
```
Project ID: svxaujkqspifjrzphqvs
Migration: 005_unified_subscriptions.sql
```

### 3. Test It
```bash
npm run dev

# Go to http://localhost:3000/deals
# Click Premium → Enter test info → Use card 4242 4242 4242 4242
# Check Supabase subscriptions table for new record
# Go to /rewards to see premium status
```

---

## 💻 Usage in Code

### Check Premium Status (Server)
```typescript
import { isUserPremium } from '@/lib/subscription/premium';

const premium = await isUserPremium(userId);
```

### Check Premium Status (Client)
```typescript
import { usePremium } from '@/hooks/usePremium';

function MyComponent() {
  const { isPremium, loading } = usePremium();
  
  return isPremium ? <Premium /> : <Free />;
}
```

### Get Auth State (Client)
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (!isAuthenticated) return <SignInPrompt />;
  return <Dashboard user={user} />;
}
```

---

## 📋 Key Files

### Auth & Premium Logic
- `lib/auth/supabase.ts` - Auth helpers
- `lib/subscription/premium.ts` - Premium checks
- `hooks/useAuth.ts` - Auth React hook
- `hooks/usePremium.ts` - Premium React hook

### Stripe Integration
- `lib/stripe.ts` - Stripe client & checkout
- `app/api/stripe/webhook/route.ts` - Webhook handler

### Database
- `supabase/migrations/005_unified_subscriptions.sql` - Applied ✅

### Documentation
- `IMPLEMENTATION_SUMMARY.md` - Read this!
- `UNIFIED_PREMIUM_IMPLEMENTATION.md` - Technical details
- `OPTIMIZATION_SUMMARY.md` - Performance info

---

## ✅ What Works Now

✅ Stripe checkout creates user + subscription  
✅ Webhooks update subscription status  
✅ Premium status checked from subscriptions table  
✅ Rewards pages use real auth & premium  
✅ Components use React hooks for state  
✅ Database has proper indexes & RLS  

---

## 📝 What's Next

### Before Launch
1. Set production environment variables
2. Configure Stripe webhook in dashboard
3. Test complete subscription flow
4. Add auth UI pages (sign in/up)
5. Add subscription management page

### Soon After
1. Apply rewards migration (004) when ready
2. Update deals page with auth UI
3. Add email verification
4. Monitor webhook success rates

---

## 🆘 Quick Troubleshooting

**Premium not working?**
```sql
-- Check subscription in Supabase:
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';
```

**Webhook failing?**
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Verify endpoint URL: `https://yourdomain.com/api/stripe/webhook`
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

**Can't see premium features?**
- Clear cache & cookies
- Check auth state in DevTools
- Verify subscription status = 'active'

---

## 🎯 One-Minute Summary

```
User subscribes → Stripe checkout → Webhook creates subscription
                                  → Links to auth.users
                                  → Links newsletter_subscribers

App checks premium → isUserPremium(userId)
                   → Queries subscriptions table
                   → Returns true/false

React components → usePremium() hook
                → Shows premium features or upgrade prompt
```

**One subscription. All features. Clean code. Let's ship it! 🔥**

---

*Need details? Read `IMPLEMENTATION_SUMMARY.md`*  
*Need help? Check `UNIFIED_PREMIUM_IMPLEMENTATION.md`*


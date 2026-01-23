# Stripe Current Setup Documentation

**Last Updated:** 2025-01-XX  
**Purpose:** Document how Stripe is currently configured and integrated in DankNetwork to prevent breaking changes during refactoring.

---

## Environment Variables

**Required Variables:**
- `STRIPE_SECRET_KEY` - Stripe secret key (server-side only, starts with `sk_test_` or `sk_live_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (client-side, starts with `pk_test_` or `pk_live_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)
- `STRIPE_PREMIUM_PRICE_ID` - Price ID for $4.20/mo Premium plan (starts with `price_`)
- `NEXT_PUBLIC_SITE_URL` - Site URL for redirects (e.g., `https://danknetwork.com` or `http://localhost:3000`)

**Note:** Never log or expose secret values. Only reference variable names.

---

## Stripe Initialization

**File:** `lib/stripe.ts`

- Stripe SDK initialized with `STRIPE_SECRET_KEY`
- API Version: `2025-11-17.clover`
- TypeScript enabled
- Returns `null` if `STRIPE_SECRET_KEY` is not configured (graceful degradation)

**Key Functions:**
- `isStripeConfigured()` - Checks if all required env vars are present
- `createCheckoutSession({ email, zip })` - Creates subscription checkout session
- `constructWebhookEvent(payload, signature)` - Verifies webhook signatures
- `getCustomerSubscriptions(customerId)` - Gets active subscriptions for a customer
- `cancelSubscription(subscriptionId)` - Cancels a subscription

---

## Checkout Flow

### Entry Point
**File:** `app/api/stripe/create-checkout/route.ts`  
**Route:** `POST /api/stripe/create-checkout`

**Request Body:**
```typescript
{
  email: string;      // Required
  zip: string;       // Required, 5 digits
}
```

**Flow:**
1. Validates Stripe configuration
2. Validates email and ZIP code (5 digits)
3. Pre-creates newsletter subscriber with `tier: 'free'` (via `createSubscriber()`)
4. Creates Stripe Checkout Session via `createCheckoutSession()`
5. Returns checkout URL for redirect

**Checkout Session Configuration:**
- Mode: `subscription` (recurring)
- Payment methods: `['card']`
- Price: Uses `STRIPE_PREMIUM_PRICE_ID` from env
- Customer email: Pre-filled from request
- Metadata: Includes `email`, `zip`, `tier: 'premium'`
- Success URL: `${NEXT_PUBLIC_SITE_URL}/deals?success=true&session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `${NEXT_PUBLIC_SITE_URL}/deals?canceled=true`
- Promotion codes: Enabled (`allow_promotion_codes: true`)

**Response:**
```typescript
{
  success: boolean;
  sessionId?: string;
  url?: string;      // Redirect user to this URL
  error?: string;
}
```

---

## Webhook Handler

**File:** `app/api/stripe/webhook/route.ts`  
**Route:** `POST /api/stripe/webhook`

**Events Handled:**

1. **`checkout.session.completed`**
   - Triggered when user completes payment
   - Finds or creates user in `auth.users` by email
   - Creates unified subscription record in `subscriptions` table
   - Links newsletter subscriber to user account
   - Updates legacy `tier` field to `'premium'` (backward compatibility)
   - Sends welcome email via MailerSend (if configured)

2. **`customer.subscription.deleted`**
   - Triggered when subscription is canceled
   - Updates `subscriptions` table: `status = 'canceled'`, sets `canceled_at`
   - Updates legacy `tier` field to `'free'` (backward compatibility)

3. **`customer.subscription.updated`**
   - Triggered on subscription changes (status, period, etc.)
   - Updates `subscriptions` table with new status and period dates
   - Updates legacy `tier` field based on status (active = premium, else = free)

4. **`invoice.payment_succeeded`**
   - Logged but no action needed (subscription already active)

5. **`invoice.payment_failed`**
   - Logged for monitoring (consider sending user notification)

**Webhook Security:**
- Verifies signature using `STRIPE_WEBHOOK_SECRET`
- Returns 400 if signature is invalid
- Uses `constructWebhookEvent()` from `lib/stripe.ts`

---

## Database Schema

### Unified Subscriptions Table
**Migration:** `supabase/migrations/005_unified_subscriptions.sql`

**Table:** `public.subscriptions`

**Columns:**
- `id` (UUID, primary key)
- `user_id` (UUID, references `auth.users`)
- `plan_id` (TEXT, default: `'network_premium'`)
- `status` (TEXT, enum: `'active'`, `'canceled'`, `'past_due'`, `'trialing'`, etc.)
- `current_period_start` (TIMESTAMPTZ)
- `current_period_end` (TIMESTAMPTZ)
- `cancel_at_period_end` (BOOLEAN)
- `canceled_at` (TIMESTAMPTZ)
- `stripe_customer_id` (TEXT)
- `stripe_subscription_id` (TEXT, unique)
- `stripe_price_id` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Key Functions:**
- `is_user_premium(p_user_id)` - Returns boolean if user has active premium subscription
- `get_user_subscription(p_user_id)` - Returns active subscription details
- `upsert_subscription(...)` - Creates or updates subscription (used by webhooks)

**RLS Policies:**
- Users can view their own subscriptions
- Service role can manage all subscriptions (for webhooks)

### Legacy Fields (Deprecated but Still Used)
- `user_profiles.is_premium` - Deprecated, use `subscriptions` table
- `user_profiles.stripe_customer_id` - Deprecated, use `subscriptions.stripe_customer_id`
- `user_profiles.stripe_subscription_id` - Deprecated, use `subscriptions.stripe_subscription_id`
- `newsletter_subscribers.tier` - Deprecated, use `subscriptions` table via `user_id`

---

## Premium Status Checking

### Server-Side
**File:** `lib/subscription/premium.ts`

**Functions:**
- `isUserPremium(userId, useServiceRole?)` - Checks if user has active premium subscription
- `getUserSubscription(userId, useServiceRole?)` - Gets user's active subscription
- `getUserSubscriptions(userId, useServiceRole?)` - Gets all subscriptions (including inactive)
- `isNewsletterSubscriberPremium(email)` - Checks premium status for newsletter subscriber (backward compatibility)

**Implementation:**
- Uses RPC functions: `is_user_premium()` and `get_user_subscription()`
- Checks `subscriptions` table for `plan_id = 'network_premium'` and `status = 'active'`
- Validates `current_period_end > NOW()` if present

### Client-Side Hook
**File:** `hooks/usePremium.ts`

**Usage:**
```typescript
const { isPremium, subscription, loading } = usePremium();
```

**Behavior:**
- Automatically checks premium status when user is authenticated
- Returns `loading: true` while checking
- Returns `isPremium: false` if not authenticated or no active subscription

---

## Components Using Premium Status

1. **`components/subscription/SubscriptionStatus.tsx`**
   - Displays current subscription status
   - Shows renewal date or cancellation notice
   - Links to `/rewards/premium` for upgrade

2. **`components/subscription/PremiumBadge.tsx`**
   - Displays premium badge icon/text
   - Used throughout UI to indicate premium features

3. **`components/auth/PremiumGuard.tsx`**
   - Protects premium-only features
   - Shows upgrade prompt if user is not premium
   - Redirects to upgrade page

4. **`components/subscription/UpgradePrompt.tsx`**
   - Displays upgrade CTA
   - Links to premium upgrade page

---

## Premium Upgrade Pages

**Current Route:** `/rewards/premium`  
**File:** `app/rewards/premium/page.tsx`

**Features:**
- Displays premium benefits
- Shows current subscription status if user is premium
- Triggers checkout via `/api/stripe/create-checkout`
- Handles success/cancel redirects from Stripe

**Note:** Success/cancel URLs currently point to `/deals` - this may need updating if routes change.

---

## Success/Cancel URLs

**Current Configuration:**
- Success: `${NEXT_PUBLIC_SITE_URL}/deals?success=true&session_id={CHECKOUT_SESSION_ID}`
- Cancel: `${NEXT_PUBLIC_SITE_URL}/deals?canceled=true`

**Note:** These URLs are hardcoded in `lib/stripe.ts` `createCheckoutSession()`. If routes change, update these URLs accordingly.

---

## Edge Cases & Known Behaviors

1. **User Creation During Checkout:**
   - If user doesn't exist in `auth.users`, webhook creates account automatically
   - User will need to set password later via magic link/reset

2. **Newsletter Subscriber Linking:**
   - Newsletter subscribers are linked to `auth.users` via `user_id` column
   - Allows premium status to flow from subscriptions → user → newsletter

3. **Legacy Tier Field:**
   - `newsletter_subscribers.tier` is still updated for backward compatibility
   - Email filtering may still use this field

4. **Multiple Subscriptions:**
   - Currently only supports one plan: `network_premium`
   - `UNIQUE(user_id, plan_id, status)` constraint prevents duplicates

5. **Subscription Status:**
   - Only `status = 'active'` grants premium access
   - `trialing` and `past_due` are considered active in `get_user_subscription()` but not in `is_user_premium()`

6. **Graceful Degradation:**
   - If Stripe is not configured, checkout API returns error
   - Premium checks return `false` if Stripe is unavailable
   - No crashes if env vars are missing

---

## Testing Checklist

Before making changes to Stripe integration, verify:

- [ ] Checkout session creation works
- [ ] Webhook signature verification works
- [ ] `checkout.session.completed` creates subscription record
- [ ] `customer.subscription.deleted` cancels subscription
- [ ] `customer.subscription.updated` updates subscription
- [ ] Premium status check returns correct value
- [ ] Success/cancel redirects work
- [ ] Legacy tier field is updated (backward compatibility)
- [ ] Welcome email is sent (if MailerSend configured)

---

## Files to NOT Modify Without Careful Review

1. `lib/stripe.ts` - Core Stripe initialization and helpers
2. `app/api/stripe/webhook/route.ts` - Critical webhook handler
3. `lib/subscription/premium.ts` - Premium status checking logic
4. `supabase/migrations/005_unified_subscriptions.sql` - Database schema

---

## Migration Notes

If routes change (e.g., `/deals` → `/dankpass/premium`):

1. Update success/cancel URLs in `lib/stripe.ts` `createCheckoutSession()`
2. Update any hardcoded links in components
3. Ensure webhook handler still works (it doesn't depend on URLs)
4. Test end-to-end checkout flow

---

## Support

For Stripe-related issues:
- Check Stripe Dashboard → Logs for webhook events
- Verify webhook endpoint is configured correctly
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Test with Stripe CLI locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

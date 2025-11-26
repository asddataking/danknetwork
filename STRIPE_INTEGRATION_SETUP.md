# Stripe Integration for Daily Dispo Deals Premium

## ✅ What Was Built

### 1. **Stripe Client & Helpers** (`lib/stripe.ts`)
- Initialized Stripe SDK with API key
- `createCheckoutSession()` - Creates subscription checkout for $4.20/mo
- `constructWebhookEvent()` - Verifies webhook signatures
- Helper functions for subscription management
- Configuration checks

### 2. **Checkout API** (`app/api/stripe/create-checkout/route.ts`)
- Creates Stripe Checkout Session for Premium subscriptions
- Pre-creates subscriber in database (as 'free' tier initially)
- Returns checkout URL for redirect
- Handles errors gracefully

### 3. **Webhook Handler** (`app/api/stripe/webhook/route.ts`)
Handles these Stripe events:
- ✅ `checkout.session.completed` - Upgrades subscriber to premium, sends welcome email
- ✅ `customer.subscription.deleted` - Downgrades to free tier when canceled
- ✅ `customer.subscription.updated` - Handles status changes
- ✅ `invoice.payment_succeeded` - Confirms active subscription
- ✅ `invoice.payment_failed` - Logs failed payments

### 4. **Updated /deals Page** (`app/deals/page.tsx`)
- Premium button redirects to Stripe Checkout
- Free button uses simple subscribe flow
- Success/cancel handling after Stripe redirect
- Loading states for both flows

---

## 🔧 Required Setup

### Step 1: Install Stripe (Already Done ✅)
```bash
npm install stripe @stripe/stripe-js
```

### Step 2: Get Your Stripe API Keys

1. **Sign up/Login to Stripe**: https://dashboard.stripe.com/
2. **Get API Keys**:
   - Go to: **Developers → API keys**
   - Copy **Secret key** (starts with `sk_test_...` or `sk_live_...`)
   - Copy **Publishable key** (starts with `pk_test_...` or `pk_live_...`)

### Step 3: Create Premium Product & Price

1. Go to **Products** in Stripe Dashboard
2. Click **Add Product**
3. Fill in details:
   - **Name**: `Daily Dispo Deals - Premium`
   - **Description**: `Daily dispensary deals with premium features`
4. Under **Pricing**:
   - **Pricing model**: Standard pricing
   - **Price**: `$4.20 USD`
   - **Billing period**: Monthly (Recurring)
5. Click **Save product**
6. **Copy the Price ID** (looks like `price_1AbCdEfGhIjKlMnO`)

### Step 4: Add Environment Variables

Add these to `.env.local` and Vercel:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Premium Product Price ID
STRIPE_PREMIUM_PRICE_ID=price_your_price_id_here

# Site URL (for Stripe redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# In production: NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Webhook Secret (get this in Step 5)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 5: Set Up Webhooks

#### For Production (Vercel):

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing Secret** (starts with `whsec_...`)
7. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET=whsec_...`

#### For Local Testing:

**Option 1: Use Stripe CLI (Recommended)**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret it displays
# Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...
```

**Option 2: Skip webhook testing locally**
- Webhooks only needed for subscription lifecycle events
- You can test checkout without webhooks (just won't upgrade tier automatically)
- Test webhooks in production after deployment

---

## 🎯 User Flow

### Free Tier Signup:
1. User fills form with email/ZIP
2. Selects "Free" tier
3. Clicks "Get today's deals 🔥"
4. API saves subscriber to Supabase as 'free'
5. Sends welcome email via MailerSend
6. Shows success message

### Premium Tier Signup:
1. User fills form with email/ZIP
2. Selects "Premium" tier ($4.20/mo)
3. Clicks "Continue to Payment 🔥"
4. API pre-creates subscriber in Supabase as 'free'
5. Redirects to Stripe Checkout
6. User enters payment info on Stripe
7. After successful payment:
   - Stripe sends webhook to `/api/stripe/webhook`
   - Webhook upgrades subscriber to 'premium'
   - Webhook sends premium welcome email
   - User redirected back to `/deals?success=true`
8. Shows "Payment Successful!" message

### Subscription Management:
- **Active**: User stays premium, gets daily emails
- **Canceled**: Webhook downgrades to free tier, gets weekly emails
- **Failed Payment**: Webhook logs error, subscription may pause

---

## 🧪 Testing

### Test Locally:

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Visit**: http://localhost:3000/deals

3. **Test Free signup**:
   - Fill form, select Free
   - Should see success message
   - Check Supabase for subscriber entry
   - Check email for welcome message

4. **Test Premium signup** (with Stripe CLI running):
   - Fill form, select Premium
   - Should redirect to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Complete payment
   - Should redirect back with success message
   - Check Supabase - tier should be 'premium'
   - Check email for premium welcome message

### Stripe Test Cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`
- More: https://stripe.com/docs/testing

---

## 📊 Monitoring & Management

### View Subscriptions:
- **Stripe Dashboard → Customers**
- See all subscribers, payment history, subscription status

### View Events:
- **Stripe Dashboard → Developers → Events**
- See all webhook events and their status

### Check Webhook Logs:
- **Stripe Dashboard → Developers → Webhooks → Your endpoint**
- View webhook delivery attempts and responses

### Cancel Subscriptions:
- **Stripe Dashboard → Customers → Select customer → Cancel subscription**
- Webhook will automatically downgrade user to free tier

---

## 🔐 Security Notes

1. **Never expose `STRIPE_SECRET_KEY`** - Only use server-side
2. **Always verify webhook signatures** - Already handled in `constructWebhookEvent()`
3. **Use environment variables** - Never hardcode keys
4. **Test mode vs Live mode**:
   - Test keys start with `sk_test_` and `pk_test_`
   - Live keys start with `sk_live_` and `pk_live_`
   - Use test mode until ready for production

---

## 💰 Pricing & Fees

### Stripe Fees:
- **2.9% + $0.30** per successful charge
- For $4.20 subscription: ~$0.42 fee = **$3.78 net**

### Calculation:
```
Charge: $4.20
Fee: ($4.20 × 0.029) + $0.30 = $0.12 + $0.30 = $0.42
Net: $4.20 - $0.42 = $3.78
```

---

## 🚀 Next Steps

### Immediate (Before Production):
1. ✅ Add all environment variables to `.env.local`
2. ✅ Test free signup flow
3. ✅ Test premium signup flow with test card
4. ✅ Verify webhooks are working (check Stripe Dashboard)

### Before Going Live:
1. Switch to **live API keys** in Stripe Dashboard
2. Update environment variables with live keys
3. Set `NEXT_PUBLIC_SITE_URL` to production domain
4. Create production webhook endpoint
5. Test with real card (maybe your own card first!)

### Future Enhancements:
- Customer portal for managing subscriptions
- Promo codes/coupons
- Annual pricing option ($42/year - save $8.40!)
- Trial period (7 days free?)
- Affiliate/referral system

---

## 📝 Files Created/Modified

### Created:
- ✅ `lib/stripe.ts` - Stripe client and helpers
- ✅ `app/api/stripe/create-checkout/route.ts` - Checkout API
- ✅ `app/api/stripe/webhook/route.ts` - Webhook handler
- ✅ `STRIPE_INTEGRATION_SETUP.md` - This guide

### Modified:
- ✅ `app/deals/page.tsx` - Added Stripe checkout flow
- ✅ `ENV_SETUP.md` - Added Stripe environment variables
- ✅ `package.json` - Added Stripe dependencies

---

## ❓ Troubleshooting

### "Payment processing is not configured"
- Check that all Stripe environment variables are set
- Restart dev server after adding variables

### "Failed to create checkout session"
- Verify `STRIPE_PREMIUM_PRICE_ID` is correct
- Check Stripe Dashboard for errors

### Webhook not firing locally
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check terminal for webhook events

### Subscriber not upgrading to premium
- Check webhook is configured correctly
- View webhook logs in Stripe Dashboard
- Check server logs for errors

### Email not sending after payment
- Verify MailerSend is configured
- Check webhook logs for email errors

---

## 🎉 You're Ready!

Stripe integration is complete! Just add your API keys and test it out.

**Need help?** Check Stripe's excellent documentation: https://stripe.com/docs


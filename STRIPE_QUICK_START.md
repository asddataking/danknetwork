# Stripe Quick Start - Get Premium Payments Working in 5 Minutes

## ✅ Prerequisites
- MailerSend API key already added ✓
- Supabase configured ✓
- Stripe account (free to sign up)

---

## 📋 Quick Setup Checklist

### 1️⃣ Get Stripe API Keys (2 minutes)

1. **Go to**: https://dashboard.stripe.com/test/apikeys
2. **Copy these 2 keys**:
   - **Secret key** (starts with `sk_test_...`)
   - **Publishable key** (starts with `pk_test_...`)

### 2️⃣ Create Premium Product (2 minutes)

1. **Go to**: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Daily Dispo Deals - Premium`
   - **Description**: `Daily dispensary deals with premium features`
   - **Pricing**: 
     - Model: `Standard pricing`
     - Price: `$4.20 USD`
     - Billing period: `Monthly` (recurring)
4. Click **"Save product"**
5. **Copy the Price ID** (looks like `price_1AbCdEfGhIjKlMnO`)

### 3️⃣ Add to Environment Variables (1 minute)

Add to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_paste_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_paste_your_key_here
STRIPE_PREMIUM_PRICE_ID=price_paste_your_price_id_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Don't have a webhook secret yet?** That's fine! Set it to anything for now:
```env
STRIPE_WEBHOOK_SECRET=whsec_placeholder_for_testing
```
(Webhooks only needed for production - we'll set up properly later)

### 4️⃣ Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Restart:
npm run dev
```

### 5️⃣ Test It! (1 minute)

1. Visit: http://localhost:3000/deals
2. Fill email + ZIP
3. Select **Premium**
4. Click **"Continue to Payment"**
5. You should redirect to Stripe Checkout!
6. **Test card**: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Name: anything
7. Complete payment
8. You should redirect back with success message!

---

## 🎉 That's It!

You now have a working Premium subscription system!

### ✅ What's Working:
- Free signups (no payment)
- Premium signups ($4.20/mo via Stripe)
- Stripe Checkout integration
- Success/cancel handling

### 🔧 What's NOT Working Yet:
- Webhooks (user won't auto-upgrade to premium after payment)
- This is fine for testing! We'll set up webhooks before production.

---

## 🚀 To Get Webhooks Working Locally (Optional)

**Using Stripe CLI:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret it displays, then add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_the_secret_from_cli
```

Restart dev server and test again! Now subscribers will auto-upgrade to Premium after payment.

---

## 📝 Before Going to Production

1. **Switch to live keys**: https://dashboard.stripe.com/apikeys (toggle "Test mode" off)
2. **Set up production webhook**:
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel
3. **Update environment variables** on Vercel with live keys
4. **Test with a real card** (your own first!)

---

## 💡 Quick Tips

- **Test cards**: https://stripe.com/docs/testing
- **View transactions**: https://dashboard.stripe.com/test/payments
- **View subscriptions**: https://dashboard.stripe.com/test/subscriptions
- **Full guide**: See `STRIPE_INTEGRATION_SETUP.md`

---

## ❓ Troubleshooting

**"Payment processing is not configured"**
→ Check all 4 Stripe env vars are set, restart server

**Checkout page doesn't load**
→ Verify `STRIPE_PREMIUM_PRICE_ID` is correct (copy from Stripe product page)

**Payment succeeds but user stays on 'free' tier**
→ Webhooks not set up yet (this is fine for testing)

---

Need help? Check the full guide: `STRIPE_INTEGRATION_SETUP.md`


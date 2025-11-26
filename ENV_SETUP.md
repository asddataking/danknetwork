# Environment Variables Setup

This document lists all required and optional environment variables for the Dank Network app.

## Required Variables

### Supabase (for Munchie Map & Daily Dispo Deals)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### MailerSend (for Daily Dispo Deals welcome emails)
```env
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=deals@danknetwork.com
MAILERSEND_FROM_NAME=Daily Dispo Deals
```

### Google Gemini API (for Daily Dispo Deals deal extraction)
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### Stripe (for Daily Dispo Deals Premium subscriptions)
```env
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com (or http://localhost:3000 for local)
```

### YouTube (for Video Feed)
```env
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_youtube_channel_id
```

### Fourthwall (for Shop/Donations)
```env
FW_STOREFRONT_TOKEN=your_fourthwall_storefront_token
FW_SHOP_URL=https://your-shop.fourthwall.com
FW_COLLECTION_SLUG=all
FW_DONATION_PRODUCT_HANDLE=donation
```

## Optional Variables

### Map Tiles (for Munchie Map)
```env
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
# OR
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
MAPBOX_SECRET_TOKEN=your_mapbox_secret_token
```

**Note:** The public token is used for client-side map rendering. The secret token can be used for server-side geocoding or other advanced features if needed.

If neither MapTiler nor Mapbox is provided, the map will use OpenStreetMap tiles (free but may have rate limits).

## Setup Instructions

1. Copy `.env.local.example` to `.env.local` (if it exists)
2. Add all required variables to `.env.local`
3. **Restart your dev server** after adding/changing environment variables:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

## Testing Your Setup

### Test YouTube Integration
1. Visit `http://localhost:3000`
2. Videos should load from your YouTube channel
3. Check browser console for any errors

### Test Supabase Integration
1. Visit `http://localhost:3000/munchie-map`
2. Map should load and display places from your Supabase database
3. Check browser console for any errors

### Test Fourthwall Integration
1. Visit `http://localhost:3000/shop`
2. Products should load from your Fourthwall store
3. Check browser console for any errors

## Getting Your Credentials

### YouTube Channel ID
1. Go to your YouTube channel
2. View page source (Ctrl+U or Cmd+U)
3. Search for `"channelId"` - the value after it is your channel ID
4. Or visit: https://www.youtube.com/account_advanced (while logged in)

### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the key to YouTube Data API v3 for security

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. Copy the service_role key (keep this secret - only use server-side)

### MailerSend
1. Go to [MailerSend Dashboard](https://www.mailersend.com/)
2. Create an account or log in
3. Go to Settings → API Tokens
4. Create a new API token with email sending permissions
5. Add and verify your sending domain
6. Use your verified domain email as MAILERSEND_FROM_EMAIL

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API key" or "Create API key"
3. Create a new API key for your project
4. Copy the API key → use as GEMINI_API_KEY
5. **For Supabase Edge Functions**: Also add to Supabase secrets:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_key_here
   ```

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. **Get API Keys**:
   - Go to Developers → API keys
   - Copy "Secret key" → use as STRIPE_SECRET_KEY
   - Copy "Publishable key" → use as NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
4. **Create Premium Product & Price**:
   - Go to Products → Add Product
   - Name: "Daily Dispo Deals - Premium"
   - Description: "Daily dispensary deals with premium features"
   - Pricing: Recurring, $4.20 USD, Monthly
   - Click "Save product"
   - Copy the Price ID (starts with `price_...`) → use as STRIPE_PREMIUM_PRICE_ID
5. **Set up Webhooks** (for production):
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy "Signing secret" → use as STRIPE_WEBHOOK_SECRET
6. **For local testing** (optional):
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or download from Stripe
   - Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook signing secret displayed


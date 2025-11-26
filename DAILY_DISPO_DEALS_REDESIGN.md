# Daily Dispo Deals - Landing Page Implementation

## ✅ What Was Built

### 1. **MailerSend Integration** (`lib/mailersend.ts`)
- Full MailerSend API integration for sending transactional emails
- `sendWelcomeEmail()` function that sends beautiful HTML welcome emails
- Customized emails based on tier (Free vs Premium)
- Mentions user's ZIP code and tier benefits
- Graceful error handling with logging

### 2. **Subscriber Management** (`lib/deals/subscriber.ts`)
- `createSubscriber()` - Creates or updates subscribers in Supabase
- Email and ZIP validation
- Automatic ZIP group calculation
- Upsert logic (updates existing subscribers instead of erroring)
- Helper functions: `subscriberExists()`, `updateSubscriberTier()`

### 3. **Subscribe API Route** (`app/api/subscribe/route.ts`)
- Simple POST endpoint: `/api/subscribe`
- Accepts: `{ email, zip, tier }`
- Validates inputs
- Saves to Supabase `newsletter_subscribers` table
- Sends welcome email via MailerSend
- Returns structured JSON response

### 4. **Redesigned /deals Landing Page** (`app/deals/page.tsx`)
Brand new, mobile-first landing page with:

**Hero Section:**
- Split layout: content/form on left, phone preview on right
- Eye-catching "Daily Dispo Deals" title (green + orange)
- 3 key value props with checkmarks
- Inline signup form with email, ZIP, and tier selection
- Success state after subscription
- Error handling with user-friendly messages

**Phone Preview:**
- Desktop-only mockup of a daily deal email
- Shows 3 example deals with realistic data
- Includes value scores, THC %, pricing, and deal labels

**How It Works Section:**
- 3-step process with numbered circles
- Explains ZIP targeting → AI scanning → Daily emails
- Clean, easy to understand

**Free vs Premium Section:**
- Two pricing cards side-by-side
- Premium card highlighted with "MOST POPULAR" badge
- Free: $0, weekly, 3-5 deals
- Premium: $4.20/mo, daily, 10+ deals, extra features
- Click-to-select functionality (scrolls to form)

**Partner Strip:**
- "Featured Partners" section
- Placeholder pill buttons for dispensary logos
- Ready for real partner integration

**Footer:**
- Copyright notice
- Legal disclaimer (21+, not a dispensary, etc.)

### 5. **Color Scheme Updates** (`tailwind.config.ts`)
- Added `neon-orange` (#ff6b00) and `neon-orange-dark` (#ff5500)
- Complements existing neon green colors
- Creates the "Dank Network meets SaaS" aesthetic you wanted

---

## 🔧 Environment Variables You Need to Add

Add these to your `.env.local` file (and Vercel):

```env
# MailerSend (for welcome emails)
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=deals@danknetwork.com
MAILERSEND_FROM_NAME=Daily Dispo Deals

# Stripe (for Premium subscriptions)
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PREMIUM_PRICE_ID=price_your_price_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Service Role Key (if not already set)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Getting Your Stripe Credentials:

**See `STRIPE_INTEGRATION_SETUP.md` for detailed instructions!**

Quick steps:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from **Developers → API keys**
3. Create Premium product: **Products → Add Product**
   - Name: "Daily Dispo Deals - Premium"
   - Price: $4.20 USD, Monthly, Recurring
4. Copy the **Price ID** (starts with `price_...`)
5. Set up webhook endpoint (production only):
   - **Developers → Webhooks**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### Getting Your MailerSend API Key:

1. Go to [MailerSend Dashboard](https://www.mailersend.com/)
2. Sign up or log in
3. Go to **Settings → API Tokens**
4. Click **Create Token**
5. Name it "Daily Dispo Deals API"
6. Enable "Email send" permission
7. Copy the token

### Verify Your Sending Domain:

1. In MailerSend, go to **Domains**
2. Add your domain (e.g., `danknetwork.com`)
3. Follow DNS verification steps
4. Once verified, use `deals@danknetwork.com` as your `MAILERSEND_FROM_EMAIL`

---

## 📊 Database Schema (Already Exists)

Your existing `newsletter_subscribers` table is perfect:

```sql
- email (unique)
- zip
- zip_group
- tier ('free' or 'premium')
- subscribed_at
```

No database changes needed! ✅

---

## 🚀 How to Test

### 1. Start your dev server:
```bash
npm run dev
```

### 2. Visit the new landing page:
```
http://localhost:3000/deals
```

### 3. Test the signup flow:
- Enter an email and Michigan ZIP code
- Select Free or Premium
- Click "Get today's deals 🔥"
- Check your email for the welcome message
- Check Supabase to verify the subscriber was saved

### 4. Test the API directly:
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","zip":"48060","tier":"free"}'
```

---

## 🎨 Design Details

### Colors Used:
- **Neon Green** (`#00ff00`): Primary brand color, CTAs, highlights
- **Neon Orange** (`#ff6b00`): Secondary accent, Premium tier, pricing
- **Black** (`#000000`): Main background
- **Dark Surface** (`#0a0a0a`): Card backgrounds
- **Gray shades**: Text hierarchy

### Typography:
- Font stack: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI'...`)
- Bold, black weights for headings
- Clean, modern aesthetic

### Mobile-First:
- Responsive grid layouts
- Phone preview hidden on mobile
- Form adapts to small screens
- Touch-friendly buttons

---

## 📧 Welcome Email Features

### Email Content:
- **Subject**: "🔥 Welcome to Daily Dispo Deals [Premium]!"
- **Personalized**: Uses first name if provided
- **Tier-specific**: Different content for Free vs Premium
- **Branded**: Dark theme with neon green/orange accents
- **Informative**: Explains what they'll receive
- **Legal**: Includes 21+ disclaimer

### HTML Email Design:
- Mobile-responsive
- Dark theme (matches landing page)
- Branded colors and styling
- Works in all major email clients

---

## 🔄 User Flow

1. **User visits** `/deals`
2. **User fills form**: email, ZIP, tier (Free/Premium)
3. **Submit triggers** `/api/subscribe` POST request
4. **API validates** inputs
5. **API saves** subscriber to Supabase
6. **API sends** welcome email via MailerSend
7. **User sees** success message
8. **User receives** welcome email in inbox

---

## 🎯 What's Next

### Immediate:
1. Add your MailerSend credentials to `.env.local`
2. Test the signup flow
3. Customize email templates if needed (edit `lib/mailersend.ts`)

### Implemented:
- ✅ Stripe integration for Premium tier payments ($4.20/mo)
- ✅ Webhook handling for subscription lifecycle
- ✅ Automatic tier upgrades/downgrades

### Future Enhancements:
- Custom brand filtering form (use existing `PreferenceForm.tsx`)
- Email confirmation/verification flow
- Unsubscribe functionality
- Customer portal for managing subscriptions
- Analytics tracking (Sentry spans for signup events)
- Promo codes/coupons
- Annual pricing option

### MailerSend Template IDs (Optional):
If you want to use MailerSend's template system instead of HTML strings:
1. Create templates in MailerSend dashboard
2. Get template IDs
3. Update `lib/mailersend.ts` to use template IDs:
   ```typescript
   // Add to sendEmail params:
   template_id: "your_template_id_here",
   variables: { name: "John", tier: "Premium" }
   ```

---

## 🛠️ Files Modified/Created

### Created:
- ✅ `lib/mailersend.ts` - MailerSend integration
- ✅ `lib/stripe.ts` - Stripe integration
- ✅ `lib/deals/subscriber.ts` - Subscriber helpers
- ✅ `app/api/subscribe/route.ts` - Subscribe API endpoint (Free)
- ✅ `app/api/stripe/create-checkout/route.ts` - Stripe checkout (Premium)
- ✅ `app/api/stripe/webhook/route.ts` - Stripe webhooks
- ✅ `DAILY_DISPO_DEALS_REDESIGN.md` - This documentation
- ✅ `STRIPE_INTEGRATION_SETUP.md` - Stripe setup guide

### Modified:
- ✅ `app/deals/page.tsx` - Complete redesign with Stripe integration
- ✅ `tailwind.config.ts` - Added orange colors
- ✅ `ENV_SETUP.md` - Added MailerSend & Stripe instructions
- ✅ `package.json` - Added Stripe dependencies

### Unchanged:
- ✅ All other pages/routes (per your request)
- ✅ Existing preferences flow (`/api/subscribe/preferences`)
- ✅ `PreferenceForm.tsx` component (still available for advanced flow)
- ✅ Database schema (no migrations needed)

---

## 📝 Notes

- The existing `/api/subscribe/preferences` route still works for the advanced preference form
- The new `/api/subscribe` route is simpler and focused on quick signups
- Both routes save to the same `newsletter_subscribers` table
- MailerSend is a best-effort operation - signup succeeds even if email fails
- All logging uses `console.log/error` - consider adding Sentry integration later
- ZIP validation is basic (5 digits) - enhance if needed for Michigan-specific validation

---

## 🎉 You're Done!

The Daily Dispo Deals landing page is now live and ready to convert visitors into subscribers!

Just add your MailerSend API key and you're good to go. 🚀


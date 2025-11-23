# Daily Dispo Deals - User Experience & Newsletter Plan

## Executive Summary

**Daily Dispo Deals** is a newsletter service that solves the pain point of manually searching Weedmaps and comparing prices. Users sign up on your site, select their ZIP code, and receive daily emails with the best THC-per-dollar deals in their area.

**Key Value Proposition:**
> "Get the best dispo deals emailed to you daily. No more searching Weedmaps and comparing prices."

---

## 1. User Journey & Flow

### Landing Page → Signup → Newsletter Delivery

```
┌─────────────────────────────────────────────────────────────┐
│  Landing Page (/deals or /daily-dispodeals)                │
│  - Hero: "Get the best dispo deals emailed to you daily"   │
│  - Pain points: "Tired of searching Weedmaps?"              │
│  - Benefits: Save time, find best deals, local ZIP codes    │
│  - Signup form: Email + ZIP code                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Signup Flow                                                 │
│  1. Enter email                                              │
│  2. Select ZIP code (dropdown or search)                     │
│  3. Choose tier: Free (general deals) or Premium ($7/mo)    │
│  4. Submit → Redirect to Substack subscribe page            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Substack Integration                                        │
│  - Free tier: Subscribe to public newsletter                │
│  - Premium tier: Subscribe to paid newsletter ($7/mo)       │
│  - Substack handles payment, email delivery                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Daily Newsletter (Auto-generated)                          │
│  - Cron job fetches deals daily                             │
│  - Generates markdown content per ZIP                       │
│  - Publishes to Substack via API                            │
│  - Substack sends emails to subscribers                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Landing Page Design

### Route: `/deals` or `/daily-dispodeals`

**File: `app/deals/page.tsx`**

### Page Sections

#### 1. Hero Section
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     🍃 Daily Dispo Deals                               │
│                                                         │
│  Get the best dispensary deals emailed to you daily    │
│                                                         │
│  [Enter Email] [Select ZIP] [Get Daily Deals]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Copy:**
- Headline: "Stop Searching. Start Saving."
- Subheadline: "Get the best dispensary deals in your ZIP code delivered to your inbox every morning."
- CTA: "Get Daily Deals" button

#### 2. Pain Points Section
```
┌─────────────────────────────────────────────────────────┐
│  Tired of this?                                         │
│                                                         │
│  ❌ Scrolling through Weedmaps for hours                │
│  ❌ Manually comparing prices across dispensaries       │
│  ❌ Missing the best deals because you didn't check     │
│  ❌ Wasting time when you just want the best value      │
│                                                         │
│  We do the work. You get the deals.                     │
└─────────────────────────────────────────────────────────┘
```

#### 3. How It Works
```
┌─────────────────────────────────────────────────────────┐
│  How It Works                                           │
│                                                         │
│  1. 📧 Sign up with your email and ZIP code             │
│  2. 🤖 We scan dispensaries daily for the best deals   │
│  3. 📊 We rank deals by THC-per-dollar value            │
│  4. 📬 You get a daily email with top deals in your ZIP │
└─────────────────────────────────────────────────────────┘
```

#### 4. Value Proposition
```
┌─────────────────────────────────────────────────────────┐
│  What You Get                                           │
│                                                         │
│  ✅ Daily email with top 5-10 deals in your ZIP         │
│  ✅ Ranked by value (THC per dollar)                   │
│  ✅ Product details: price, THC%, weight, dispensary   │
│  ✅ Deal labels: STEAL / SOLID / MID                    │
│  ✅ Save hours of research time                        │
└─────────────────────────────────────────────────────────┘
```

#### 5. Pricing Tiers
```
┌─────────────────────────────────────────────────────────┐
│  Choose Your Plan                                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   FREE       │  │   PREMIUM    │                    │
│  │              │  │   $7/month   │                    │
│  │ General deals│  │ ZIP-specific │                    │
│  │ Weekly email │  │ Daily email  │                    │
│  │              │  │ Top 10 deals │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

#### 6. Signup Form (Sticky or Inline)
```
┌─────────────────────────────────────────────────────────┐
│  Get Started Today                                      │
│                                                         │
│  Email: [________________]                              │
│  ZIP Code: [Select ZIP ▼]                              │
│  Plan: ○ Free  ● Premium ($7/mo)                       │
│                                                         │
│  [Subscribe to Daily Deals]                            │
│                                                         │
│  By signing up, you agree to receive daily deal emails │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Signup Flow & Substack Integration

### Option A: Direct Substack Embed (Easiest)

**Implementation:**
- Use Substack's embed widget on your landing page
- Substack handles email collection and payment
- Users stay on your site but subscribe through Substack

**Pros:**
- Zero backend code needed
- Substack handles payments automatically
- Built-in email validation

**Cons:**
- Less control over the signup experience
- Harder to customize the form

**Code:**
```tsx
// app/deals/page.tsx
<iframe
  src="https://dailydispodeals.substack.com/embed"
  width="100%"
  height="320"
  frameBorder="0"
  scrolling="no"
/>
```

### Option B: Custom Form → Substack API (Recommended)

**Implementation:**
1. User fills form on your site
2. Your API collects email + ZIP
3. Call Substack API to subscribe user
4. Redirect to Substack confirmation page

**Pros:**
- Full control over UX
- Can collect ZIP code before subscribing
- Better branding consistency
- Can store ZIP in your DB for analytics

**Cons:**
- Requires Substack API integration
- Need to handle payment redirects

**Flow:**
```typescript
// 1. User submits form
POST /api/deals/subscribe
{
  email: "user@example.com",
  zip: "48060",
  tier: "premium" // or "free"
}

// 2. Your API calls Substack
POST https://substack.com/api/v1/free/subscribe
{
  email: "user@example.com",
  publication_id: "your-substack-id"
}

// 3. For premium, redirect to Substack payment
// Substack handles Stripe checkout
```

### Option C: Hybrid Approach (Best UX)

**Implementation:**
1. Collect email + ZIP on your site
2. Store in your DB (for analytics)
3. Redirect to Substack subscribe page with pre-filled email
4. Substack handles payment and email delivery

**Pros:**
- Best of both worlds
- You get user data
- Substack handles payments
- Simple implementation

---

## 4. Substack Newsletter Structure

### Free Tier Newsletter
- **Frequency:** Weekly (or daily if you want)
- **Content:** General deals across all ZIPs
- **Format:** "Top 10 Deals This Week"
- **No ZIP filtering** - broad appeal

### Premium Tier Newsletter ($7/month)
- **Frequency:** Daily
- **Content:** ZIP-specific deals
- **Format:** "Top 5 Deals in 48060 Today"
- **Personalized** by subscriber's ZIP code

### Newsletter Template

**Subject Line Examples:**
- "🔥 Top 5 Deals in 48060 Today"
- "Daily Dispo Deals: Your ZIP Code's Best Values"
- "Stop Searching: Here Are Today's Best Deals"

**Email Body Structure:**
```markdown
# Daily Dispo Deals - 48060
**Monday, January 15, 2024**

---

## 🌿 Flower

### 1. Blue Dream - Green Leaf Dispensary
- **Price:** $40 | **THC:** 25% | **Weight:** 3.5g
- **Value Score:** 21.9 mg/$ (STEAL 🔥)
- Get it: [Link to dispensary]

### 2. Gorilla Glue #4 - Weed World
- **Price:** $45 | **THC:** 28% | **Weight:** 3.5g
- **Value Score:** 19.5 mg/$ (SOLID ✅)
- Get it: [Link to dispensary]

---

## 💨 Carts

### 1. Live Resin Cart - Cloud Nine
- **Price:** $35 | **THC:** 85% | **Weight:** 0.5g
- **Value Score:** 12.1 mg/$ (SOLID ✅)
- Get it: [Link to dispensary]

---

## 🍪 Edibles

### 1. Gummy Bears 100mg - Green Leaf
- **Price:** $20 | **THC:** 100mg total
- **Value Score:** 5.0 mg/$ (MID)
- Get it: [Link to dispensary]

---

**Not seeing your ZIP?** [Upgrade to Premium] for ZIP-specific daily deals.

**Want to unsubscribe?** [Manage preferences]
```

---

## 5. Technical Implementation

### Landing Page Component

**File: `app/deals/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import DealSignupForm from '@/components/deals/DealSignupForm';
import PainPoints from '@/components/deals/PainPoints';
import HowItWorks from '@/components/deals/HowItWorks';
import PricingTiers from '@/components/deals/PricingTiers';

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-neon-green font-black text-5xl mb-4">
          Stop Searching. Start Saving.
        </h1>
        <p className="text-white text-xl mb-8">
          Get the best dispensary deals in your ZIP code delivered to your inbox every morning.
        </p>
        <DealSignupForm />
      </section>

      {/* Pain Points */}
      <PainPoints />

      {/* How It Works */}
      <HowItWorks />

      {/* Pricing */}
      <PricingTiers />

      {/* Social Proof / Testimonials (future) */}
    </div>
  );
}
```

### Signup Form Component

**File: `components/deals/DealSignupForm.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DealSignupForm() {
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [tier, setTier] = useState<'free' | 'premium'>('free');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Option A: Redirect to Substack with pre-filled email
      const substackUrl = tier === 'premium'
        ? `https://dailydispodeals.substack.com/subscribe?email=${encodeURIComponent(email)}&zip=${zip}`
        : `https://dailydispodeals.substack.com/subscribe?email=${encodeURIComponent(email)}`;

      // Option B: Call your API, then redirect
      // const response = await fetch('/api/deals/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, zip, tier }),
      // });
      // const { redirectUrl } = await response.json();

      window.location.href = substackUrl;
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-neon-green/20 text-white"
        />
        <input
          type="text"
          placeholder="ZIP code (e.g., 48060)"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          pattern="[0-9]{5}"
          className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-neon-green/20 text-white"
        />
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tier"
              value="free"
              checked={tier === 'free'}
              onChange={() => setTier('free')}
              className="mr-2"
            />
            <span className="text-white">Free (Weekly)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tier"
              value="premium"
              checked={tier === 'premium'}
              onChange={() => setTier('premium')}
              className="mr-2"
            />
            <span className="text-white">Premium ($7/mo - Daily)</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : 'Get Daily Deals'}
        </button>
        <p className="text-gray-400 text-sm text-center">
          By signing up, you agree to receive daily deal emails. Unsubscribe anytime.
        </p>
      </div>
    </form>
  );
}
```

### API Route (If Using Custom Backend)

**File: `app/api/deals/subscribe/route.ts`**
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, zip, tier } = await request.json();

  // Validate
  if (!email || !zip) {
    return NextResponse.json({ error: 'Email and ZIP required' }, { status: 400 });
  }

  // Store in your DB (optional, for analytics)
  // await db.subscribers.create({ email, zip, tier, subscribedAt: new Date() });

  // Option 1: Redirect to Substack with pre-filled email
  const substackUrl = tier === 'premium'
    ? `https://dailydispodeals.substack.com/subscribe?email=${encodeURIComponent(email)}&zip=${zip}`
    : `https://dailydispodeals.substack.com/subscribe?email=${encodeURIComponent(email)}`;

  return NextResponse.json({ redirectUrl: substackUrl });

  // Option 2: Call Substack API directly (requires API key)
  // const response = await fetch('https://substack.com/api/v1/free/subscribe', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SUBSTACK_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     email,
  //     publication_id: process.env.SUBSTACK_PUBLICATION_ID,
  //   }),
  // });
  // return NextResponse.json(await response.json());
}
```

---

## 6. Substack Setup & Configuration

### Step 1: Create Substack Publication
1. Go to substack.com
2. Create publication: "Daily Dispo Deals"
3. Set custom domain: `deals.thedanknetwork.com` (or `dailydispodeals.thedanknetwork.com`)
4. Configure branding to match Dank Network

### Step 2: Set Up Free & Paid Tiers
- **Free tier:** Public newsletter (weekly general deals)
- **Paid tier:** $7/month (daily ZIP-specific deals)

### Step 3: Get API Access (Optional)
- Substack API allows programmatic publishing
- Use for auto-generating and publishing newsletters
- Requires API key from Substack settings

### Step 4: Newsletter Templates
- Create template in Substack
- Use placeholders for dynamic content (ZIP, deals, etc.)
- Your backend generates content, Substack sends emails

---

## 7. Daily Newsletter Generation & Publishing

### Automated Flow

```
Daily Cron (6 AM)
    ↓
Fetch Deals (from all dispensaries)
    ↓
Group by ZIP Code
    ↓
Generate Markdown for each ZIP
    ↓
Publish to Substack via API
    ↓
Substack sends emails to subscribers
```

### Substack API Integration

**File: `lib/substack/client.ts`**
```typescript
interface SubstackPost {
  title: string;
  subtitle?: string;
  body: string; // Markdown or HTML
  send?: boolean; // Auto-send or save as draft
}

export async function publishToSubstack(post: SubstackPost) {
  const response = await fetch('https://substack.com/api/v1/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUBSTACK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publication_id: process.env.SUBSTACK_PUBLICATION_ID,
      title: post.title,
      subtitle: post.subtitle,
      body: post.body,
      send: post.send || false, // Save as draft first for review
    }),
  });

  return response.json();
}
```

### ZIP-Specific Newsletter Generation

**File: `lib/content/generate-substack-post.ts`**
```typescript
export async function generateSubstackPostForZip(zip: string): Promise<SubstackPost> {
  const deals = await getTopDealsByZip(zip, undefined, 10);
  const date = new Date();

  const title = `🔥 Top Deals in ${zip} - ${formatDate(date)}`;
  const body = generateMarkdownForZip(zip, deals);

  return {
    title,
    subtitle: `Your daily dose of the best dispensary deals in ${zip}`,
    body,
    send: true, // Auto-send (or false to review first)
  };
}
```

### Cron Job Integration

**File: `app/api/cron/publish-newsletters/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { generateSubstackPostForZip } from '@/lib/content/generate-substack-post';
import { publishToSubstack } from '@/lib/substack/client';
import { getActiveZips } from '@/lib/db/queries';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get all ZIPs with active subscribers
  const activeZips = await getActiveZips();

  // Generate and publish newsletter for each ZIP
  for (const zip of activeZips) {
    try {
      const post = await generateSubstackPostForZip(zip);
      await publishToSubstack(post);
      console.log(`Published newsletter for ${zip}`);
    } catch (error) {
      console.error(`Failed to publish for ${zip}:`, error);
    }
  }

  return NextResponse.json({ success: true, zipsProcessed: activeZips.length });
}
```

---

## 8. User Data & Analytics

### Subscriber Tracking (Optional)

**Database Schema:**
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  zip TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'free' | 'premium'
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT, -- 'landing_page', 'referral', etc.
  metadata JSONB -- Store additional data
);

CREATE INDEX idx_subscribers_zip ON newsletter_subscribers(zip);
CREATE INDEX idx_subscribers_tier ON newsletter_subscribers(tier);
```

**Use Cases:**
- Track which ZIPs have the most subscribers
- A/B test signup forms
- Analyze conversion rates (free → premium)
- Email marketing campaigns

---

## 9. Marketing & Growth Strategy

### Landing Page SEO
- **Title:** "Daily Dispo Deals - Best Cannabis Deals in Your ZIP Code"
- **Meta Description:** "Get the best dispensary deals emailed daily. Ranked by THC-per-dollar. Stop searching Weedmaps."
- **Keywords:** "dispensary deals", "cannabis deals", "weed deals", "[ZIP code] dispensary"

### Social Proof
- Add testimonials: "Saved me $50 last week!" - Sarah, 48060
- Show subscriber count: "Join 500+ smart shoppers"
- Display recent deals (anonymized)

### Referral Program (Future)
- "Refer a friend, get 1 month free Premium"
- Track referrals in database
- Reward both referrer and referee

### Content Marketing
- Blog posts: "How to Find the Best Dispensary Deals"
- SEO-optimized articles linking to signup
- Social media promotion

---

## 10. Premium Tier Features

### What Premium Gets You:
1. **Daily emails** (vs weekly for free)
2. **ZIP-specific deals** (vs general deals)
3. **Top 10 deals** (vs top 5)
4. **Deal alerts** (price drops, new deals)
5. **Historical tracking** ("This deal was $5 cheaper last week")
6. **Product type filters** (only flower, only carts, etc.)

### Premium Upsell on Free Newsletter
Add to free newsletter footer:
```
💎 Want ZIP-specific daily deals? [Upgrade to Premium for $7/month]
```

---

## 11. Implementation Phases

### Phase 1: Landing Page (Week 1)
- [ ] Create `/deals` route
- [ ] Build hero section with signup form
- [ ] Add pain points, how it works, pricing sections
- [ ] Style to match Dank Network brand
- [ ] Test on mobile

### Phase 2: Substack Setup (Week 1)
- [ ] Create Substack publication
- [ ] Configure custom domain
- [ ] Set up free and paid tiers
- [ ] Design newsletter template
- [ ] Test email delivery

### Phase 3: Signup Integration (Week 2)
- [ ] Implement signup form
- [ ] Connect to Substack (embed or API)
- [ ] Test free tier signup
- [ ] Test premium tier signup (payment flow)
- [ ] Add success/error handling

### Phase 4: Newsletter Generation (Week 3)
- [ ] Build markdown generator
- [ ] Create Substack API client
- [ ] Test publishing to Substack
- [ ] Generate sample newsletter
- [ ] Review email formatting

### Phase 5: Automation (Week 4)
- [ ] Set up daily cron job
- [ ] Connect fetch → generate → publish flow
- [ ] Test end-to-end automation
- [ ] Add error monitoring
- [ ] Set up alerts

### Phase 6: Polish & Launch (Week 5)
- [ ] Add analytics tracking
- [ ] Optimize landing page SEO
- [ ] Add social proof/testimonials
- [ ] Create marketing materials
- [ ] Soft launch to beta users
- [ ] Gather feedback and iterate

---

## 12. Cost Breakdown

### Monthly Costs

**Substack:**
- Free tier: $0 (they take 10% of paid subscriptions)
- If 100 premium subscribers at $7/mo: $700 revenue, $70 to Substack
- **Net: $630/month revenue** (minus your costs)

**Your Infrastructure:**
- Database (Neon): $0-19/month
- AI (OpenAI): ~$0.45/month
- Vercel: $0-20/month
- **Total: ~$0-40/month**

**Profit Margin:**
- At 100 premium subscribers: ~$590/month profit
- Break-even: ~7 premium subscribers

---

## 13. Key Decisions to Make

### 1. Substack Integration Method
- **Option A:** Embed widget (easiest, less control)
- **Option B:** Custom form → API (more control, more code)
- **Option C:** Hybrid (collect data, redirect to Substack)

**Recommendation:** Start with Option C (hybrid) for MVP, upgrade to Option B later if needed.

### 2. Newsletter Frequency
- **Free:** Weekly or daily?
- **Premium:** Daily (definite)

**Recommendation:** Free = weekly, Premium = daily (clear value differentiation)

### 3. ZIP Code Selection
- **Dropdown:** Pre-populated list of supported ZIPs
- **Search:** Type-ahead search
- **Free text:** User enters any ZIP (you generate if you have data)

**Recommendation:** Start with free text, add validation/autocomplete later.

### 4. Premium Pricing
- **$7/month:** As specified
- **Annual discount?** (e.g., $70/year = 2 months free)

**Recommendation:** Start with monthly only, add annual later.

### 5. Newsletter Content Strategy
- **One newsletter per ZIP?** (100 ZIPs = 100 newsletters/day)
- **One newsletter with ZIP sections?** (easier to manage)

**Recommendation:** Start with one newsletter per ZIP for Premium (personalized), one general newsletter for Free.

---

## 14. Success Metrics

### Key Performance Indicators (KPIs)

1. **Signup Rate:**
   - Target: 5-10% of landing page visitors
   - Track: Google Analytics events

2. **Free → Premium Conversion:**
   - Target: 10-20% of free subscribers upgrade
   - Track: Substack analytics

3. **Email Open Rate:**
   - Target: 30-40% (industry average: 20-25%)
   - Track: Substack analytics

4. **Click-Through Rate:**
   - Target: 5-10% (industry average: 2-3%)
   - Track: Substack analytics

5. **Retention:**
   - Target: 80%+ monthly retention
   - Track: Substack subscriber churn

6. **Revenue:**
   - Target: 100 premium subscribers in first 3 months = $700/mo
   - Track: Substack revenue dashboard

---

## 15. Next Steps

1. **Review this plan** and decide on integration approach
2. **Create Substack publication** and configure
3. **Build landing page** (`/deals` route)
4. **Test signup flow** with Substack
5. **Generate first newsletter** manually
6. **Set up automation** (cron + API)
7. **Launch beta** to 10-20 users
8. **Iterate based on feedback**

---

## Appendix: Example Landing Page Copy

### Hero Section
```
Stop Searching. Start Saving.

Get the best dispensary deals in your ZIP code delivered to your inbox every morning.

No more scrolling through Weedmaps. No more price comparing. We do the work. You get the deals.

[Get Daily Deals →]
```

### Pain Points
```
Tired of this?

❌ Spending hours scrolling through Weedmaps
❌ Manually comparing prices across 10+ dispensaries
❌ Missing the best deals because you didn't check in time
❌ Wasting time when you just want the best value

We solve all of that.
```

### How It Works
```
How It Works

1. 📧 Sign up with your email and ZIP code (30 seconds)
2. 🤖 We scan dispensaries daily for the best deals
3. 📊 We rank deals by THC-per-dollar (real value)
4. 📬 You get a daily email with top deals in your ZIP

That's it. No app to download. No accounts to manage.
```

### Social Proof
```
Join 500+ smart shoppers saving money on cannabis

"Saved me $50 last week!" - Sarah, 48060
"Finally, no more Weedmaps rabbit holes" - Mike, 48101
"Best $7 I spend every month" - Alex, 48060
```

---

**End of User Experience Plan**

This plan focuses on the user-facing experience and newsletter delivery. Combine with the technical architecture plan (`DAILY_DISPO_DEALS_PLAN.md`) for the complete picture.


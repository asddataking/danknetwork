# Daily Dispo Deals - Complete Master Plan

## Executive Summary

**Daily Dispo Deals** is an automated newsletter service that solves the pain point of manually searching Weedmaps and comparing prices. Users subscribe and receive daily emails with the best dispensary deals ranked by THC-per-dollar, filtered by proximity to their ZIP code.

**Value Proposition:**
> "Stop searching Weedmaps. Get the best dispensary deals in your area delivered to your inbox daily."

**Tech Stack:**
- Supabase (Database + Edge Functions)
- Vercel (Hosting + Cron Jobs)
- Substack (Newsletter Platform)
- OpenAI/Claude (AI for PDF/image analysis)

**Pricing:**
- Free: Weekly general deals
- Premium: $7/month - Daily ZIP group-specific deals

---

## 1. Product Overview

### What It Does

1. **Automatically fetches** dispensary menu data daily from Weedmaps
2. **Extracts product information** from menus, PDFs, and images
3. **Calculates value scores** (THC per dollar) for each product
4. **Filters deals by proximity** (only shows deals within 15 miles of user)
5. **Generates personalized newsletters** grouped by ZIP code regions
6. **Sends daily emails** via Substack with top deals

### Target Users

- Cannabis consumers in Michigan
- People tired of manually searching Weedmaps
- Price-conscious shoppers looking for best value
- Regular dispensary customers

### Problem It Solves

- ❌ **Time-consuming:** Hours scrolling through Weedmaps
- ❌ **Hard to compare:** Manually checking prices across 10+ dispensaries
- ❌ **Miss deals:** By the time you check, best deals are gone
- ❌ **No value ranking:** Hard to know which deal is actually best

---

## 2. Complete User Journey

### Step 1: Landing Page (`/deals`)

**User sees:**
- Hero: "Stop Searching. Start Saving."
- Pain points: "Tired of scrolling Weedmaps?"
- Benefits: Save time, find best deals, local deals
- Substack embed widget for signup

**User actions:**
1. Enters email
2. Enters ZIP code (e.g., 48060)
3. Chooses plan: Free (weekly) or Premium ($7/mo daily)
4. Subscribes via Substack

### Step 2: Behind the Scenes (Daily Automation)

**4 AM UTC - Deal Fetching:**
1. Vercel cron triggers Supabase Edge Function
2. Edge Function gets list of active dispensaries
3. For each dispensary:
   - Downloads menu/PDF from Weedmaps
   - Extracts text and images
   - Uses AI vision to analyze images
   - Extracts products (name, THC%, weight, price, type)
   - Calculates value score (THC per dollar)
   - Stores in Supabase database

**6 AM UTC - Newsletter Generation:**
1. Vercel cron triggers Supabase Edge Function
2. Edge Function queries today's deals
3. Groups deals by ZIP code regions
4. Filters by proximity (15 miles from user ZIP)
5. Generates markdown newsletters
6. Publishes to Substack via API

### Step 3: User Receives Email

**Free Tier:**
- Weekly email (e.g., every Monday)
- General deals across all ZIP groups
- Top 5 deals

**Premium Tier:**
- Daily email (every morning)
- ZIP group-specific deals (e.g., "Metro Detroit")
- Top 10 deals
- Filtered by proximity

**Email Content:**
```
🔥 Top Deals in Metro Detroit - January 15, 2024

🌿 Flower

1. Blue Dream - Green Leaf Dispensary
   - Price: $40 | THC: 25% | Weight: 3.5g
   - Value Score: 21.9 mg/$ (STEAL 🔥)
   - Location: 48060

2. Gorilla Glue #4 - Weed World
   - Price: $45 | THC: 28% | Weight: 3.5g
   - Value Score: 19.5 mg/$ (SOLID ✅)
   - Location: 48101

💨 Carts
...
```

---

## 3. Core Features & Functionality

### 3.1 Deal Fetching

**Supported Sources:**
1. **JSON/GraphQL APIs** (if dispensary has API)
2. **HTML Scraping** (Cheerio-based, CSS selectors)
3. **Weedmaps PDFs** (download, extract, analyze)
4. **AI Extraction** (fallback for complex HTML/images)

**Process:**
- Runs daily at 4 AM UTC
- Processes all active dispensaries
- Handles errors gracefully (continues if one fails)
- Stores raw data for debugging
- Prevents duplicates (same product/price/day)

### 3.2 PDF & Image Analysis

**PDF Processing:**
1. Download PDF from Weedmaps
2. Extract text directly from PDF
3. Convert PDF pages to images
4. Run OCR on images (Tesseract or Google Vision)
5. Use AI vision (GPT-4o or Claude) to analyze images
6. Extract product information from all sources
7. Combine and deduplicate results

**Why Both OCR + AI?**
- OCR: Good for text-heavy PDFs (cheaper)
- AI Vision: Better for images, handwritten text, complex layouts
- Combined: Maximum coverage and accuracy

### 3.3 Value Scoring

**Formula:**
```
mgTHC = weightGrams × 1000 × (thcPercent / 100)
valueScore = mgTHC / priceUSD
```

**Example:**
- Product: 3.5g flower, 25% THC, $40
- mgTHC = 3.5 × 1000 × 0.25 = 875mg
- valueScore = 875 / 40 = 21.875 mg/$

**Deal Labels:**
- **STEAL 🔥:** valueScore ≥ 20 (flower), ≥ 10 (carts)
- **SOLID ✅:** valueScore ≥ 15 (flower), ≥ 7 (carts)
- **MID:** Everything else

### 3.4 Location-Based Filtering

**ZIP Code Groups:**
- Metro Detroit → Broken into sub-regions:
  - Detroit City
  - Southfield/Ferndale
  - Troy/Rochester
  - Warren/St. Clair Shores
  - Livonia/Westland
  - Dearborn/Dearborn Heights
- Ann Arbor
- Grand Rapids
- Lansing
- Kalamazoo
- Flint, Saginaw, Muskegon, Traverse City
- Other Michigan areas

**Proximity Filtering:**
- User enters ZIP code on signup
- System calculates distance from user ZIP to dispensary ZIP
- Only shows deals within 15 miles (configurable)
- Uses ZIP code centroids (lat/lng) for distance calculation

### 3.5 Newsletter Generation

**Free Tier:**
- One newsletter per ZIP group
- Weekly frequency
- Top 5 deals per group
- General deals (not personalized)

**Premium Tier:**
- Personalized per subscriber
- Daily frequency
- Top 10 deals
- Filtered by user's ZIP code proximity
- ZIP group-specific content

**Content Structure:**
- Grouped by product type (Flower, Carts, Edibles, etc.)
- Ranked by value score
- Includes: Product name, dispensary, price, THC%, weight, value score, deal label
- Links to dispensary (if available)

### 3.6 Substack Integration

**Setup:**
- Custom domain: `deals.thedanknetwork.com`
- Free tier: Public newsletter
- Premium tier: $7/month paid newsletter

**Publishing:**
- Automated via Substack API
- Publishes daily at 6 AM UTC
- One newsletter per ZIP group (free) or per subscriber (premium)
- Substack handles email delivery automatically

---

## 4. Technical Architecture

### 4.1 Database Schema (Supabase)

**Tables:**

1. **`dispensaries`**
   - id, name, zip, address, city, state
   - menu_url, platform_type (json_api, html_scrape, weedmaps_pdf)
   - extraction_config (JSONB - selectors, API keys, etc.)
   - is_active, last_fetched_at
   - latitude, longitude (for distance calculation)

2. **`deals`**
   - id, dispensary_id, product_name, product_type
   - thc_percent, weight_grams, price_usd, zip
   - mg_thc (calculated), value_score (calculated)
   - deal_label (STEAL/SOLID/MID)
   - raw_data (JSONB - original scraped data)
   - fetched_at, created_at

3. **`zip_codes`**
   - zip (primary key)
   - latitude, longitude (centroid)
   - city, state, county

4. **`newsletter_subscribers`**
   - id, email, zip
   - zip_latitude, zip_longitude (cached)
   - zip_group, tier (free/premium)
   - max_distance_miles (default: 15)
   - subscribed_at, unsubscribed_at

### 4.2 Supabase Edge Functions

**Function 1: `fetch-deals`**
- Triggered by Vercel cron (4 AM UTC)
- Gets active dispensaries
- For each dispensary:
  - Fetches menu/PDF based on platform_type
  - Extracts products
  - Calculates value scores
  - Stores in deals table
- Returns summary of results

**Function 2: `generate-newsletters`**
- Triggered by Vercel cron (6 AM UTC)
- Queries today's deals
- Groups by ZIP groups
- Filters by proximity (for premium subscribers)
- Generates markdown
- Publishes to Substack API
- Returns summary of published newsletters

### 4.3 Vercel API Routes

**Route 1: `/api/cron/fetch-deals`**
- Verifies cron secret
- Calls Supabase Edge Function: `fetch-deals`
- Returns success/error

**Route 2: `/api/cron/generate-newsletters`**
- Verifies cron secret
- Calls Supabase Edge Function: `generate-newsletters`
- Returns success/error

**Route 3: `/api/deals/subscribe`** (Optional)
- Captures user email + ZIP before Substack signup
- Stores in newsletter_subscribers table
- Returns success

### 4.4 Landing Page

**Route: `/deals`**

**Sections:**
1. Hero with Substack embed widget
2. Pain points (Weedmaps frustration)
3. How it works (4 steps)
4. Pricing tiers (Free vs Premium)
5. Social proof (testimonials)

**Substack Embed:**
- Embedded widget on page
- User enters email, chooses tier
- Substack handles payment and subscription
- User stays on your site

---

## 5. Data Flow

### Daily Automation Flow

```
┌─────────────────────────────────────────────────────────┐
│ 4 AM UTC: Vercel Cron                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Vercel API: /api/cron/fetch-deals                       │
│ - Verifies cron secret                                  │
│ - Calls Supabase Edge Function                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase Edge Function: fetch-deals                      │
│                                                          │
│ 1. Get active dispensaries from Supabase                │
│ 2. For each dispensary:                                 │
│    ├─→ Download menu/PDF                                │
│    ├─→ Extract text/images                              │
│    ├─→ Run OCR (if PDF/images)                          │
│    ├─→ Run AI Vision (if images)                        │
│    ├─→ Extract products                                 │
│    ├─→ Calculate value scores                           │
│    └─→ Store in deals table                             │
│ 3. Return results summary                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase Database: deals table                          │
│ - All deals stored with value scores                    │
│ - Ready for newsletter generation                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 6 AM UTC: Vercel Cron                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Vercel API: /api/cron/generate-newsletters              │
│ - Verifies cron secret                                  │
│ - Calls Supabase Edge Function                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase Edge Function: generate-newsletters             │
│                                                          │
│ 1. Query today's deals from Supabase                    │
│ 2. Group by ZIP groups                                  │
│ 3. For each ZIP group:                                  │
│    ├─→ Filter deals by proximity (premium)              │
│    ├─→ Sort by value score                              │
│    ├─→ Generate markdown                                │
│    └─→ Publish to Substack API                          │
│ 4. Return results summary                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Substack API: Publish Newsletter                        │
│ - Creates post with markdown content                    │
│ - Sends emails to subscribers automatically             │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Pricing & Profitability

### Pricing Tiers

**Free:**
- Weekly newsletter
- General deals (all ZIP groups)
- Top 5 deals
- **Price: $0/month**

**Premium:**
- Daily newsletter
- ZIP group-specific deals
- Top 10 deals
- Proximity filtering (15 miles)
- **Price: $7/month**

### Cost Breakdown

**Monthly Fixed Costs:**
- Supabase: $0-25/month (free tier for MVP)
- Vercel: $0-20/month (free tier for MVP)
- OpenAI/Claude: $30/month (for PDF/image analysis)
- Substack: 10% of revenue (e.g., $70/month if $700 revenue)

**Total: $30-75/month** (excluding Substack fee)

### Profitability

**Break-Even:**
- At $7/month: Need 5-12 premium subscribers
- After Substack 10% fee: $6.30 net per subscriber

**At Scale:**
- 50 subscribers: $240-285/month profit (68-76% margin)
- 100 subscribers: $555-600/month profit (79-85% margin)
- 200 subscribers: $1,185-1,230/month profit (84-88% margin)

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Database Setup:**
- [ ] Create Supabase tables (dispensaries, deals, zip_codes, newsletter_subscribers)
- [ ] Set up ZIP code database (populate with Michigan ZIPs)
- [ ] Create ZIP groups configuration
- [ ] Test database queries

**Basic Fetching:**
- [ ] Set up Supabase Edge Function: fetch-deals
- [ ] Implement JSON API fetcher
- [ ] Implement HTML scraper (Cheerio)
- [ ] Test with 2-3 dispensaries

### Phase 2: PDF & Image Processing (Week 3-4)

**PDF Support:**
- [ ] Add PDF detection to Weedmaps scraper
- [ ] Implement PDF download
- [ ] Extract text from PDFs
- [ ] Extract images from PDFs

**AI Integration:**
- [ ] Set up OpenAI/Claude API
- [ ] Implement OCR (Tesseract or Google Vision)
- [ ] Implement AI vision analysis
- [ ] Test with sample PDFs

### Phase 3: Value Scoring & Filtering (Week 5)

**Scoring:**
- [ ] Implement value score calculation
- [ ] Add deal labeling (STEAL/SOLID/MID)
- [ ] Test scoring logic

**Location:**
- [ ] Implement distance calculation
- [ ] Add proximity filtering
- [ ] Test with different ZIP codes

### Phase 4: Newsletter Generation (Week 6)

**Content Generation:**
- [ ] Set up Supabase Edge Function: generate-newsletters
- [ ] Implement markdown generation
- [ ] Group deals by ZIP groups
- [ ] Filter by proximity

**Substack Integration:**
- [ ] Set up Substack publication
- [ ] Get API keys
- [ ] Implement publishing via API
- [ ] Test newsletter delivery

### Phase 5: Landing Page & Signup (Week 7)

**Landing Page:**
- [ ] Create `/deals` route
- [ ] Build hero section
- [ ] Add pain points, how it works, pricing
- [ ] Integrate Substack embed widget

**Signup Flow:**
- [ ] Capture user ZIP code (optional API route)
- [ ] Store in newsletter_subscribers table
- [ ] Test signup flow

### Phase 6: Automation (Week 8)

**Cron Jobs:**
- [ ] Set up Vercel cron jobs
- [ ] Create API routes for cron triggers
- [ ] Test cron execution
- [ ] Add error monitoring

**Testing:**
- [ ] Test end-to-end flow
- [ ] Monitor logs
- [ ] Fix any issues

### Phase 7: Launch (Week 9-10)

**Beta Launch:**
- [ ] Launch to 10-20 beta users
- [ ] Gather feedback
- [ ] Iterate on content format
- [ ] Optimize extraction accuracy

**Public Launch:**
- [ ] Marketing push
- [ ] Social media promotion
- [ ] SEO optimization
- [ ] Monitor growth

---

## 8. Key Features Breakdown

### 8.1 Deal Fetching Features

- ✅ **Multi-source support:** JSON APIs, HTML scraping, PDFs
- ✅ **Error handling:** Retries, graceful failures
- ✅ **Deduplication:** Prevents duplicate deals
- ✅ **Raw data storage:** Stores original data for debugging
- ✅ **Last fetched tracking:** Knows when each dispensary was last checked

### 8.2 PDF Processing Features

- ✅ **Automatic detection:** Finds PDFs on Weedmaps
- ✅ **Text extraction:** Extracts text directly from PDFs
- ✅ **Image extraction:** Converts PDF pages to images
- ✅ **OCR support:** Multiple OCR providers (Tesseract, Google Vision)
- ✅ **AI vision:** Analyzes images with GPT-4o/Claude
- ✅ **Combined results:** Merges text + OCR + AI results

### 8.3 Value Scoring Features

- ✅ **Automatic calculation:** Calculates mgTHC and value score
- ✅ **Deal labeling:** STEAL/SOLID/MID based on thresholds
- ✅ **Product type aware:** Different thresholds for flower, carts, edibles
- ✅ **Ranking:** Sorts deals by value score

### 8.4 Location Features

- ✅ **ZIP code groups:** Organized by regions
- ✅ **Proximity filtering:** Only shows deals within X miles
- ✅ **Distance calculation:** Uses ZIP centroids for accuracy
- ✅ **User location storage:** Remembers user's ZIP code

### 8.5 Newsletter Features

- ✅ **Personalized content:** ZIP group-specific for premium
- ✅ **Product grouping:** Organized by type (Flower, Carts, etc.)
- ✅ **Value ranking:** Top deals first
- ✅ **Deal labels:** Visual indicators (STEAL/SOLID/MID)
- ✅ **Automated publishing:** Daily via Substack API

---

## 9. Technical Details

### 9.1 Value Score Calculation

**Formula:**
```typescript
mgTHC = weightGrams * 1000 * (thcPercent / 100)
valueScore = mgTHC / priceUSD
```

**Database (Generated Column):**
```sql
mg_thc DECIMAL(10,2) GENERATED ALWAYS AS (
  weight_grams * 1000 * (thc_percent / 100)
) STORED,

value_score DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE 
    WHEN price_usd > 0 THEN (weight_grams * 1000 * (thc_percent / 100)) / price_usd
    ELSE 0
  END
) STORED
```

### 9.2 Distance Calculation

**Haversine Formula:**
```typescript
function calculateDistance(lat1, lon1, lat2, lon2): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

**Or PostGIS (Better Performance):**
```sql
SELECT ST_Distance(
  ST_MakePoint(user_lng, user_lat)::geography,
  disp.location
) / 1609.34 AS distance_miles
```

### 9.3 Newsletter Markdown Template

```markdown
# Daily Dispo Deals - {ZIP_GROUP_NAME}

**{DATE}**

Here are today's best dispensary deals in {ZIP_GROUP_NAME}, ranked by THC-per-dollar value.

---

## 🌿 Flower

### 1. {PRODUCT_NAME} - {DISPENSARY_NAME}
- **Price:** ${PRICE} | **THC:** {THC}% | **Weight:** {WEIGHT}g
- **Value Score:** {VALUE_SCORE} mg/$ ({DEAL_LABEL})
- **Location:** {ZIP}

---

**Not seeing your area?** [Upgrade to Premium] for ZIP group-specific daily deals.
```

---

## 10. Environment Variables

### Vercel Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key
SUBSTACK_API_KEY=your_substack_key
SUBSTACK_PUBLICATION_ID=your_publication_id
```

### Supabase Edge Function Secrets

```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set ANTHROPIC_API_KEY=your_key
supabase secrets set SUBSTACK_API_KEY=your_key
supabase secrets set SUBSTACK_PUBLICATION_ID=your_id
```

---

## 11. Success Metrics

### Key Performance Indicators (KPIs)

1. **Signup Rate:** 5-10% of landing page visitors
2. **Free → Premium Conversion:** 10-20% of free subscribers
3. **Email Open Rate:** 30-40% (industry avg: 20-25%)
4. **Click-Through Rate:** 5-10% (industry avg: 2-3%)
5. **Retention:** 80%+ monthly retention
6. **Revenue:** 100 premium subscribers in first 3 months = $700/mo

### Growth Targets

- **Month 1-2:** 10-20 premium subscribers (break-even)
- **Month 3-4:** 50 premium subscribers ($350/mo revenue, $240-285 profit)
- **Month 5-6:** 100 premium subscribers ($700/mo revenue, $555-600 profit)
- **Month 7-12:** 200+ premium subscribers ($1,400+/mo revenue, $1,000+ profit)

---

## 12. Future Enhancements

### Phase 2 Features (After Launch)

1. **Price Drop Alerts:** Notify users when deals get better
2. **Historical Tracking:** "This deal was $5 cheaper last week"
3. **Product Type Filters:** "Only show me flower deals"
4. **Deal Expiration:** Track when deals expire
5. **User Preferences:** Customizable distance, product types, price ranges

### Phase 3 Features (Scale)

1. **Mobile App:** React Native app for push notifications
2. **Deal Comparison:** Side-by-side comparison tool
3. **User Reviews:** Community reviews of deals
4. **Referral Program:** "Refer a friend, get 1 month free"
5. **Multiple States:** Expand beyond Michigan

---

## 13. Risk Mitigation

### Technical Risks

1. **Weedmaps Changes:** HTML structure changes break scraping
   - **Mitigation:** Use AI extraction as fallback, monitor failures

2. **PDF Format Changes:** Different PDF layouts
   - **Mitigation:** AI vision handles various layouts, OCR fallback

3. **API Rate Limits:** OpenAI/Claude rate limits
   - **Mitigation:** Implement retry logic, use caching, consider multiple providers

### Business Risks

1. **Low Subscriber Growth:** Not enough signups
   - **Mitigation:** Strong marketing, SEO, social proof, referral program

2. **High Churn:** Users unsubscribe quickly
   - **Mitigation:** High-quality deals, accurate data, good email design

3. **Competition:** Other similar services
   - **Mitigation:** Focus on value (THC-per-dollar), local focus, better UX

---

## 14. Summary

### What It Is

An automated newsletter service that:
- Fetches dispensary deals daily
- Ranks by THC-per-dollar value
- Filters by user location
- Sends personalized daily emails

### How It Works

1. **Daily automation** (4 AM): Fetch deals from all dispensaries
2. **Processing:** Extract products, calculate value scores
3. **Newsletter generation** (6 AM): Create personalized newsletters
4. **Email delivery:** Substack sends emails automatically

### Tech Stack

- **Supabase:** Database + Edge Functions
- **Vercel:** Hosting + Cron Jobs
- **Substack:** Newsletter platform
- **OpenAI/Claude:** AI for PDF/image analysis

### Pricing

- **Free:** Weekly general deals
- **Premium:** $7/month - Daily personalized deals

### Profitability

- **Break-even:** 5-12 premium subscribers
- **Profitable at:** 20+ subscribers
- **Strong margins:** 68-88% at scale

### Timeline

- **Weeks 1-8:** Development & setup
- **Week 9-10:** Beta launch
- **Month 3+:** Public launch & growth

---

**End of Master Plan**

This is your complete blueprint for building Daily Dispo Deals. Everything is planned, costed, and ready to implement!


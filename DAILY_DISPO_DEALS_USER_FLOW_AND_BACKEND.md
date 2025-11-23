# Daily Dispo Deals - User Flow & Backend Architecture

## 📱 User Flows

---

## FREE TIER USER FLOW

### Step 1: Discovery & Signup
1. **User visits** `/deals` page on your site
2. **Sees landing page** with:
   - Hero: "Stop Searching. Start Saving."
   - Pain points (scrolling Weedmaps, comparing prices, missing deals)
   - How it works (4-step process)
   - Pricing comparison (Free vs Premium)
3. **Clicks Substack embed widget** (iframe on the page)
4. **Enters email** in Substack's embedded form
5. **Substack handles**:
   - Email verification
   - Subscription confirmation
   - Subscriber management
   - Payment (if upgrading to Premium)

### Step 2: Weekly Newsletter (Mondays Only)
1. **Every Monday at 6:00 AM UTC** (2:00 AM EST):
   - Backend generates "Deals of the Week" newsletter
   - Includes top 15 deals across ALL Michigan ZIP codes
   - Grouped by product type (flower, cart, edible, etc.)
   - Shows top 5 deals per product type
2. **Substack publishes** the newsletter
3. **Substack emails** all free subscribers
4. **User receives email** with:
   - Subject: "Deals of the Week - [Date]"
   - Content: Top deals ranked by THC-per-dollar value
   - Each deal shows: Product name, dispensary, price, THC%, weight, value score, location
   - Call-to-action to upgrade to Premium

### Step 3: User Experience
- **Frequency:** Once per week (Mondays)
- **Content:** Best deals across all of Michigan
- **Value:** General overview, not location-specific
- **Upgrade prompt:** Included in every email

---

## PREMIUM TIER USER FLOW

### Step 1: Discovery & Signup
1. **User visits** `/deals` page
2. **Sees Premium benefits**:
   - Daily ZIP group-specific deals
   - Top 10 deals daily
   - Proximity filtering (15 miles)
   - Deal alerts & price drops
3. **Clicks Substack embed widget**
4. **Subscribes to Premium** ($7/month) via Substack
5. **Substack handles**:
   - Payment processing
   - Subscription management
   - Premium tier assignment

### Step 2: Daily Newsletter (Every Day)
1. **Every day at 6:00 AM UTC** (2:00 AM EST):
   - Backend generates newsletters for each ZIP group
   - Each ZIP group gets its own newsletter
   - Includes top 10 deals for that specific area
   - Deals filtered by proximity (15 miles from ZIP centroid)
2. **Substack publishes** multiple newsletters (one per ZIP group)
3. **Substack emails** premium subscribers based on their ZIP group
4. **User receives email** with:
   - Subject: "🔥 Top Deals in [ZIP Group Name] - [Date]"
   - Content: Top 10 deals in their specific area
   - Grouped by product type
   - Each deal shows: Product name, dispensary, price, THC%, weight, value score, location
   - More personalized and location-specific

### Step 3: User Experience
- **Frequency:** Daily (every morning)
- **Content:** ZIP group-specific deals (e.g., "Detroit City", "Ann Arbor")
- **Value:** Highly personalized, location-based
- **Coverage:** 13 ZIP groups across Michigan

---

## 🔧 BACKEND ARCHITECTURE

### Overview
The backend runs on **Supabase Edge Functions** (Deno-based serverless functions) triggered by **Vercel Cron Jobs**. The system is fully automated and runs daily without manual intervention.

---

## 📅 DAILY CRON JOB FLOW

### Schedule (UTC Time)
- **4:00 AM UTC** (12:00 AM EST): Fetch deals from dispensaries
- **6:00 AM UTC** (2:00 AM EST): Generate and publish newsletters

### Step-by-Step Process

---

## 1. FETCH DEALS CRON JOB (4:00 AM UTC)

### Trigger
- **Vercel Cron** calls `/api/cron/fetch-deals` at 4:00 AM UTC daily
- **Route:** `app/api/cron/fetch-deals/route.ts`
- **Security:** Verifies `CRON_SECRET` in Authorization header

### Process Flow

#### Step 1: Vercel API Route
```
Vercel Cron → /api/cron/fetch-deals
  ↓
Verifies CRON_SECRET
  ↓
Calls Supabase Edge Function: fetch-deals
```

#### Step 2: Supabase Edge Function (`fetch-deals`)
**Location:** `supabase/functions/fetch-deals/index.ts`

**What it does:**
1. **Connects to Supabase** using service role key
2. **Queries active dispensaries**:
   ```sql
   SELECT * FROM dispensaries WHERE is_active = true
   ```
3. **Loops through each dispensary**:
   - Gets dispensary config (menu URL, platform type, extraction config)
   - Determines fetching method based on `platform_type`:
     - `json_api`: Direct JSON/GraphQL API call
     - `html_scrape`: HTML scraping with Cheerio
     - `weedmaps_pdf`: PDF download and processing
     - `html_ai`: HTML → AI extraction (OpenAI)
4. **Fetches deals** using appropriate method:
   - **JSON API:** Direct API call, parse response
   - **HTML Scrape:** Parse HTML with selectors
   - **Weedmaps PDF:** Download PDF, extract images, use OpenAI Vision
   - **HTML AI:** Fetch HTML, extract text, use OpenAI Text API
5. **Processes each deal**:
   - Calculates `valueScore` = (mgTHC) / priceUSD
   - Calculates `mgTHC` = weightGrams × 1000 × (thcPercent / 100)
   - Assigns `deal_label` (STEAL/SOLID/MID) based on thresholds
6. **Stores deals in database**:
   - Upserts to `deals` table
   - Prevents duplicates using unique constraint
   - Updates `last_fetched_at` on dispensary
   - Logs success/error to `fetch_logs` table

#### Step 3: Data Storage
**Tables updated:**
- `deals`: New deals inserted/updated
- `dispensaries`: `last_fetched_at` updated
- `fetch_logs`: Success/error logs created

**Example deal record:**
```json
{
  "dispensary_id": "uuid",
  "product_name": "Blue Dream",
  "product_type": "flower",
  "thc_percent": 25.5,
  "weight_grams": 3.5,
  "price_usd": 35.00,
  "zip": "48060",
  "mg_thc": 892.5,  // Auto-calculated
  "value_score": 25.5,  // Auto-calculated
  "deal_label": "STEAL",
  "fetched_at": "2024-01-15T04:00:00Z"
}
```

---

## 2. GENERATE NEWSLETTERS CRON JOB (6:00 AM UTC)

### Trigger
- **Vercel Cron** calls `/api/cron/generate-newsletters` at 6:00 AM UTC daily
- **Route:** `app/api/cron/generate-newsletters/route.ts`
- **Security:** Verifies `CRON_SECRET` in Authorization header

### Process Flow

#### Step 1: Vercel API Route
```
Vercel Cron → /api/cron/generate-newsletters
  ↓
Verifies CRON_SECRET
  ↓
Calls Supabase Edge Function: generate-newsletters
```

#### Step 2: Supabase Edge Function (`generate-newsletters`)
**Location:** `supabase/functions/generate-newsletters/index.ts`

**What it does:**

1. **Connects to Supabase** using service role key

2. **Gets today's deals**:
   ```sql
   SELECT *, dispensaries(name, zip)
   FROM deals
   WHERE fetched_at >= TODAY
   ORDER BY value_score DESC
   ```

3. **Checks if it's Monday** (for free tier):
   - If Monday → Generate weekly summary
   - Always → Generate daily ZIP group newsletters

4. **Generates Weekly Summary (Free Tier - Mondays Only)**:
   - Takes top 15 deals across all ZIP codes
   - Groups by product type
   - Shows top 5 deals per type
   - Creates markdown content
   - Publishes to Substack via API
   - Substack emails all free subscribers

5. **Generates Daily ZIP Group Newsletters (Premium Tier - Every Day)**:
   - Loads ZIP groups from config (13 groups: Detroit, Ann Arbor, etc.)
   - Groups deals by ZIP code → ZIP group mapping
   - For each ZIP group:
     - Filters deals for that group's ZIP codes
     - Takes top 10 deals
     - Groups by product type
     - Creates markdown content
     - Publishes to Substack via API
     - Substack emails premium subscribers in that ZIP group

6. **Publishes to Substack**:
   - Calls Substack API: `POST https://substack.com/api/v1/posts`
   - Sends markdown content
   - Sets `send: true` to auto-send emails
   - Substack handles:
     - Email delivery
     - Subscriber segmentation (free vs premium)
     - ZIP group filtering (if configured in Substack)

#### Step 3: Newsletter Content Format

**Weekly Summary (Free):**
```markdown
# Deals of the Week

**Week of Monday, January 15, 2024**

Here are the best dispensary deals across Michigan this week...

## 🌿 Flower

### 1. Blue Dream - Green Leaf Dispensary
- **Price:** $35 | **THC:** 25.5% | **Weight:** 3.5g
- **Value Score:** 25.5 mg/$ (STEAL 🔥)
- **Location:** 48060
```

**Daily ZIP Group (Premium):**
```markdown
# Daily Dispo Deals - Detroit City

**Monday, January 15, 2024**

Here are today's best dispensary deals in Detroit City...

## 🌿 Flower

### 1. Blue Dream - Green Leaf Dispensary
- **Price:** $35 | **THC:** 25.5% | **Weight:** 3.5g
- **Value Score:** 25.5 mg/$ (STEAL 🔥)
- **Location:** 48201
```

---

## 🗄️ DATABASE SCHEMA

### Key Tables

#### `dispensaries`
Stores dispensary information:
- `id`, `name`, `zip`, `address`, `city`, `state`
- `menu_url`: URL to fetch deals from
- `platform_type`: `json_api`, `html_scrape`, `weedmaps_pdf`, `html_ai`
- `extraction_config`: JSON config for fetching (API keys, selectors, etc.)
- `is_active`: Whether to fetch from this dispensary
- `last_fetched_at`: Last successful fetch timestamp
- `latitude`, `longitude`: For proximity calculations

#### `deals`
Stores individual product deals:
- `id`, `dispensary_id`, `product_name`, `product_type`
- `thc_percent`, `weight_grams`, `price_usd`
- `zip`: Dispensary's ZIP code
- `mg_thc`: Auto-calculated (weight × 1000 × THC%)
- `value_score`: Auto-calculated (mgTHC / price)
- `deal_label`: STEAL, SOLID, or MID
- `raw_data`: Original scraped data (for debugging)
- `fetched_at`: When this deal was fetched
- **Unique constraint:** Prevents duplicate deals per day

#### `zip_codes`
Stores ZIP code centroids for distance calculations:
- `zip`, `latitude`, `longitude`, `city`, `state`, `county`

#### `fetch_logs`
Tracks fetch operations:
- `dispensary_id`, `status` (success/error/partial)
- `deals_found`, `error_message`, `execution_time_ms`
- `timestamp`

---

## 🔄 COMPLETE DAILY CYCLE

### Timeline (EST)

**12:00 AM (4:00 AM UTC) - Fetch Deals**
1. Vercel Cron triggers `/api/cron/fetch-deals`
2. Calls `fetch-deals` Edge Function
3. Fetches from all active dispensaries
4. Processes and stores deals in database
5. Logs results

**2:00 AM (6:00 AM UTC) - Generate Newsletters**
1. Vercel Cron triggers `/api/cron/generate-newsletters`
2. Calls `generate-newsletters` Edge Function
3. Queries today's deals from database
4. Generates markdown content:
   - Weekly summary (if Monday) for free tier
   - Daily ZIP group newsletters for premium tier
5. Publishes to Substack via API
6. Substack sends emails to subscribers

**Morning - Users Receive Emails**
- Free tier: Weekly email (Mondays only)
- Premium tier: Daily email (every day)

---

## 🎯 KEY FEATURES

### Value Scoring
- **Formula:** `valueScore = mgTHC / priceUSD`
- **mgTHC Calculation:** `weightGrams × 1000 × (thcPercent / 100)`
- **Deal Labels:**
  - **STEAL:** High value score (e.g., ≥20 for flower)
  - **SOLID:** Good value (e.g., ≥15 for flower)
  - **MID:** Average value (below thresholds)

### ZIP Group Segmentation
- 13 predefined ZIP groups across Michigan
- Each group contains multiple ZIP codes
- Premium users get deals specific to their ZIP group
- Proximity filtering (15 miles) for future enhancement

### Platform Type Support
- **JSON API:** Direct API calls (fastest, most reliable)
- **HTML Scrape:** Cheerio-based parsing (for static HTML)
- **Weedmaps PDF:** PDF download → image extraction → OpenAI Vision
- **HTML AI:** HTML → text extraction → OpenAI Text API

---

## 🔐 SECURITY & CONFIGURATION

### Environment Variables

**Vercel:**
- `CRON_SECRET`: Secret for cron job authentication
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Edge Functions
- `OPENAI_API_KEY`: For AI extraction
- `SUBSTACK_API_KEY`: For publishing newsletters
- `SUBSTACK_PUBLICATION_ID`: Substack publication ID

**Supabase Edge Functions:**
- `SUPABASE_URL`: Auto-injected by Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Set as secret
- `OPENAI_API_KEY`: Set as secret
- `SUBSTACK_API_KEY`: Set as secret
- `SUBSTACK_PUBLICATION_ID`: Set as secret

---

## 📊 MONITORING & LOGGING

### Fetch Logs
- Every fetch operation logged to `fetch_logs` table
- Tracks: success/error, deals found, execution time
- Can query to see which dispensaries are failing

### Error Handling
- Failed dispensary fetches don't stop the entire process
- Errors logged to `fetch_logs` table
- Newsletter generation continues even if some deals fail

---

## 🚀 SCALING CONSIDERATIONS

### Current Setup
- Handles multiple dispensaries sequentially
- Processes all ZIP groups for newsletters
- Can handle 50+ dispensaries

### Future Enhancements
- Parallel processing for dispensary fetches
- Caching for frequently accessed data
- Rate limiting for API calls
- Retry logic for failed fetches
- Queue system for high-volume operations

---

## 📝 SUMMARY

**Free Tier:**
- Weekly newsletter (Mondays)
- Top 15 deals across all Michigan
- General overview, not location-specific

**Premium Tier:**
- Daily newsletter (every day)
- Top 10 deals per ZIP group
- Location-specific, highly personalized

**Backend:**
- Fully automated via Vercel Cron
- Supabase Edge Functions for processing
- Substack for email delivery
- No manual intervention required

**Daily Cycle:**
1. 12:00 AM EST: Fetch deals from dispensaries
2. 2:00 AM EST: Generate and publish newsletters
3. Morning: Users receive emails

The entire system runs automatically, fetching deals daily and delivering personalized newsletters to subscribers based on their tier and location.


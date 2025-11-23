# Daily Dispo Deals - Final Implementation Plan

## Executive Summary

**Daily Dispo Deals** is a newsletter service that solves the pain point of manually searching Weedmaps and comparing prices. Users sign up via Substack embed widget on your landing page and receive daily emails with the best THC-per-dollar deals, segmented by ZIP groups (e.g., "Metro Detroit", "Ann Arbor").

**Key Decisions:**
- ✅ **Substack Embed Widget** - Simplest integration, Substack handles everything
- ✅ **ZIP Group Segmentation** - Group ZIPs into regions (e.g., "Metro Detroit", "Ann Arbor")
- ✅ **One newsletter per group** - Easier to manage, still personalized
- ✅ **Supabase Database** - Using existing Supabase setup for deals storage
- ✅ **Vercel Cron** - Daily cron job (once every 24 hours) to fetch and process deals

**Key Value Proposition:**
> "Get the best dispo deals emailed to you daily. No more searching Weedmaps and comparing prices."

---

## 1. Updated User Journey

### Landing Page → Substack Signup → Newsletter Delivery

```
┌─────────────────────────────────────────────────────────────┐
│  Landing Page (/deals)                                      │
│  - Hero: "Stop Searching. Start Saving."                     │
│  - Pain points: "Tired of searching Weedmaps?"               │
│  - Benefits: Save time, find best deals                       │
│  - Substack embed widget (email signup)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Substack Embed Widget                                       │
│  - User enters email                                         │
│  - Chooses Free (weekly) or Premium ($7/mo daily)           │
│  - Substack handles payment & subscription                   │
│  - User stays on your site (embedded widget)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Daily Newsletter (Auto-generated)                          │
│  - Cron job fetches deals daily                             │
│  - Groups deals by ZIP groups (Metro Detroit, Ann Arbor...) │
│  - Generates one newsletter per group                       │
│  - Publishes to Substack via API                            │
│  - Substack sends emails to subscribers                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ZIP Group Segmentation Strategy

### Why ZIP Groups?

**Problem with Individual ZIPs:**
- 100 ZIPs = 100 newsletters/day (unmanageable)
- Low subscriber density per ZIP
- Hard to maintain quality content per ZIP

**Solution: ZIP Groups**
- Group related ZIPs into regions
- 5-10 groups = 5-10 newsletters/day (manageable)
- Higher subscriber density per group
- Still feels local/personalized

### Example ZIP Groups (Michigan)

**File: `data/zip-groups.json`**
```json
{
  "metro_detroit": {
    "name": "Metro Detroit",
    "zips": ["48060", "48061", "48062", "48063", "48064", "48065", "48066", "48067", "48068", "48069", "48070", "48071", "48072", "48073", "48074", "48075", "48076", "48079", "48080", "48081", "48082", "48083", "48084", "48085", "48086", "48088", "48089", "48090", "48091", "48092", "48093", "48094", "48095", "48096", "48097", "48098", "48099", "48101", "48102", "48103", "48104", "48105", "48106", "48107", "48108", "48109", "48110", "48111", "48112", "48113", "48114", "48115", "48116", "48117", "48118", "48120", "48121", "48122", "48123", "48124", "48125", "48126", "48127", "48128", "48130", "48131", "48133", "48134", "48135", "48136", "48137", "48138", "48139", "48140", "48141", "48143", "48144", "48145", "48146", "48150", "48151", "48152", "48153", "48154", "48164", "48165", "48166", "48167", "48168", "48169", "48170", "48173", "48174", "48175", "48176", "48177", "48178", "48179", "48180", "48182", "48183", "48184", "48185", "48186", "48187", "48188", "48189", "48190", "48191", "48192", "48193", "48194", "48195", "48197", "48198", "48201", "48202", "48203", "48204", "48205", "48206", "48207", "48208", "48209", "48210", "48211", "48212", "48213", "48214", "48215", "48216", "48217", "48218", "48219", "48220", "48221", "48222", "48223", "48224", "48225", "48226", "48227", "48228", "48229", "48230", "48231", "48232", "48233", "48234", "48235", "48236", "48237", "48238", "48239", "48240", "48242", "48243", "48244", "48255", "48260", "48264", "48265", "48266", "48267", "48268", "48269", "48272", "48275", "48277", "48278", "48279", "48288"],
    "description": "Detroit and surrounding metro area"
  },
  "ann_arbor": {
    "name": "Ann Arbor",
    "zips": ["48103", "48104", "48105", "48106", "48107", "48108", "48109", "48113"],
    "description": "Ann Arbor and surrounding area"
  },
  "grand_rapids": {
    "name": "Grand Rapids",
    "zips": ["49501", "49502", "49503", "49504", "49505", "49506", "49507", "49508", "49509", "49510", "49512", "49514", "49515", "49516", "49518", "49519", "49525", "49534", "49544", "49546", "49548"],
    "description": "Grand Rapids and surrounding area"
  },
  "lansing": {
    "name": "Lansing",
    "zips": ["48901", "48906", "48910", "48911", "48912", "48915", "48917", "48919", "48924", "48933"],
    "description": "Lansing and surrounding area"
  },
  "kalamazoo": {
    "name": "Kalamazoo",
    "zips": ["49001", "49002", "49003", "49004", "49005", "49006", "49007", "49008", "49009", "49048"],
    "description": "Kalamazoo and surrounding area"
  },
  "flint": {
    "name": "Flint",
    "zips": ["48501", "48502", "48503", "48504", "48505", "48506", "48507", "48519", "48529", "48532"],
    "description": "Flint and surrounding area"
  },
  "saginaw": {
    "name": "Saginaw",
    "zips": ["48601", "48602", "48603", "48604", "48605", "48607", "48609", "48638"],
    "description": "Saginaw and surrounding area"
  },
  "muskegon": {
    "name": "Muskegon",
    "zips": ["49440", "49441", "49442", "49443", "49444", "49445"],
    "description": "Muskegon and surrounding area"
  },
  "traverse_city": {
    "name": "Traverse City",
    "zips": ["49684", "49685", "49686", "49696"],
    "description": "Traverse City and surrounding area"
  },
  "other": {
    "name": "Other Michigan Areas",
    "zips": [], // All other ZIPs not in above groups
    "description": "All other Michigan areas"
  }
}
```

### ZIP Group Mapping Function

**File: `lib/deals/zip-groups.ts`**
```typescript
import zipGroups from '@/data/zip-groups.json';

export function getZipGroup(zip: string): string | null {
  // Normalize ZIP (remove dashes, ensure 5 digits)
  const normalizedZip = zip.replace(/\D/g, '').slice(0, 5);
  
  // Find which group contains this ZIP
  for (const [groupKey, groupData] of Object.entries(zipGroups)) {
    if (groupData.zips.includes(normalizedZip)) {
      return groupKey;
    }
  }
  
  // If not found, return 'other' or null
  return 'other';
}

export function getZipGroupName(zip: string): string {
  const groupKey = getZipGroup(zip);
  if (!groupKey) return 'Michigan';
  return zipGroups[groupKey].name;
}

export function getAllZipGroups(): string[] {
  return Object.keys(zipGroups);
}

export function getZipsInGroup(groupKey: string): string[] {
  return zipGroups[groupKey]?.zips || [];
}
```

---

## 3. Landing Page with Substack Embed

### Route: `/deals`

**File: `app/deals/page.tsx`**
```typescript
'use client';

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-neon-green font-black text-5xl mb-4">
          Stop Searching. Start Saving.
        </h1>
        <p className="text-white text-xl mb-8">
          Get the best dispensary deals in your area delivered to your inbox every morning.
        </p>
        <p className="text-gray-400 mb-12">
          No more scrolling through Weedmaps. We do the work. You get the deals.
        </p>

        {/* Substack Embed Widget */}
        <div className="max-w-md mx-auto">
          <iframe
            src="https://dailydispodeals.substack.com/embed"
            width="100%"
            height="320"
            frameBorder="0"
            scrolling="no"
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-neon-green font-bold text-3xl mb-8 text-center">
          Tired of this?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Scrolling through Weedmaps for hours</p>
            <p className="text-gray-400">Trying to find the best deals across dozens of dispensaries</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Manually comparing prices</p>
            <p className="text-gray-400">Opening 10+ tabs just to compare THC% and prices</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Missing the best deals</p>
            <p className="text-gray-400">By the time you check, the deal is gone</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Wasting time</p>
            <p className="text-gray-400">When you just want the best value, fast</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-neon-green font-bold text-3xl mb-8 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-white font-bold mb-2">Sign Up</h3>
            <p className="text-gray-400 text-sm">Enter your email (30 seconds)</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-white font-bold mb-2">We Scan</h3>
            <p className="text-gray-400 text-sm">Daily scans of all dispensaries</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-bold mb-2">We Rank</h3>
            <p className="text-gray-400 text-sm">By THC-per-dollar value</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="text-white font-bold mb-2">You Get Deals</h3>
            <p className="text-gray-400 text-sm">Daily email with top deals</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-neon-green font-bold text-3xl mb-8 text-center">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-8">
            <h3 className="text-neon-green font-bold text-2xl mb-4">FREE</h3>
            <p className="text-white text-4xl font-black mb-2">$0</p>
            <p className="text-gray-400 mb-6">Weekly newsletter</p>
            <ul className="space-y-3 mb-8">
              <li className="text-white">✅ General deals across Michigan</li>
              <li className="text-white">✅ Top 5 deals weekly</li>
              <li className="text-white">✅ Value scores & rankings</li>
            </ul>
          </div>
          <div className="bg-dark-surface rounded-lg border-2 border-neon-green p-8">
            <div className="bg-neon-green text-black px-3 py-1 rounded text-sm font-bold inline-block mb-4">
              POPULAR
            </div>
            <h3 className="text-neon-green font-bold text-2xl mb-4">PREMIUM</h3>
            <p className="text-white text-4xl font-black mb-2">$7<span className="text-lg">/mo</span></p>
            <p className="text-gray-400 mb-6">Daily newsletter</p>
            <ul className="space-y-3 mb-8">
              <li className="text-white">✅ ZIP group-specific deals</li>
              <li className="text-white">✅ Top 10 deals daily</li>
              <li className="text-white">✅ Deal alerts & price drops</li>
              <li className="text-white">✅ Product type filters</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-neon-green font-bold text-3xl mb-8">
          Join 500+ Smart Shoppers
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white mb-2">"Saved me $50 last week!"</p>
            <p className="text-gray-400 text-sm">- Sarah, Metro Detroit</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white mb-2">"Finally, no more Weedmaps rabbit holes"</p>
            <p className="text-gray-400 text-sm">- Mike, Ann Arbor</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white mb-2">"Best $7 I spend every month"</p>
            <p className="text-gray-400 text-sm">- Alex, Grand Rapids</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 4. Newsletter Generation by ZIP Group

### Updated Newsletter Structure

Instead of one newsletter per ZIP, we generate **one newsletter per ZIP group**.

**Example: "Metro Detroit Daily Deals"**
- Contains deals from all ZIPs in Metro Detroit group
- Sent to all subscribers in that group
- Still feels local/personalized

### Newsletter Generation Logic

**File: `lib/content/generate-group-newsletter.ts`**
```typescript
import { getTopDealsByZipGroup } from '@/lib/scoring/queries';
import { getZipGroupName } from '@/lib/deals/zip-groups';

export async function generateNewsletterForGroup(
  groupKey: string,
  date: Date = new Date()
): Promise<{ title: string; body: string }> {
  // Get top deals for all ZIPs in this group
  const deals = await getTopDealsByZipGroup(groupKey, 15);
  const groupName = getZipGroupName(groupKey);

  const title = `🔥 Top Deals in ${groupName} - ${formatDate(date)}`;
  
  // Group deals by product type
  const byType = groupBy(deals, 'productType');
  
  let body = `# Daily Dispo Deals - ${groupName}\n\n`;
  body += `**${formatDate(date)}**\n\n`;
  body += `Here are today's best dispensary deals in ${groupName}, ranked by THC-per-dollar value.\n\n`;
  body += `---\n\n`;

  // Flower section
  if (byType.flower && byType.flower.length > 0) {
    body += `## 🌿 Flower\n\n`;
    byType.flower.slice(0, 5).forEach((deal, idx) => {
      body += `### ${idx + 1}. ${deal.productName} - ${deal.dispensaryName}\n`;
      body += `- **Price:** $${deal.priceUSD} | **THC:** ${deal.thcPercent}% | **Weight:** ${deal.weightGrams}g\n`;
      body += `- **Value Score:** ${deal.valueScore.toFixed(2)} mg/$ (${deal.dealLabel})\n`;
      body += `- **Location:** ${deal.zip}\n\n`;
    });
  }

  // Carts section
  if (byType.cart && byType.cart.length > 0) {
    body += `## 💨 Carts\n\n`;
    byType.cart.slice(0, 5).forEach((deal, idx) => {
      body += `### ${idx + 1}. ${deal.productName} - ${deal.dispensaryName}\n`;
      body += `- **Price:** $${deal.priceUSD} | **THC:** ${deal.thcPercent}% | **Weight:** ${deal.weightGrams}g\n`;
      body += `- **Value Score:** ${deal.valueScore.toFixed(2)} mg/$ (${deal.dealLabel})\n`;
      body += `- **Location:** ${deal.zip}\n\n`;
    });
  }

  // Edibles section
  if (byType.edible && byType.edible.length > 0) {
    body += `## 🍪 Edibles\n\n`;
    byType.edible.slice(0, 5).forEach((deal, idx) => {
      body += `### ${idx + 1}. ${deal.productName} - ${deal.dispensaryName}\n`;
      body += `- **Price:** $${deal.priceUSD} | **THC:** ${deal.thcPercent}% | **Weight:** ${deal.weightGrams}g\n`;
      body += `- **Value Score:** ${deal.valueScore.toFixed(2)} mg/$ (${deal.dealLabel})\n`;
      body += `- **Location:** ${deal.zip}\n\n`;
    });
  }

  body += `---\n\n`;
  body += `**Not seeing your area?** [Upgrade to Premium] for ZIP group-specific daily deals.\n\n`;
  body += `**Want to unsubscribe?** [Manage preferences]\n`;

  return { title, body };
}
```

### Database Query for ZIP Groups

**File: `lib/scoring/queries.ts`**
```typescript
import { getZipsInGroup } from '@/lib/deals/zip-groups';
import { getDealsClient } from '@/lib/deals/supabase';

export async function getTopDealsByZipGroup(
  groupKey: string,
  limit: number = 15
): Promise<Deal[]> {
  const zips = getZipsInGroup(groupKey);
  
  if (zips.length === 0) {
    return [];
  }

  const supabase = getDealsClient();

  // Query deals for all ZIPs in this group
  // Only get deals from today (fetched_at is today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('deals')
    .select('*, dispensaries(name)')
    .in('zip', zips)
    .gte('fetched_at', today.toISOString())
    .order('value_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching deals by ZIP group:', error);
    return [];
  }

  return data || [];
}
```

---

## 5. Database Setup (Supabase)

### Schema Migration

Since you're using Supabase, create these tables in your Supabase project:

**File: `supabase/migrations/001_create_deals_tables.sql`**

```sql
-- Dispensaries table
CREATE TABLE IF NOT EXISTS dispensaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zip TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'MI',
  menu_url TEXT NOT NULL,
  platform_type TEXT NOT NULL, -- 'json_api', 'graphql', 'html_scrape', 'html_ai'
  extraction_config JSONB, -- Store selectors, API keys, etc.
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispensaries_zip ON dispensaries(zip);
CREATE INDEX idx_dispensaries_active ON dispensaries(is_active) WHERE is_active = true;

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispensary_id UUID REFERENCES dispensaries(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL, -- 'flower', 'cart', 'edible', 'concentrate', 'topical', 'other'
  thc_percent DECIMAL(5,2), -- e.g., 25.5 for 25.5%
  weight_grams DECIMAL(8,2), -- e.g., 3.5 for 3.5g
  price_usd DECIMAL(8,2) NOT NULL,
  zip TEXT NOT NULL,
  mg_thc DECIMAL(10,2) GENERATED ALWAYS AS (
    weight_grams * 1000 * (thc_percent / 100)
  ) STORED,
  value_score DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN price_usd > 0 THEN (weight_grams * 1000 * (thc_percent / 100)) / price_usd
      ELSE 0
    END
  ) STORED,
  deal_label TEXT, -- 'STEAL', 'SOLID', 'MID' (computed on read)
  raw_data JSONB, -- Store original scraped/extracted data for debugging
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispensary_id, product_name, price_usd, DATE(fetched_at)) -- Prevent duplicates per day
);

CREATE INDEX idx_deals_zip ON deals(zip);
CREATE INDEX idx_deals_type ON deals(product_type);
CREATE INDEX idx_deals_value_score ON deals(value_score DESC);
CREATE INDEX idx_deals_fetched_at ON deals(fetched_at DESC);
CREATE INDEX idx_deals_zip_type_score ON deals(zip, product_type, value_score DESC);

-- Optional: Newsletter subscribers tracking (for analytics)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  zip TEXT,
  zip_group TEXT, -- Computed from ZIP
  tier TEXT NOT NULL, -- 'free' | 'premium'
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT -- 'landing_page', 'referral', etc.
);

CREATE INDEX idx_subscribers_zip_group ON newsletter_subscribers(zip_group);
```

**Note:** Supabase uses PostgreSQL, so the syntax is the same. You can run this migration via:
- Supabase Dashboard → SQL Editor
- Supabase CLI: `supabase db push`
- Or use the Supabase MCP tools if available

### Supabase Client Setup

**File: `lib/deals/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

// Use your existing Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side operations, use service role key if needed
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getDealsClient() {
  // Use service role key for server-side operations (bypasses RLS)
  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  // Fallback to anon key
  return createClient(supabaseUrl, supabaseAnonKey);
}
```

---

## 6. Daily Automation Flow (Vercel Cron)

### Overview

**Daily Schedule (Once Every 24 Hours):**
1. **4 AM UTC:** Fetch deals from all dispensaries → Store in Supabase
2. **6 AM UTC:** Generate newsletters for ZIP groups → Publish to Substack

**Why This Schedule:**
- Fetch deals early morning (before dispensaries update)
- Generate newsletters 2 hours later (ensures fresh data)
- Substack sends emails to subscribers automatically

### Vercel Cron Job Setup (Once Every 24 Hours)

**File: `vercel.json`**
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-deals",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/publish-newsletters",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Schedule Explanation:**
- **4 AM Daily:** Fetch deals from all dispensaries (once every 24 hours)
- **6 AM Daily:** Generate and publish newsletters for all ZIP groups

**Note:** Vercel cron runs in UTC. Adjust times as needed for your timezone.

### Fetch Deals Cron Job

**File: `app/api/cron/fetch-deals/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { fetchAllDispensaries } from '@/lib/fetch';

export async function GET(request: Request) {
  // Verify cron secret (Vercel sends Authorization header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Starting daily deal fetch (once every 24 hours)...');
    
    // Fetch deals from all active dispensaries
    // This runs once every 24 hours via Vercel cron
    const results = await fetchAllDispensaries();
    
    console.log(`[Cron] Fetched deals from ${results.length} dispensaries`);
    console.log(`[Cron] Deals stored in Supabase`);
    
    return NextResponse.json({ 
      success: true, 
      dispensariesProcessed: results.length,
      timestamp: new Date().toISOString(),
      message: 'Daily deal fetch completed'
    });
  } catch (error) {
    console.error('[Cron] Error fetching deals:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

**What This Does:**
- Runs **once every 24 hours** at 4 AM UTC
- Fetches menu data from all configured dispensaries
- Normalizes and stores deals in Supabase `deals` table
- Calculates value scores automatically (via generated columns)

### Updated Cron Job for Publishing
```typescript
import { NextResponse } from 'next/server';
import { generateNewsletterForGroup } from '@/lib/content/generate-group-newsletter';
import { publishToSubstack } from '@/lib/substack/client';
import { getAllZipGroups } from '@/lib/deals/zip-groups';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Starting daily newsletter generation (once every 24 hours)...');
    
    // Get all ZIP groups
    const zipGroups = getAllZipGroups();
    
    // Generate and publish newsletter for each group
    const results = [];
    
    for (const groupKey of zipGroups) {
      try {
        // Generate newsletter content from today's deals in Supabase
        const { title, body } = await generateNewsletterForGroup(groupKey);
        
        // Publish to Substack
        const post = await publishToSubstack({
          title,
          body,
          send: true, // Auto-send (or false to review first)
        });
        
        results.push({ groupKey, success: true, postId: post.id });
        console.log(`✅ Published newsletter for ${groupKey}`);
      } catch (error) {
        console.error(`❌ Failed to publish for ${groupKey}:`, error);
        results.push({ groupKey, success: false, error: error.message });
      }
    }

    console.log(`[Cron] Newsletter generation completed for ${results.length} groups`);

    return NextResponse.json({ 
      success: true, 
      groupsProcessed: results.length,
      results,
      timestamp: new Date().toISOString(),
      message: 'Daily newsletter generation completed'
    });
  } catch (error) {
    console.error('[Cron] Error generating newsletters:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

**What This Does:**
- Runs **once every 24 hours** at 6 AM UTC (2 hours after deal fetch)
- Queries Supabase for today's deals, grouped by ZIP groups
- Generates markdown newsletters for each ZIP group
- Publishes to Substack via API
- Substack automatically sends emails to subscribers
```

### Vercel Cron Configuration

**File: `vercel.json`** (add to existing file or create new)
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-deals",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/publish-newsletters",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Schedule (UTC):**
- **4 AM Daily:** Fetch deals from all dispensaries (once every 24 hours)
- **6 AM Daily:** Generate and publish newsletters for all ZIP groups

**Note:** 
- Vercel cron runs in UTC timezone
- Times are "once every 24 hours" - adjust as needed
- Make sure `CRON_SECRET` is set in Vercel environment variables

---

## 6. Substack Setup

### Step 1: Create Publication
1. Go to substack.com
2. Create publication: "Daily Dispo Deals"
3. Set custom domain: `deals.thedanknetwork.com` (or `dailydispodeals.thedanknetwork.com`)

### Step 2: Configure Tiers
- **Free tier:** Public newsletter (weekly general deals)
- **Paid tier:** $7/month (daily ZIP group-specific deals)

### Step 3: Get Embed Code
1. Go to Substack Settings → Publication
2. Copy embed widget code
3. Use in your landing page (already shown above)

### Step 4: Get API Key (for publishing)
1. Go to Substack Settings → API
2. Generate API key
3. Add to Vercel environment variables: `SUBSTACK_API_KEY`
4. Add publication ID: `SUBSTACK_PUBLICATION_ID`

---

## 7. Substack API Integration

**File: `lib/substack/client.ts`**
```typescript
interface SubstackPost {
  title: string;
  subtitle?: string;
  body: string; // Markdown
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
      send: post.send || false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Substack API error: ${error}`);
  }

  return response.json();
}
```

---

## 10. Updated Data Model (Supabase)

### Database: Supabase PostgreSQL

All tables are stored in your existing Supabase project. The schema is defined in the migration above.

**Key Points:**
- **Deals Table:** Stores deals by individual ZIP (ZIP group computed on read)
- **Dispensaries Table:** Stores dispensary configs and metadata
- **Newsletter Subscribers:** Optional table for analytics (Substack handles actual subscribers)

### Row Level Security (RLS)

Since you're using Supabase, consider RLS policies:

```sql
-- Allow public read access to deals (for newsletter generation)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deals are publicly readable" ON deals
  FOR SELECT USING (true);

-- Restrict write access to service role only
CREATE POLICY "Only service role can insert deals" ON deals
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

**Note:** For cron jobs, use the service role key to bypass RLS if needed.

---

## 11. Implementation Phases

### Phase 1: Database Setup + Landing Page (Week 1)
- [ ] Create Supabase migration for deals tables
- [ ] Run migration in Supabase dashboard
- [ ] Set up RLS policies (if needed)
- [ ] Create `/deals` route
- [ ] Build landing page with Substack embed
- [ ] Set up Substack publication
- [ ] Configure free and paid tiers
- [ ] Test signup flow

### Phase 2: ZIP Groups (Week 1)
- [ ] Create `zip-groups.json` with Michigan ZIP groups
- [ ] Build ZIP group mapping functions
- [ ] Test ZIP → group mapping

### Phase 3: Newsletter Generation (Week 2)
- [ ] Build group-based newsletter generator
- [ ] Create database query for ZIP groups
- [ ] Test markdown generation
- [ ] Generate sample newsletters

### Phase 4: Substack API (Week 2)
- [ ] Set up Substack API client
- [ ] Test publishing to Substack
- [ ] Review email formatting
- [ ] Test with real deals

### Phase 5: Automation (Week 3)
- [ ] Set up Vercel cron jobs in `vercel.json`
- [ ] Add `CRON_SECRET` to Vercel environment variables
- [ ] Test cron job endpoints manually
- [ ] Connect fetch → generate → publish flow
- [ ] Test end-to-end automation
- [ ] Add error monitoring and logging
- [ ] Verify cron runs daily (check Vercel logs)

### Phase 6: Launch (Week 4)
- [ ] Soft launch to beta users
- [ ] Gather feedback
- [ ] Iterate on content format
- [ ] Marketing push

---

## 12. Benefits of This Approach

### ✅ Simpler Implementation
- No custom signup form needed
- Substack handles payments, emails, subscriber management
- Less code to maintain

### ✅ Better Scalability
- 10 ZIP groups vs 100+ individual ZIPs
- Manageable number of newsletters per day
- Still feels personalized

### ✅ Easier Content Management
- One newsletter per group = consistent quality
- Easier to maintain and update
- Better subscriber density per newsletter

### ✅ Clear Value Proposition
- Free: Weekly general deals
- Premium: Daily ZIP group-specific deals
- Clear upgrade path

---

## 13. Example Newsletter Output

### Subject: "🔥 Top Deals in Metro Detroit - January 15, 2024"

```markdown
# Daily Dispo Deals - Metro Detroit

**Monday, January 15, 2024**

Here are today's best dispensary deals in Metro Detroit, ranked by THC-per-dollar value.

---

## 🌿 Flower

### 1. Blue Dream - Green Leaf Dispensary
- **Price:** $40 | **THC:** 25% | **Weight:** 3.5g
- **Value Score:** 21.9 mg/$ (STEAL 🔥)
- **Location:** 48060

### 2. Gorilla Glue #4 - Weed World
- **Price:** $45 | **THC:** 28% | **Weight:** 3.5g
- **Value Score:** 19.5 mg/$ (SOLID ✅)
- **Location:** 48101

---

## 💨 Carts

### 1. Live Resin Cart - Cloud Nine
- **Price:** $35 | **THC:** 85% | **Weight:** 0.5g
- **Value Score:** 12.1 mg/$ (SOLID ✅)
- **Location:** 48060

---

**Not seeing your area?** [Upgrade to Premium] for ZIP group-specific daily deals.

**Want to unsubscribe?** [Manage preferences]
```

---

## 14. Next Steps

1. **Create ZIP groups file** (`data/zip-groups.json`)
2. **Build landing page** (`app/deals/page.tsx`)
3. **Set up Substack publication**
4. **Test Substack embed widget**
5. **Build newsletter generator** for ZIP groups
6. **Set up automation** (cron + API)
7. **Launch beta** to 10-20 users

---

**End of Final Plan**

This plan uses the Substack embed widget (simplest) and ZIP group segmentation (scalable). Ready to implement!


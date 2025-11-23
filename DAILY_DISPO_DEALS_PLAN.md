# Daily Dispo Deals - Architecture & Implementation Plan

## Executive Summary

**Daily Dispo Deals** is an automated system that fetches, normalizes, scores, and generates newsletter content for cannabis dispensary deals, ranked by THC-per-dollar and grouped by ZIP code. This document outlines the complete architecture, data models, and implementation strategy.

---

## 1. System Architecture Overview

### High-Level Flow

```
┌─────────────────┐
│  Cron Trigger   │ (Daily: Vercel Cron or external ping)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Service  │ → Loop through dispensary configs
└────────┬────────┘
         │
         ├─→ JSON/GraphQL API (preferred)
         └─→ HTML Scraping (fallback)
              │
              └─→ AI Extraction (if scraping fails)
         │
         ▼
┌─────────────────┐
│  Normalize      │ → Extract: product, THC%, weight, price, type, zip
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Score & Store  │ → Calculate valueScore, store in DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate MD    │ → Group by ZIP, create markdown summaries
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Substack API   │ → (Future) Auto-publish or create drafts
└─────────────────┘
```

### Tech Stack Recommendations

**Core:**
- **Next.js 14+** (App Router) - Already in use
- **TypeScript** - Already in use
- **Vercel** - Hosting + Cron jobs

**Database:**
- **Primary: Neon Postgres** (serverless, generous free tier, easy scaling)
- **Alternative: Supabase** (you already have it integrated, but Neon is more cost-effective for this use case)
- **MVP Fallback: SQLite** (via `better-sqlite3` or `@libsql/client`) - Only if you want zero DB setup

**Scraping/Extraction:**
- **Cheerio** - HTML parsing (lightweight, fast)
- **Puppeteer/Playwright** - Only if JavaScript-rendered content needed
- **OpenAI API** (gpt-4o-mini) - Cheap extraction fallback (~$0.15/1M input tokens)
- **Alternative LLMs:** Anthropic Claude Haiku, Groq (ultra-fast, cheap)

**Cron Jobs:**
- **Vercel Cron** (recommended) - Built-in, free tier supports daily
- **Alternative:** External cron service (cron-job.org, EasyCron) pinging a webhook

---

## 2. Data Model & Storage

### Database Schema (Postgres/Neon)

#### `dispensaries` Table
```sql
CREATE TABLE dispensaries (
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
```

#### `deals` Table
```sql
CREATE TABLE deals (
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
  UNIQUE(dispensary_id, product_name, price_usd, fetched_at::date) -- Prevent duplicates per day
);

CREATE INDEX idx_deals_zip ON deals(zip);
CREATE INDEX idx_deals_type ON deals(product_type);
CREATE INDEX idx_deals_value_score ON deals(value_score DESC);
CREATE INDEX idx_deals_fetched_at ON deals(fetched_at DESC);
CREATE INDEX idx_deals_zip_type_score ON deals(zip, product_type, value_score DESC);
```

#### `deal_snapshots` Table (Optional - for historical tracking)
```sql
CREATE TABLE deal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  top_deals JSONB NOT NULL, -- Store top N deals per ZIP/type
  markdown_content TEXT, -- Store generated markdown
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zip, snapshot_date)
);

CREATE INDEX idx_snapshots_date ON deal_snapshots(snapshot_date DESC);
```

### Alternative: SQLite Schema (MVP)
If you want to start with SQLite for zero setup:
- Same schema, but use SQLite types (TEXT instead of UUID, REAL instead of DECIMAL)
- Store in `data/deals.db` or use Turso (serverless SQLite)

---

## 3. Menu Fetching Layer

### Architecture

```
lib/
  fetch/
    ├── index.ts              # Main orchestrator
    ├── fetchers/
    │   ├── json-api.ts      # JSON API fetcher
    │   ├── graphql.ts       # GraphQL fetcher
    │   ├── html-scraper.ts  # Cheerio-based scraper
    │   └── html-ai.ts       # AI extraction fallback
    └── normalizers/
        └── product.ts       # Normalize to Deal schema
```

### Dispensary Configuration

**File: `data/dispensaries.json`** (or store in DB)
```json
[
  {
    "id": "dispo-1",
    "name": "Green Leaf Dispensary",
    "zip": "48060",
    "menuUrl": "https://greenleaf.com/api/menu",
    "platformType": "json_api",
    "extractionConfig": {
      "apiKey": "env:GREENLEAF_API_KEY",
      "endpoint": "/products",
      "responsePath": "data.products"
    }
  },
  {
    "id": "dispo-2",
    "name": "Weed World",
    "zip": "48060",
    "menuUrl": "https://weedworld.com/menu",
    "platformType": "html_scrape",
    "extractionConfig": {
      "selectors": {
        "productCard": ".product-card",
        "name": ".product-name",
        "thc": ".thc-percent",
        "weight": ".weight",
        "price": ".price"
      }
    }
  },
  {
    "id": "dispo-3",
    "name": "Cloud Nine",
    "zip": "48101",
    "menuUrl": "https://cloudnine.com/products",
    "platformType": "html_ai",
    "extractionConfig": {
      "fallbackToAI": true,
      "aiPrompt": "extract_cannabis_products"
    }
  }
]
```

### Fetcher Implementation Strategy

**1. JSON/GraphQL API Fetcher**
- Simple `fetch()` call
- Handle auth (API keys, tokens)
- Parse response and extract product array
- Map to normalized Deal format

**2. HTML Scraper (Cheerio)**
- Fetch HTML page
- Use CSS selectors from config
- Extract text, parse numbers (THC%, weight, price)
- Handle edge cases (missing fields, malformed HTML)

**3. AI Extraction (Fallback)**
- Only trigger if:
  - Scraping fails (no matches)
  - HTML structure is too complex
  - Manual flag in config
- Send HTML/text blob to LLM with structured extraction prompt
- Parse JSON response

### Error Handling & Retries
- Retry logic: 3 attempts with exponential backoff
- Log failures to a `fetch_logs` table or file
- Continue processing other dispensaries even if one fails
- Alert on repeated failures (email/Slack webhook)

---

## 4. Cheap AI / Extraction Design

### Cost Optimization Strategy

**Priority Order:**
1. **JSON/GraphQL APIs** (free, instant)
2. **HTML Scraping** (free, fast)
3. **AI Extraction** (paid, only when needed)

### LLM Provider Selection

**Recommended: OpenAI gpt-4o-mini**
- Cost: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- For a typical menu page (~10K tokens): ~$0.0015 per extraction
- If 50 dispensaries, 10 need AI: ~$0.015/day = ~$0.45/month

**Alternative: Groq (Llama 3.1 70B)**
- Ultra-fast (sub-second responses)
- Cost: ~$0.10/1M input tokens
- Good for structured extraction

**Alternative: Anthropic Claude Haiku**
- Cost: ~$0.25/1M input tokens
- Slightly more reliable for complex HTML

### Prompt Template

**File: `lib/fetch/prompts/extract-products.ts`**
```typescript
export const EXTRACT_PRODUCTS_PROMPT = `You are a data extraction assistant. Extract cannabis product information from the following HTML/text.

Extract ALL products and return a JSON array with this exact structure:
[
  {
    "productName": "string (required)",
    "productType": "flower" | "cart" | "edible" | "concentrate" | "topical" | "other",
    "thcPercent": number (0-100, null if not found),
    "weightGrams": number (null if not found),
    "priceUSD": number (required, extract numeric value only),
    "zip": "string (optional, use context if available)"
  }
]

Rules:
- Extract ONLY numeric values for THC%, weight, and price (remove $, %, "g", etc.)
- If a field is missing, use null (except productName and priceUSD which are required)
- Infer productType from product name/description if not explicit
- Return empty array [] if no products found
- Do not include any explanation, only valid JSON

HTML/Text to extract from:
{{HTML_CONTENT}}

Return only the JSON array, no markdown formatting.`;
```

### LLM Client Wrapper

**File: `lib/ai/client.ts`**
```typescript
// Abstraction layer to swap providers
interface LLMClient {
  extractProducts(html: string, zip?: string): Promise<Deal[]>;
}

// Implementations: OpenAIClient, GroqClient, AnthropicClient
// Factory pattern to select provider based on env var
```

**Usage:**
```typescript
const client = createLLMClient(process.env.LLM_PROVIDER || 'openai');
const deals = await client.extractProducts(htmlContent, '48060');
```

---

## 5. Scoring Logic

### Value Score Calculation

**Formula:**
```typescript
mgTHC = weightGrams * 1000 * (thcPercent / 100)
valueScore = mgTHC / priceUSD
```

**Example:**
- Product: 3.5g flower, 25% THC, $40
- mgTHC = 3.5 * 1000 * 0.25 = 875mg
- valueScore = 875 / 40 = 21.875 mg/$ (higher = better)

### Deal Labeling

**File: `lib/scoring/labels.ts`**
```typescript
export function getDealLabel(valueScore: number, productType: string): 'STEAL' | 'SOLID' | 'MID' {
  // Thresholds by product type (adjust based on market data)
  const thresholds = {
    flower: { steal: 20, solid: 15 },
    cart: { steal: 10, solid: 7 },
    edible: { steal: 5, solid: 3 },
    concentrate: { steal: 25, solid: 18 },
    // ... other types
  };
  
  const thresh = thresholds[productType] || { steal: 15, solid: 10 };
  
  if (valueScore >= thresh.steal) return 'STEAL';
  if (valueScore >= thresh.solid) return 'SOLID';
  return 'MID';
}
```

### Query Utilities

**File: `lib/scoring/queries.ts`**
```typescript
// Get top N deals by ZIP and type
export async function getTopDealsByZip(
  zip: string,
  productType?: string,
  limit: number = 5
): Promise<Deal[]>;

// Get all deals above a value score threshold
export async function getDealsAboveScore(
  minScore: number,
  zip?: string
): Promise<Deal[]>;

// Get deals by label
export async function getDealsByLabel(
  label: 'STEAL' | 'SOLID' | 'MID',
  zip?: string
): Promise<Deal[]>;
```

---

## 6. Content Generation for Substack

### Markdown Generator

**File: `lib/content/generate-markdown.ts`**
```typescript
export async function generateMarkdownForZip(
  zip: string,
  date: Date = new Date()
): Promise<string> {
  const deals = await getTopDealsByZip(zip, undefined, 10);
  
  const byType = groupBy(deals, 'productType');
  
  let markdown = `# Top Deals in ${zip} - ${formatDate(date)}\n\n`;
  
  for (const [type, typeDeals] of Object.entries(byType)) {
    markdown += `## ${capitalize(type)}\n\n`;
    
    typeDeals.slice(0, 5).forEach((deal, idx) => {
      markdown += `${idx + 1}. **${deal.productName}** - ${deal.dispensaryName}\n`;
      markdown += `   - Price: $${deal.priceUSD}\n`;
      markdown += `   - THC: ${deal.thcPercent}% | Weight: ${deal.weightGrams}g\n`;
      markdown += `   - Value Score: ${deal.valueScore.toFixed(2)} mg/$ (${deal.dealLabel})\n\n`;
    });
  }
  
  return markdown;
}
```

### API Route

**File: `app/api/deals/generate/[zip]/route.ts`**
```typescript
// GET /api/deals/generate/48060
// Returns markdown for that ZIP
```

**File: `app/api/deals/generate/all/route.ts`**
```typescript
// GET /api/deals/generate/all
// Returns markdown for all active ZIPs
```

### Future: Substack API Integration

**File: `lib/substack/client.ts`**
```typescript
// Substack API wrapper
// - Create draft posts
// - Publish posts
// - Manage subscribers (for Premium tier)
```

---

## 7. Automation / Cron Jobs

### Vercel Cron Setup

**File: `vercel.json`**
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-deals",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**File: `app/api/cron/fetch-deals/route.ts`**
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret (Vercel sends Authorization header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Run fetch process
  await fetchAllDispensaries();
  
  return NextResponse.json({ success: true });
}
```

### Manual Trigger (for testing)

**File: `app/api/deals/fetch/route.ts`**
```typescript
// POST /api/deals/fetch
// Manually trigger fetch (protected by API key)
```

### Error Monitoring

- Log all fetch attempts to `fetch_logs` table
- Send alerts on repeated failures (email/Slack)
- Dashboard to view fetch status (optional)

---

## 8. Project Structure

```
danknetwork/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── fetch-deals/
│   │   │       └── route.ts
│   │   ├── deals/
│   │   │   ├── fetch/
│   │   │   │   └── route.ts
│   │   │   └── generate/
│   │   │       ├── [zip]/
│   │   │       │   └── route.ts
│   │   │       └── all/
│   │   │           └── route.ts
│   │   └── ...
│   └── ...
├── lib/
│   ├── db/
│   │   ├── client.ts          # DB connection (Neon/Supabase)
│   │   └── migrations/        # SQL migrations
│   ├── fetch/
│   │   ├── index.ts           # Main orchestrator
│   │   ├── fetchers/
│   │   │   ├── json-api.ts
│   │   │   ├── graphql.ts
│   │   │   ├── html-scraper.ts
│   │   │   └── html-ai.ts
│   │   ├── normalizers/
│   │   │   └── product.ts
│   │   └── prompts/
│   │       └── extract-products.ts
│   ├── ai/
│   │   ├── client.ts          # LLM abstraction
│   │   ├── providers/
│   │   │   ├── openai.ts
│   │   │   ├── groq.ts
│   │   │   └── anthropic.ts
│   ├── scoring/
│   │   ├── calculate.ts       # Value score calculation
│   │   ├── labels.ts          # Deal labeling
│   │   └── queries.ts         # DB queries for deals
│   ├── content/
│   │   └── generate-markdown.ts
│   └── substack/
│       └── client.ts          # Future: Substack API
├── data/
│   └── dispensaries.json      # Dispensary configs
├── types/
│   └── deal.ts                # TypeScript types
└── vercel.json                # Cron config
```

---

## 9. Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Set up database (Neon or Supabase)
- [ ] Create schema and migrations
- [ ] Build basic JSON API fetcher
- [ ] Implement scoring logic
- [ ] Create markdown generator
- [ ] Manual testing with 2-3 dispensaries

### Phase 2: Scraping (Week 3)
- [ ] Build HTML scraper (Cheerio)
- [ ] Add 5-10 more dispensaries with HTML menus
- [ ] Error handling and retries
- [ ] Logging system

### Phase 3: AI Fallback (Week 4)
- [ ] Integrate LLM client (OpenAI)
- [ ] Build AI extraction prompt
- [ ] Test on complex HTML pages
- [ ] Cost monitoring

### Phase 4: Automation (Week 5)
- [ ] Set up Vercel Cron
- [ ] Daily fetch job
- [ ] Email/Slack alerts on failures
- [ ] Dashboard (optional)

### Phase 5: Content & Polish (Week 6)
- [ ] Refine markdown templates
- [ ] Add deal labels (STEAL/SOLID/MID)
- [ ] Filter by product type
- [ ] Historical snapshots (optional)

### Phase 6: Substack Integration (Future)
- [ ] Substack API client
- [ ] Auto-create drafts
- [ ] Auto-publish (optional)
- [ ] Premium tier integration

---

## 10. Cost Estimates

### Monthly Costs (MVP)

**Database (Neon Free Tier):**
- Free: 0.5GB storage, 1 project
- Paid (if needed): $19/mo for 10GB

**AI (OpenAI gpt-4o-mini):**
- Assume 20% of dispensaries need AI extraction
- 50 dispensaries × 20% = 10 extractions/day
- 10 × 30 days = 300 extractions/month
- ~$0.0015 per extraction = **~$0.45/month**

**Vercel:**
- Free tier supports cron jobs
- Hobby plan ($20/mo) if you need more

**Total MVP: ~$0-20/month** (depending on DB needs)

### Scaling Costs (100+ dispensaries)
- AI: ~$2-5/month
- Database: $19-50/month (Neon Pro)
- Vercel: $20/month
- **Total: ~$40-75/month**

---

## 11. Security & Best Practices

### API Keys & Secrets
- Store all API keys in Vercel environment variables
- Never commit keys to git
- Rotate keys periodically

### Rate Limiting
- Respect dispensary API rate limits
- Add delays between requests if needed
- Use exponential backoff on failures

### Data Privacy
- Don't store PII
- Comply with cannabis regulations (if applicable)
- Secure database access (connection pooling, SSL)

### Monitoring
- Log all fetch attempts
- Track success/failure rates
- Alert on anomalies (sudden price drops, missing data)

---

## 12. Future Enhancements

### Premium Tier Features
- ZIP-specific daily email digests
- Price drop alerts
- Historical price tracking
- Deal comparison tool
- Mobile app (React Native)

### Advanced Features
- Machine learning for price prediction
- Deal expiration tracking
- User-submitted deals (with verification)
- Social sharing
- Integration with DankPass rewards

---

## 13. Questions to Answer Before Building

1. **Which dispensaries to start with?**
   - List 5-10 target dispensaries
   - Identify their menu formats (JSON/HTML)
   - Get API access if available

2. **ZIP code coverage?**
   - Which ZIPs are priority?
   - How many ZIPs initially?

3. **Product types to track?**
   - Flower, carts, edibles only?
   - Include concentrates, topicals, etc.?

4. **Value score thresholds?**
   - What's considered a "STEAL" vs "SOLID" vs "MID"?
   - Should thresholds vary by product type?

5. **Substack integration timeline?**
   - Manual paste initially?
   - When to automate?

---

## 14. Next Steps

1. **Review this plan** and adjust based on your priorities
2. **Choose database** (Neon recommended for cost)
3. **Set up first dispensary config** (start with JSON API if possible)
4. **Build MVP fetcher** for one dispensary
5. **Test scoring logic** with real data
6. **Generate first markdown** manually
7. **Iterate and expand**

---

## Appendix: Example Code Snippets

### Dispensary Fetcher (JSON API)
```typescript
// lib/fetch/fetchers/json-api.ts
export async function fetchJsonApi(dispo: DispensaryConfig): Promise<RawProduct[]> {
  const response = await fetch(dispo.menuUrl, {
    headers: {
      'Authorization': `Bearer ${process.env[dispo.extractionConfig.apiKey]}`,
    },
  });
  const data = await response.json();
  return extractProducts(data, dispo.extractionConfig.responsePath);
}
```

### Value Score Calculation
```typescript
// lib/scoring/calculate.ts
export function calculateValueScore(
  thcPercent: number,
  weightGrams: number,
  priceUSD: number
): number {
  if (!thcPercent || !weightGrams || !priceUSD || priceUSD === 0) {
    return 0;
  }
  const mgTHC = weightGrams * 1000 * (thcPercent / 100);
  return mgTHC / priceUSD;
}
```

### Markdown Generation
```typescript
// lib/content/generate-markdown.ts
export function formatDealMarkdown(deal: Deal, rank: number): string {
  return `${rank}. **${deal.productName}** - ${deal.dispensaryName}
   - 💰 $${deal.priceUSD} | 🍃 ${deal.thcPercent}% THC | ⚖️ ${deal.weightGrams}g
   - 📊 Value: ${deal.valueScore.toFixed(2)} mg/$ (${deal.dealLabel})`;
}
```

---

**End of Plan**

This document should serve as your blueprint. Adjust priorities, timelines, and tech choices based on your specific needs. Start small, validate with real data, then scale.


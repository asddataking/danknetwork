# Daily Dispo Deals - Final Architecture (Supabase Edge Functions + Vercel)

## Architecture Overview

**Stack:**
- ✅ **Supabase** - Database + Edge Functions
- ✅ **Vercel** - Hosting + Cron Jobs
- ✅ **Substack** - Newsletter platform
- ❌ **No Zapier** - Using Supabase Edge Functions instead

---

## Flow Diagram

```
Vercel Cron (Daily 4 AM UTC)
  ↓
Calls Supabase Edge Function: fetch-deals
  ↓
Edge Function:
  1. Get active dispensaries from Supabase
  2. For each dispensary:
     ├─→ Download menu/PDF from Weedmaps
     ├─→ Extract text/images
     ├─→ Call OpenAI/Claude Vision API
     ├─→ Parse products
     └─→ Store in Supabase deals table
  ↓
Vercel Cron (Daily 6 AM UTC)
  ↓
Calls Supabase Edge Function: generate-newsletters
  ↓
Edge Function:
  1. Query deals from today
  2. Group by ZIP groups
  3. Generate markdown newsletters
  4. Publish to Substack API
  ↓
Substack sends emails automatically
```

---

## 1. Vercel Cron Setup

### Cron Jobs

**File: `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-deals",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/generate-newsletters",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Vercel API Routes (Trigger Edge Functions)

**File: `app/api/cron/fetch-deals/route.ts`**

```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    // Call Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/fetch-deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        trigger: 'daily_cron',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge function failed: ${error}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Deal fetch triggered',
      result,
    });
  } catch (error) {
    console.error('Error triggering fetch-deals:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

**File: `app/api/cron/generate-newsletters/route.ts`**

```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    // Call Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-newsletters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        trigger: 'daily_cron',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge function failed: ${error}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Newsletter generation triggered',
      result,
    });
  } catch (error) {
    console.error('Error triggering generate-newsletters:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

## 2. Supabase Edge Functions

### Setup Supabase CLI

```bash
npm install -g supabase
supabase login
supabase init
supabase functions new fetch-deals
supabase functions new generate-newsletters
```

### Edge Function: fetch-deals

**File: `supabase/functions/fetch-deals/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active dispensaries
    const { data: dispensaries, error: dispError } = await supabase
      .from('dispensaries')
      .select('*')
      .eq('is_active', true);

    if (dispError) throw dispError;

    console.log(`Processing ${dispensaries.length} dispensaries`);

    const results = [];

    // Process each dispensary
    for (const dispensary of dispensaries) {
      try {
        console.log(`Processing ${dispensary.name}...`);

        // Fetch deals based on platform type
        let deals = [];
        
        switch (dispensary.platform_type) {
          case 'json_api':
            deals = await fetchJsonApi(dispensary);
            break;
          case 'html_scrape':
            deals = await fetchHtmlScrape(dispensary);
            break;
          case 'weedmaps_pdf':
            deals = await fetchWeedmapsPDF(dispensary);
            break;
          default:
            console.warn(`Unknown platform type: ${dispensary.platform_type}`);
        }

        // Store deals in database
        if (deals.length > 0) {
          const { error: insertError } = await supabase
            .from('deals')
            .upsert(
              deals.map((deal) => ({
                dispensary_id: dispensary.id,
                product_name: deal.productName,
                product_type: deal.productType,
                thc_percent: deal.thcPercent,
                weight_grams: deal.weightGrams,
                price_usd: deal.priceUSD,
                zip: dispensary.zip,
                raw_data: deal.rawData,
              })),
              { onConflict: 'dispensary_id,product_name,price_usd,fetched_at' }
            );

          if (insertError) throw insertError;

          results.push({
            dispensary: dispensary.name,
            dealsFound: deals.length,
            success: true,
          });
        } else {
          results.push({
            dispensary: dispensary.name,
            dealsFound: 0,
            success: true,
          });
        }
      } catch (error) {
        console.error(`Error processing ${dispensary.name}:`, error);
        results.push({
          dispensary: dispensary.name,
          error: (error as Error).message,
          success: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dispensariesProcessed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions
async function fetchJsonApi(dispensary: any) {
  // Implementation for JSON API
  // ...
}

async function fetchHtmlScrape(dispensary: any) {
  // Implementation for HTML scraping
  // ...
}

async function fetchWeedmapsPDF(dispensary: any) {
  // Implementation for PDF processing
  // ...
}
```

### Edge Function: generate-newsletters

**File: `supabase/functions/generate-newsletters/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's deals
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: deals, error } = await supabase
      .from('deals')
      .select('*, dispensaries(name, zip)')
      .gte('fetched_at', today.toISOString())
      .order('value_score', { ascending: false });

    if (error) throw error;

    // Group deals by ZIP groups
    const zipGroups = await getZipGroups();
    const results = [];

    for (const [groupKey, groupData] of Object.entries(zipGroups)) {
      const groupZips = groupData.zips;
      const groupDeals = deals.filter((deal) =>
        groupZips.includes(deal.zip)
      );

      if (groupDeals.length === 0) continue;

      // Generate markdown
      const markdown = generateMarkdown(groupDeals, groupData.name);

      // Publish to Substack
      const substackResult = await publishToSubstack({
        title: `🔥 Top Deals in ${groupData.name} - ${formatDate(today)}`,
        body: markdown,
      });

      results.push({
        group: groupData.name,
        dealsCount: groupDeals.length,
        success: true,
        substackPostId: substackResult.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        newslettersGenerated: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateMarkdown(deals: any[], groupName: string): string {
  // Generate markdown from deals
  // ...
}

async function publishToSubstack(post: { title: string; body: string }) {
  // Publish to Substack API
  // ...
}
```

---

## 3. Environment Variables

### Vercel Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret
OPENAI_API_KEY=your_openai_key (or ANTHROPIC_API_KEY)
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

## 4. Cost Breakdown (Updated - No Zapier)

### Monthly Costs

| Service | Cost | Notes |
|---------|------|-------|
| **Supabase** | $0-25/month | Free tier for MVP, Pro if needed |
| **Vercel** | $0-20/month | Free tier for MVP, Hobby if needed |
| **Substack** | 10% of revenue | 10% fee on paid subscriptions |
| **OpenAI/Claude** | $30/month | For PDF/image analysis |
| **Zapier** | **$0** | ❌ Removed - using Edge Functions |
| **Total Fixed** | **$30-75/month** | Much cheaper! |

### Break-Even Analysis

**Fixed Costs: $30-75/month**

**At $7/month per subscriber:**
- Net per subscriber: $7 × 0.90 = $6.30 (after Substack fee)
- Break-even: $30 ÷ $6.30 = **5 subscribers** (minimum)
- Break-even: $75 ÷ $6.30 = **12 subscribers** (maximum)

**Much better than with Zapier!**

### Profitability Scenarios

#### Scenario 1: 50 Premium Subscribers

**Revenue:**
- 50 × $7 = $350/month
- Substack fee: -$35
- **Net: $315/month**

**Costs:**
- Fixed: $30-75/month
- **Profit: $240-285/month (68-76% margin)**

#### Scenario 2: 100 Premium Subscribers

**Revenue:**
- 100 × $7 = $700/month
- Substack fee: -$70
- **Net: $630/month**

**Costs:**
- Fixed: $30-75/month
- **Profit: $555-600/month (79-85% margin)**

#### Scenario 3: 200 Premium Subscribers

**Revenue:**
- 200 × $7 = $1,400/month
- Substack fee: -$140
- **Net: $1,260/month**

**Costs:**
- Fixed: $30-75/month
- **Profit: $1,185-1,230/month (84-88% margin)**

---

## 5. Advantages of This Architecture

### ✅ Benefits

1. **Lower Costs** - No Zapier ($49-69/month saved)
2. **More Control** - Full control over code
3. **Better Performance** - Edge Functions are fast
4. **Easier Debugging** - Can see logs in Supabase dashboard
5. **No Vendor Lock-in** - Standard Deno/TypeScript
6. **Scalable** - Supabase Edge Functions scale automatically

### ⚠️ Considerations

1. **Development Time** - Need to write code (but you have full control)
2. **Deployment** - Need to deploy Edge Functions (simple with Supabase CLI)
3. **Monitoring** - Need to set up logging (Supabase provides this)

---

## 6. Deployment Steps

### 1. Set Up Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize (if not already done)
supabase init

# Create functions
supabase functions new fetch-deals
supabase functions new generate-newsletters

# Set secrets
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set SUBSTACK_API_KEY=your_key

# Deploy
supabase functions deploy fetch-deals
supabase functions deploy generate-newsletters
```

### 2. Set Up Vercel

```bash
# Deploy to Vercel
vercel

# Add environment variables in Vercel dashboard
# Set up cron jobs in vercel.json
```

### 3. Test

```bash
# Test Edge Function locally
supabase functions serve fetch-deals

# Test cron job manually
curl -X GET "https://your-app.vercel.app/api/cron/fetch-deals" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 7. Monitoring & Logs

### Supabase Edge Function Logs

View in Supabase Dashboard:
- Go to Edge Functions → Logs
- See real-time execution logs
- Debug errors easily

### Vercel Cron Logs

View in Vercel Dashboard:
- Go to Deployments → Functions
- See cron execution logs
- Monitor success/failure rates

---

## 8. Error Handling

### Retry Logic in Edge Functions

```typescript
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError;
}
```

### Error Logging

```typescript
// Log to Supabase
await supabase.from('fetch_logs').insert({
  dispensary_id: dispensary.id,
  status: 'error',
  error_message: error.message,
  timestamp: new Date().toISOString(),
});
```

---

## 9. Summary

### Architecture: ✅ Supabase Edge Functions + Vercel

**Flow:**
1. Vercel Cron → Calls Edge Function
2. Edge Function → Processes deals
3. Edge Function → Generates newsletters
4. Substack → Sends emails

### Costs: ✅ Much Lower

- **Fixed: $30-75/month** (vs $79-144 with Zapier)
- **Break-even: 5-12 subscribers** (vs 13-23 with Zapier)
- **Better margins at scale**

### Pricing: ✅ $7/month is Perfect

- Break-even at **5-12 subscribers**
- Profitable at **20+ subscribers**
- Strong margins: **68-88%** at scale

---

**End of Architecture Plan**

This architecture is cleaner, cheaper, and gives you full control. Ready to build!


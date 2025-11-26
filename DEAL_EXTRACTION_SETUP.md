# Deal Extraction System - Setup Guide

## ✅ What's Been Built

Your Daily Dispo Deals system now uses **Google Gemini 1.5 Flash** for cost-effective deal extraction from HTML pages.

### Cost Comparison:
| AI Provider | Cost per 1M tokens | Monthly Cost (est.) |
|-------------|-------------------|---------------------|
| **Gemini 1.5 Flash** | **$0.075 input** | **~$5-10/month** ✅ |
| OpenAI GPT-4o | $2.50 input | ~$150-300/month |
| **Savings** | **97% cheaper!** | **Save $140-290/month** |

---

## 🏗️ Architecture

### Flow:
```
Vercel Cron (daily)
  ↓
/api/cron/fetch-deals
  ↓
Supabase Edge Function: fetch-deals
  ↓
For each active dispensary:
  1. Fetch HTML from menu_url
  2. Extract compact text
  3. Send to Gemini 1.5 Flash
  4. Gemini normalizes & validates
  5. Store deals in Supabase
```

### Files:
```
supabase/functions/
├── fetch-deals/
│   ├── index.ts           # Main edge function
│   └── utils.ts           # Platform-specific fetchers
└── _shared/
    └── gemini.ts          # Gemini API integration ✨ NEW
```

---

## 🔧 Setup Steps

### 1. Get Google Gemini API Key (2 minutes)

1. **Go to**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Get API key"** or **"Create API key"**
4. Select or create a project
5. **Copy the API key** (starts with `AIza...`)

### 2. Add to Local Environment

Add to `.env.local`:
```env
GEMINI_API_KEY=AIzaSy...your_key_here
GEMINI_MODEL_NAME=gemini-1.5-flash
```

### 3. Add to Supabase Edge Functions

```bash
# Login to Supabase
supabase login

# Set the secret
supabase secrets set GEMINI_API_KEY=AIzaSy...your_key_here

# Optional: set model name (defaults to gemini-1.5-flash)
supabase secrets set GEMINI_MODEL_NAME=gemini-1.5-flash
```

### 4. Add to Vercel (for cron job)

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - `GEMINI_API_KEY` = your API key
   - `GEMINI_MODEL_NAME` = `gemini-1.5-flash`

---

## 📊 Database Schema

Your existing tables (already set up):

### `dispensaries` table
```sql
- id (uuid, primary key)
- name (text)
- zip (text)
- city, state, address
- menu_url (text) -- URL to scrape
- platform_type (text) -- 'html_ai' for Gemini extraction
- extraction_config (jsonb) -- Optional config
- is_active (boolean)
- last_fetched_at (timestamptz)
```

### `deals` table
```sql
- id (uuid, primary key)
- dispensary_id (uuid, foreign key)
- product_name (text)
- product_type (text) -- flower, cart, edible, etc.
- brand (text, nullable)
- thc_percent (decimal)
- weight_grams (decimal)
- price_usd (decimal)
- zip (text)
- mg_thc (computed)
- value_score (computed)
- deal_label (text) -- STEAL, SOLID, MID
- raw_data (jsonb)
- fetched_at (timestamptz)
```

---

## 🧪 Testing

### Test Locally with Supabase CLI:

```bash
# Make sure you're in project root
cd /path/to/danknetwork

# Start Supabase locally (optional)
supabase start

# Test the edge function
supabase functions serve fetch-deals

# In another terminal, call it:
curl -X POST http://localhost:54321/functions/v1/fetch-deals \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test via Vercel Cron:

1. Deploy to Vercel
2. Set up cron job in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-deals",
      "schedule": "0 4 * * *"
    }
  ]
}
```
3. Manually trigger: `https://yourdomain.com/api/cron/fetch-deals?secret=YOUR_CRON_SECRET`

---

## 📝 Adding a Dispensary

### Example: Add a dispensary using HTML AI extraction

```sql
INSERT INTO dispensaries (
  name,
  city,
  state,
  zip,
  menu_url,
  platform_type,
  extraction_config,
  is_active
) VALUES (
  'Green Tree Remedy',
  'Ann Arbor',
  'MI',
  '48104',
  'https://greentree.com/menu',
  'html_ai',
  '{"name": "Green Tree Remedy"}',
  true
);
```

### Platform Types:

| Type | Description | When to Use |
|------|-------------|-------------|
| `json_api` | Direct JSON API | API available |
| `html_scrape` | HTML with selectors | Structured HTML |
| `weedmaps_pdf` | PDF processing | PDF menus only |
| **`html_ai`** | **Gemini extraction** | **Any HTML page** ✅ |

**Recommendation**: Use `html_ai` for most dispensaries - it's flexible and cost-effective!

---

## 🎯 What Gemini Does

### Input: Compact HTML Text
```
Blue Dream - Flower $35 28% THC 3.5g
Wedding Cake - Flower $40 30% THC 3.5g
Sour Diesel Cart $25 85% THC 1g
...
```

### Output: Normalized Deals
```json
{
  "deals": [
    {
      "productName": "Blue Dream - Flower",
      "normalizedProductName": "Blue Dream",
      "productType": "flower",
      "brand": null,
      "thcPercent": 28.0,
      "weightGrams": 3.5,
      "priceUSD": 35.00,
      "validationConfidence": 0.95,
      "validationNotes": "all data clear"
    }
  ]
}
```

### Gemini's Tasks:
1. ✅ Extract all products from text
2. ✅ Normalize product names (fix typos)
3. ✅ Clean numeric values (remove $, %, g)
4. ✅ Classify product types (flower, cart, etc.)
5. ✅ Extract brand names
6. ✅ Convert weights (1/8 oz → 3.5g)
7. ✅ Validate data quality
8. ✅ Filter out non-products

---

## 💰 Cost Breakdown

### Gemini 1.5 Flash Pricing:
- **Input**: $0.075 per 1M tokens
- **Output**: $0.30 per 1M tokens

### Typical Request:
- **Input**: ~5,000 tokens per dispensary (HTML text)
- **Output**: ~500 tokens (JSON deals)
- **Cost per dispensary**: ~$0.00038 per fetch

### Monthly Costs:
```
30 dispensaries × 30 days = 900 fetches/month
900 × $0.00038 = $0.34/month

With buffer for retries, errors: ~$5-10/month
```

Compare to OpenAI: $150-300/month for same workload! 🎉

---

## 🔍 Monitoring

### Check Edge Function Logs:

```bash
# View logs in Supabase Dashboard
# Or via CLI:
supabase functions logs fetch-deals
```

### Check Database:

```sql
-- View recent deals
SELECT 
  d.name as dispensary,
  COUNT(*) as deals_count,
  MAX(deals.fetched_at) as last_fetch
FROM deals
JOIN dispensaries d ON d.id = deals.dispensary_id
WHERE deals.fetched_at > NOW() - INTERVAL '24 hours'
GROUP BY d.name
ORDER BY deals_count DESC;

-- View fetch logs
SELECT 
  d.name,
  fl.status,
  fl.deals_found,
  fl.error_message,
  fl.timestamp
FROM fetch_logs fl
JOIN dispensaries d ON d.id = fl.dispensary_id
ORDER BY fl.timestamp DESC
LIMIT 20;
```

### Check Gemini API Usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Click on your API key → **Usage**
5. View request counts and quotas

---

## ❓ Troubleshooting

### "GEMINI_API_KEY not configured"
- Check environment variable is set
- For Edge Functions: use `supabase secrets set`
- Restart dev server after adding env vars

### "Failed to fetch HTML"
- Check `menu_url` is accessible
- Some sites block scrapers (need User-Agent header)
- Try accessing URL in browser first

### "No deals extracted"
- Check HTML actually contains deal data
- View extracted text in logs
- HTML might be too dynamic (JavaScript-rendered)

### "Invalid JSON from Gemini"
- Retry - sometimes Gemini returns invalid JSON
- Check error logs for details
- May need to adjust prompt

### Low confidence scores
- Normal! Gemini flags uncertain extractions
- Review `validation_notes` in `raw_data`
- May need to adjust prompt for specific sites

---

## 🚀 Production Deployment

### Checklist:

- [ ] Add `GEMINI_API_KEY` to Vercel environment variables
- [ ] Add `GEMINI_API_KEY` to Supabase secrets
- [ ] Deploy Supabase Edge Function: `supabase functions deploy fetch-deals`
- [ ] Set up Vercel cron job (see `vercel.json`)
- [ ] Add active dispensaries to database
- [ ] Test manual fetch: call `/api/cron/fetch-deals`
- [ ] Monitor first automated run
- [ ] Check `deals` and `fetch_logs` tables

---

## 📚 API Documentation

### Gemini 1.5 Flash
- **Docs**: https://ai.google.dev/tutorials/rest_quickstart
- **Models**: https://ai.google.dev/models/gemini
- **Pricing**: https://ai.google.dev/pricing

### Limits & Quotas:
- **Free tier**: 15 requests per minute, 1,500 per day
- **Paid tier**: 1,000 requests per minute
- **Context window**: 1M tokens (plenty for HTML)

---

## ✨ Next Steps

1. **Get Gemini API key** (2 min)
2. **Add to environment variables** (1 min)
3. **Deploy edge function** (if not already deployed)
4. **Add test dispensary** to database
5. **Trigger manual fetch**
6. **Check results** in `deals` table
7. **Set up daily cron** job
8. **Monitor costs** in Google Cloud Console

---

## 🎉 You're Done!

Your deal extraction system is now powered by Gemini 1.5 Flash - fast, accurate, and 97% cheaper than OpenAI!

**Next**: Add dispensaries and watch the deals roll in! 🚀


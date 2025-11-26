# Deal Extraction - Quick Start (5 minutes)

## ✅ What You're Getting

Automated deal extraction from dispensary websites using **Google Gemini 1.5 Flash** (97% cheaper than OpenAI!)

---

## 🚀 Setup in 5 Steps

### 1️⃣ Get Gemini API Key (2 min)

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Get API key"
3. Copy the key (starts with `AIza...`)

### 2️⃣ Add to Environment (1 min)

**Local** (`.env.local`):
```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

**Supabase** (Edge Functions):
```bash
supabase secrets set GEMINI_API_KEY=AIzaSy...your_key_here
```

**Vercel** (Cron Jobs):
- Dashboard → Settings → Environment Variables
- Add: `GEMINI_API_KEY`

### 3️⃣ Deploy Edge Function (1 min)

```bash
supabase functions deploy fetch-deals
```

### 4️⃣ Add a Test Dispensary (1 min)

In Supabase Dashboard → SQL Editor:

```sql
INSERT INTO dispensaries (
  name,
  city,
  state,
  zip,
  menu_url,
  platform_type,
  is_active
) VALUES (
  'Test Dispensary',
  'Detroit',
  'MI',
  '48201',
  'https://dispensary-website.com/menu',
  'html_ai',  -- Uses Gemini!
  true
);
```

### 5️⃣ Test It! (30 sec)

Manually trigger via API:

```bash
curl -X POST https://yourdomain.com/api/cron/fetch-deals \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_CRON_SECRET"}'
```

Or trigger the edge function directly:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/fetch-deals \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## ✅ Verify It Worked

### Check Deals Table:
```sql
SELECT 
  d.name as dispensary,
  COUNT(*) as deals,
  MAX(deals.fetched_at) as last_fetch
FROM deals
JOIN dispensaries d ON d.id = deals.dispensary_id
GROUP BY d.name;
```

### Check Logs:
```sql
SELECT * FROM fetch_logs 
ORDER BY timestamp DESC 
LIMIT 10;
```

---

## 📊 How It Works

```
1. Cron triggers daily (4am)
   ↓
2. Fetch HTML from dispensary menu
   ↓
3. Extract text from HTML
   ↓
4. Send to Gemini 1.5 Flash
   ↓
5. Gemini normalizes & validates
   ↓
6. Store deals in Supabase
   ↓
7. Generate newsletters (separate cron)
```

---

## 💰 Cost

- **Per dispensary per day**: ~$0.0004
- **30 dispensaries × 30 days**: **~$5-10/month**
- **vs OpenAI**: $150-300/month (save 97%!)

---

## 📝 Platform Types

When adding dispensaries, choose:

| Type | Use Case | Cost |
|------|----------|------|
| **`html_ai`** | **Any HTML page** | **Cheap** ✅ |
| `json_api` | Direct API access | Free |
| `html_scrape` | Structured HTML + selectors | Free |
| `weedmaps_pdf` | PDF menus | Expensive |

**Recommendation**: Use `html_ai` for most sites!

---

## 🎯 What Gemini Extracts

From any HTML menu, Gemini finds:
- ✅ Product names (normalized)
- ✅ Prices (cleaned)
- ✅ THC percentages
- ✅ Weights/quantities
- ✅ Product types (flower, cart, edible, etc.)
- ✅ Brand names
- ✅ Confidence scores

---

## ❓ Troubleshooting

**"GEMINI_API_KEY not configured"**
→ Add key to environment, restart server

**"No deals extracted"**
→ Check URL is accessible
→ View HTML in browser
→ Check `fetch_logs` table for errors

**"Failed to fetch"**
→ Some sites block scrapers
→ Check `menu_url` is correct

---

## 🚀 Production Setup

### Automate Daily Fetches:

In `vercel.json`:
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

Runs daily at 4am UTC!

---

## 📚 Full Documentation

- **Complete guide**: `DEAL_EXTRACTION_SETUP.md`
- **Environment setup**: `ENV_SETUP.md`
- **Gemini integration**: `supabase/functions/_shared/gemini.ts`

---

## ✨ You're Done!

Your deal extraction is now powered by Gemini and ready to scale!

**Next**: Add more dispensaries and watch the deals flow! 🎉


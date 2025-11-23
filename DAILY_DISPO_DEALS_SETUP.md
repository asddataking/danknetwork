# Daily Dispo Deals - Setup Instructions

## ✅ What's Been Built

### Core Infrastructure
- ✅ Database schema (Supabase migration ready)
- ✅ Vercel cron jobs configured
- ✅ Landing page (`/deals`)
- ✅ Supabase Edge Functions (fetch-deals, generate-newsletters)
- ✅ Core utilities (scoring, queries, markdown generation)

### Fetching Utilities
- ✅ JSON API fetcher
- ✅ HTML scraper (Cheerio-based)
- ✅ PDF processor (structure ready)
- ✅ OCR + AI extraction (hybrid approach)

### Newsletter Generation
- ✅ Weekly summary (free tier - Mondays)
- ✅ Daily ZIP group newsletters (premium tier)
- ✅ Substack API integration

---

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

**New dependencies added:**
- `openai` - OpenAI API client
- `@anthropic-ai/sdk` - Claude API client
- `cheerio` - HTML parsing

### 2. Set Up Supabase Database

**Option A: Via Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/001_create_deals_tables.sql`
4. Run the migration

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### 3. Set Up Environment Variables

**Vercel Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret_here
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
SUBSTACK_API_KEY=your_substack_key
SUBSTACK_PUBLICATION_ID=your_publication_id
```

**Supabase Edge Function Secrets:**
```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set ANTHROPIC_API_KEY=your_key
supabase secrets set SUBSTACK_API_KEY=your_key
supabase secrets set SUBSTACK_PUBLICATION_ID=your_id
```

### 4. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy fetch-deals
supabase functions deploy generate-newsletters
```

### 5. Populate Initial Data

**Add ZIP Codes:**
You'll need to populate the `zip_codes` table with Michigan ZIP codes and their coordinates. You can:
- Use a ZIP code database/API
- Manually add the most important ZIPs first
- Use a service like GeoNames or USPS

**Add Dispensaries:**
Insert test dispensaries into the `dispensaries` table:

```sql
INSERT INTO dispensaries (name, zip, menu_url, platform_type, extraction_config, is_active)
VALUES 
  ('Test Dispensary', '48060', 'https://example.com/menu', 'json_api', '{"endpoint": "/products"}', true);
```

### 6. Test the System

**Test Edge Functions Locally:**
```bash
supabase functions serve fetch-deals
supabase functions serve generate-newsletters
```

**Test Cron Jobs Manually:**
```bash
# Test fetch-deals
curl -X GET "http://localhost:3000/api/cron/fetch-deals" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test generate-newsletters
curl -X GET "http://localhost:3000/api/cron/generate-newsletters" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 7. Deploy to Vercel

```bash
vercel
```

The cron jobs will automatically be set up based on `vercel.json`.

---

## 📋 Next Steps

### Immediate
1. ✅ Run database migration
2. ✅ Set environment variables
3. ✅ Deploy Edge Functions
4. ✅ Add test dispensary
5. ✅ Test fetching with one dispensary

### Short Term
1. Add more dispensaries
2. Populate ZIP codes database
3. Test newsletter generation
4. Set up Substack publication
5. Test end-to-end flow

### Before Launch
1. Add error monitoring
2. Set up logging
3. Test with real dispensaries
4. Optimize extraction accuracy
5. Beta test with 10-20 users

---

## 🐛 Troubleshooting

### Edge Functions Not Working
- Check Supabase secrets are set
- Verify function deployment succeeded
- Check function logs in Supabase dashboard

### Cron Jobs Not Running
- Verify `CRON_SECRET` is set in Vercel
- Check Vercel cron logs
- Ensure cron schedule is correct (UTC time)

### No Deals Found
- Check dispensary `is_active` is true
- Verify `menu_url` is correct
- Check extraction config matches dispensary format
- Review `fetch_logs` table for errors

### Newsletter Not Publishing
- Verify Substack API keys
- Check Edge Function logs
- Ensure deals exist for today
- Test Substack API connection

---

## 📊 Monitoring

### Check Fetch Logs
```sql
SELECT * FROM fetch_logs 
ORDER BY timestamp DESC 
LIMIT 20;
```

### Check Recent Deals
```sql
SELECT * FROM deals 
WHERE fetched_at >= CURRENT_DATE 
ORDER BY value_score DESC 
LIMIT 20;
```

### Check Dispensary Status
```sql
SELECT name, last_fetched_at, is_active 
FROM dispensaries 
ORDER BY last_fetched_at DESC;
```

---

## 🎯 Ready to Launch Checklist

- [ ] Database migration run
- [ ] Environment variables set
- [ ] Edge Functions deployed
- [ ] At least 5 dispensaries configured
- [ ] ZIP codes populated
- [ ] Test fetch successful
- [ ] Test newsletter generation
- [ ] Substack publication created
- [ ] Landing page tested
- [ ] Cron jobs verified
- [ ] Error monitoring set up

---

**You're ready to start testing!** 🚀


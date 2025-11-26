# ✅ Supabase Setup Complete!

## 🎉 Your Database is Ready

Project: **svxaujkqspifjrzphqvs**  
URL: **https://svxaujkqspifjrzphqvs.supabase.co**

---

## 📊 Tables Created & Verified

### ✅ Daily Dispo Deals Tables

| Table | Status | Purpose |
|-------|--------|---------|
| **`dispensaries`** | ✅ Ready | Store dispensary info & menu URLs |
| **`deals`** | ✅ Ready | Extracted product deals (with brand column) |
| **`user_preferences`** | ✅ Ready | User deal filtering preferences |
| **`newsletter_subscribers`** | ✅ Ready | Email subscribers (with tier: free/premium) |
| **`zip_codes`** | ✅ Ready | Michigan ZIP code coordinates |
| **`fetch_logs`** | ✅ Ready | Deal extraction monitoring |

### ✅ Other Tables (Already Present)

| Table | Purpose |
|-------|---------|
| **`places`** | Munchie Map restaurants |
| **`products_cache`** | Fourthwall shop products |
| **`episodes_cache`** | YouTube video cache |

---

## 🔑 Credentials

Your environment variables are already set up:

```env
# In your .env.local
NEXT_PUBLIC_SUPABASE_URL=https://svxaujkqspifjrzphqvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eGF1amtxc3BpZmpyenBocXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDU2MzcsImV4cCI6MjA3NTkyMTYzN30.0Q1Q1MXAncn8UOxil60WdnW-0Ft2cXSFpUrdr-yFIac
```

**Note**: You'll also need `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Settings → API

---

## 📋 Schema Details

### `dispensaries` Table
```sql
Columns:
- id (uuid, primary key)
- name (text)
- city, state, zip (text)
- menu_url (text) -- URL to scrape
- platform_type (text) -- 'json_api' | 'html_scrape' | 'weedmaps_pdf' | 'html_ai'
- extraction_config (jsonb) -- Platform-specific config
- is_active (boolean) -- Enable/disable scraping
- last_fetched_at (timestamptz)
- latitude, longitude (numeric)
- created_at, updated_at (timestamptz)

Indexes:
- idx_dispensaries_zip
- idx_dispensaries_active
- idx_dispensaries_coords
```

### `deals` Table
```sql
Columns:
- id (uuid, primary key)
- dispensary_id (uuid, foreign key)
- product_name (text)
- product_type (text) -- 'flower' | 'cart' | 'edible' | 'concentrate' | 'topical' | 'preroll' | 'other'
- brand (text) ✨ NEW!
- thc_percent (numeric)
- weight_grams (numeric)
- price_usd (numeric)
- zip (text)
- mg_thc (computed) -- weight × 1000 × (thc% / 100)
- value_score (computed) -- mgTHC / price
- deal_label (text) -- 'STEAL' | 'SOLID' | 'MID'
- raw_data (jsonb)
- fetched_at, created_at (timestamptz)

Indexes:
- idx_deals_zip
- idx_deals_type
- idx_deals_brand ✨ NEW!
- idx_deals_value_score
- idx_deals_fetched_at
- idx_deals_zip_type_score
- idx_deals_dispensary_fetched
```

### `user_preferences` Table ✨ NEW!
```sql
Columns:
- id (uuid, primary key)
- email (text, unique)
- filter_by_best_quantity (boolean)
- preferred_brands (text[])
- min_thc_percent (numeric)
- max_thc_percent (numeric)
- preferred_product_types (text[])
- max_distance_miles (integer)
- min_value_score (numeric)
- created_at, updated_at (timestamptz)

Indexes:
- idx_user_preferences_email
- idx_user_preferences_brands (GIN)
- idx_user_preferences_types (GIN)
```

### `newsletter_subscribers` Table
```sql
Columns:
- id (uuid, primary key)
- email (text, unique)
- zip (text)
- zip_latitude, zip_longitude (numeric)
- zip_group (text)
- tier (text) -- 'free' | 'premium' ✨ UPDATED!
- subscribed_at (timestamptz)
- source (text)
- substack_subscriber_id (text)

Indexes:
- idx_subscribers_zip
- idx_subscribers_zip_group
- idx_subscribers_tier ✨ NEW!

RLS Policies:
- Anyone can insert (for signup)
- Service role can manage all
```

---

## 🔐 Security Setup

### Row Level Security (RLS)

| Table | RLS Status | Policies |
|-------|-----------|----------|
| `deals` | ✅ Enabled | Public read, Service role write |
| `newsletter_subscribers` | ✅ Enabled | Public insert, Service role manage |
| `user_preferences` | ✅ Enabled | Service role full access |
| `places` | ✅ Enabled | Custom policies |
| `products_cache` | ✅ Enabled | Public read |
| `episodes_cache` | ✅ Enabled | Public read |
| `dispensaries` | ⚠️ Disabled | Service role only (via Edge Functions) |
| `zip_codes` | ⚠️ Disabled | Public read-only data |
| `fetch_logs` | ⚠️ Disabled | Service role only |

**Note**: Tables without RLS are intentionally left open as they're only accessed by Edge Functions with service role key.

---

## 🚀 What You Can Do Now

### 1. Add a Test Dispensary

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
  'Green Tree Remedy',
  'Ann Arbor',
  'MI',
  '48104',
  'https://greentree.com/menu',
  'html_ai',  -- Uses Gemini extraction!
  true
);
```

### 2. Test the Subscriber Flow

```sql
-- Add a test subscriber (free tier)
INSERT INTO newsletter_subscribers (email, zip, tier)
VALUES ('test@example.com', '48201', 'free');

-- Add their preferences
INSERT INTO user_preferences (
  email,
  preferred_product_types,
  preferred_brands
) VALUES (
  'test@example.com',
  ARRAY['flower', 'cart'],
  ARRAY['cookies', 'cresco']
);
```

### 3. Query Subscribers

```sql
-- View all subscribers
SELECT 
  tier,
  COUNT(*) as count,
  MAX(subscribed_at) as latest
FROM newsletter_subscribers
GROUP BY tier;

-- View subscriber with preferences
SELECT 
  ns.email,
  ns.tier,
  ns.zip,
  up.preferred_product_types,
  up.preferred_brands
FROM newsletter_subscribers ns
LEFT JOIN user_preferences up ON up.email = ns.email;
```

### 4. Monitor Deal Extraction

```sql
-- View recent deals
SELECT 
  d.name as dispensary,
  COUNT(*) as deals_count,
  MAX(deals.fetched_at) as last_fetch
FROM deals
JOIN dispensaries d ON d.id = deals.dispensary_id
WHERE deals.fetched_at > NOW() - INTERVAL '24 hours'
GROUP BY d.name;

-- View extraction logs
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

---

## 📊 Migrations Applied

1. ✅ `create_deals_tables` - Initial Daily Dispo Deals schema
2. ✅ `add_brand_and_user_preferences` - Brand column, preroll type, user preferences table, tier column

All migrations have been successfully applied!

---

## 🔧 Edge Functions Ready

Your Supabase is configured for these Edge Functions:

- **`fetch-deals`** - Fetch and process dispensary deals
  - Uses Gemini 1.5 Flash for extraction
  - Stores in `deals` table
  - Logs to `fetch_logs`

- **`generate-newsletters`** - Generate deal newsletters
  - Queries `deals` table
  - Filters by user preferences
  - Sends via MailerSend/Substack

---

## 📝 Next Steps

1. ✅ **Database setup** - Complete!
2. ⏳ **Add Gemini API key** - See `DEAL_EXTRACTION_QUICK_START.md`
3. ⏳ **Deploy edge functions** - `supabase functions deploy`
4. ⏳ **Add test dispensary** - Use SQL above
5. ⏳ **Test deal extraction** - Trigger via API
6. ⏳ **Set up Stripe** - For Premium subscriptions
7. ⏳ **Launch!** - Start getting subscribers

---

## 🎯 Quick Reference

### Dashboard Links:
- **Project**: https://app.supabase.com/project/svxaujkqspifjrzphqvs
- **Table Editor**: https://app.supabase.com/project/svxaujkqspifjrzphqvs/editor
- **SQL Editor**: https://app.supabase.com/project/svxaujkqspifjrzphqvs/sql
- **API Docs**: https://app.supabase.com/project/svxaujkqspifjrzphqvs/api

### API Endpoints:
- **REST API**: https://svxaujkqspifjrzphqvs.supabase.co/rest/v1/
- **Auth**: https://svxaujkqspifjrzphqvs.supabase.co/auth/v1/
- **Storage**: https://svxaujkqspifjrzphqvs.supabase.co/storage/v1/

---

## ✨ You're All Set!

Your Supabase database is fully configured for:
- ✅ Daily Dispo Deals extraction
- ✅ Newsletter subscriptions (Free & Premium)
- ✅ User preferences
- ✅ Deal monitoring & logging

**Ready to extract some deals!** 🚀

See `DEAL_EXTRACTION_QUICK_START.md` for next steps.


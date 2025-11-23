# Daily Dispo Deals - User Preferences Implementation (Option B) ✅

## Summary

Successfully implemented **Option B: Grouped by Preferences** approach. Users with similar preferences are grouped together, and newsletters are generated per preference group for efficiency.

---

## ✅ What Was Implemented

### 1. Database Changes

**Migration: `supabase/migrations/002_add_user_preferences_and_brand.sql`**

- ✅ Added `brand` column to `deals` table
- ✅ Updated `product_type` constraint to include `'preroll'`
- ✅ Created `user_preferences` table with:
  - Product type preferences (array)
  - Brand preferences (array)
  - THC range (min/max)
  - Best quantity filter (boolean)
  - Value score threshold
- ✅ Added `tier` column to `newsletter_subscribers` table
- ✅ Added indexes for performance

### 2. Backend API

**File: `app/api/subscribe/preferences/route.ts`**
- ✅ Saves user preferences to database
- ✅ Links preferences to subscriber by email
- ✅ Calculates ZIP group from ZIP code
- ✅ Handles upserts (updates existing preferences)

### 3. Deal Fetching Updates

**File: `supabase/functions/fetch-deals/utils.ts`**
- ✅ Added `extractBrand()` function
- ✅ Brand extraction from multiple sources:
  - `product.brand`, `product.brandName`, `product.manufacturer`
  - Extracts from product name patterns
  - Normalizes brand names for consistency
- ✅ Updated `normalizeProduct()` to include brand
- ✅ Added `preroll` to product type normalization

**File: `supabase/functions/fetch-deals/index.ts`**
- ✅ Updated to save `brand` field to database

### 4. Newsletter Generation (Option B)

**File: `supabase/functions/generate-newsletters/index.ts`**

**Key Features:**
- ✅ Groups subscribers by preference signature
- ✅ Preference signature includes:
  - ZIP group
  - Product types
  - Brands
  - THC range
  - Best quantity filter
- ✅ Filters deals based on preferences:
  - Product type filtering
  - Brand filtering
  - THC range filtering
  - Best quantity (value score threshold)
- ✅ Generates personalized newsletter per preference group
- ✅ Shows preference summary in newsletter
- ✅ Includes brand in deal listings

**Functions Added:**
- `filterDealsByPreferences()` - Applies all preference filters
- `getPreferenceSignature()` - Creates unique signature for grouping
- `getDefaultPreferences()` - Returns default preferences
- `getMostCommonZipGroup()` - Gets primary ZIP group for group
- `generatePersonalizedNewsletter()` - Creates personalized content

### 5. Frontend Components

**File: `components/deals/PreferenceForm.tsx`**
- ✅ Custom preference form component
- ✅ Product type selection (checkboxes with icons)
- ✅ Brand selection (common brands + custom input)
- ✅ THC range inputs (min/max)
- ✅ Best quantity checkbox
- ✅ Email and ZIP code inputs
- ✅ Form validation
- ✅ Redirects to Substack after saving preferences

**File: `app/deals/page.tsx`**
- ✅ Updated to use `PreferenceForm` instead of Substack embed
- ✅ Form appears in hero section

---

## 🔄 How It Works (Option B)

### Signup Flow

1. **User visits `/deals`**
2. **Fills out preference form:**
   - Email + ZIP code
   - Product types (multi-select)
   - Brands (optional, multi-select)
   - THC range (optional)
   - Best quantity filter
3. **Submits form** → Preferences saved to database
4. **Redirects to Substack** for subscription confirmation

### Newsletter Generation

1. **Get all premium subscribers** with their preferences
2. **Group by preference signature:**
   - Same ZIP group + same product types + same brands + same THC range + same best quantity filter
3. **For each preference group:**
   - Collect deals from ZIP groups in that group
   - Apply preference filters
   - Generate personalized newsletter
   - Publish to Substack
4. **Result:** One newsletter per preference group (efficient, still personalized)

### Example Grouping

**Group 1:**
- ZIP: Detroit City
- Product types: Flower, Vape/Cart
- Brands: Cookies, Cresco
- THC: 20-30%
- Best quantity: Yes
- **Subscribers:** 15 users with these exact preferences

**Group 2:**
- ZIP: Ann Arbor
- Product types: Edibles only
- Brands: Any
- THC: Any
- Best quantity: Yes
- **Subscribers:** 8 users with these preferences

**Result:** 2 newsletters generated (one per group) instead of 23 individual newsletters.

---

## 📊 Database Schema

### `user_preferences` Table

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  filter_by_best_quantity BOOLEAN DEFAULT true,
  preferred_brands TEXT[],
  min_thc_percent DECIMAL(5,2),
  max_thc_percent DECIMAL(5,2),
  preferred_product_types TEXT[],
  max_distance_miles INTEGER DEFAULT 15,
  min_value_score DECIMAL(10,2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### `deals` Table Updates

```sql
ALTER TABLE deals ADD COLUMN brand TEXT;
-- Product types now include: 'flower', 'cart', 'edible', 'concentrate', 'topical', 'preroll', 'other'
```

---

## 🎯 Filtering Logic

### Product Type Filter
```typescript
if (preferences.preferred_product_types?.length > 0) {
  filtered = filtered.filter(deal =>
    preferences.preferred_product_types.includes(deal.product_type)
  );
}
```

### Brand Filter
```typescript
if (preferences.preferred_brands?.length > 0) {
  filtered = filtered.filter(deal =>
    deal.brand && preferences.preferred_brands.includes(deal.brand.toLowerCase())
  );
}
```

### THC Range Filter
```typescript
if (preferences.min_thc_percent) {
  filtered = filtered.filter(deal =>
    deal.thc_percent >= preferences.min_thc_percent
  );
}
if (preferences.max_thc_percent) {
  filtered = filtered.filter(deal =>
    deal.thc_percent <= preferences.max_thc_percent
  );
}
```

### Best Quantity Filter
```typescript
if (preferences.filter_by_best_quantity) {
  const threshold = preferences.min_value_score || 15;
  filtered = filtered.filter(deal =>
    deal.value_score >= threshold
  );
}
```

---

## 📧 Newsletter Content

### Personalized Newsletter Example

```markdown
# Personalized Deals - Detroit City

**Monday, January 15, 2024**

Based on your preferences: Product types: flower, cart | Brands: cookies, cresco | THC range: 20% - 30% | Best quantity deals only

Here are today's best deals matching your preferences...

## 🌿 Flower

### 1. Cookies Blue Dream (cookies) - Green Leaf Dispensary
- **Price:** $35 | **THC:** 25.5% | **Weight:** 3.5g
- **Value Score:** 25.5 mg/$ (STEAL 🔥)
- **Location:** 48201
```

---

## 🚀 Next Steps

### 1. Run Database Migration

```bash
# Via Supabase Dashboard SQL Editor
# Copy contents of: supabase/migrations/002_add_user_preferences_and_brand.sql
# Run in SQL Editor

# OR via Supabase CLI
supabase db push
```

### 2. Deploy Updated Edge Functions

```bash
# Deploy fetch-deals (with brand extraction)
supabase functions deploy fetch-deals

# Deploy generate-newsletters (with preference grouping)
supabase functions deploy generate-newsletters
```

### 3. Test the Flow

1. Visit `/deals` page
2. Fill out preference form
3. Submit → Should redirect to Substack
4. Check database for saved preferences
5. Wait for newsletter generation (or trigger manually)
6. Verify personalized newsletters are generated

### 4. Monitor

- Check `user_preferences` table for saved preferences
- Check `fetch_logs` for deal fetching status
- Monitor newsletter generation logs
- Verify brand extraction is working

---

## 📝 Notes

### Brand Extraction Challenges

- Brand names may be inconsistent across dispensaries
- Some products don't have brands
- Brand extraction from product names is heuristic-based
- May need manual brand mapping/curation over time

### Preference Grouping

- Groups are created based on exact preference match
- Users with no preferences get default preferences
- Default: All product types, any brand, any THC, best quantity only

### Performance

- Indexes added for fast queries
- GIN indexes for array columns (brands, product types)
- Preference grouping reduces newsletter count significantly

---

## ✅ Implementation Complete

All components are implemented and ready for testing. The system now supports:
- ✅ User preference capture at signup
- ✅ Brand extraction from deals
- ✅ Preference-based filtering
- ✅ Grouped newsletter generation (Option B)
- ✅ Personalized newsletter content

**Ready for deployment!** 🚀


# Daily Dispo Deals - User Preferences & Filtering Plan

## Overview

Users should be able to select filtering preferences at signup:
- **Best Quantity** (best value/quantity deals)
- **Brand deals** (filter by certain brands)
- **THC percentage** (filter by THC range)
- **Product type** (vape, flower, pre-rolls, edibles, etc.)

---

## 🗄️ DATABASE CHANGES

### 1. Update `deals` Table

**Add brand field:**
```sql
ALTER TABLE deals 
ADD COLUMN brand TEXT;

CREATE INDEX idx_deals_brand ON deals(brand);
```

**Update product types to include pre-rolls:**
```sql
-- Current: 'flower', 'cart', 'edible', 'concentrate', 'topical', 'other'
-- New: Add 'preroll' to the CHECK constraint

ALTER TABLE deals 
DROP CONSTRAINT IF EXISTS deals_product_type_check;

ALTER TABLE deals 
ADD CONSTRAINT deals_product_type_check 
CHECK (product_type IN ('flower', 'cart', 'edible', 'concentrate', 'topical', 'preroll', 'other'));
```

### 2. Create `user_preferences` Table

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE REFERENCES newsletter_subscribers(email) ON DELETE CASCADE,
  
  -- Filter preferences
  filter_by_best_quantity BOOLEAN DEFAULT true, -- Best value/quantity deals
  preferred_brands TEXT[], -- Array of brand names user wants
  min_thc_percent DECIMAL(5,2), -- Minimum THC% (e.g., 20.0)
  max_thc_percent DECIMAL(5,2), -- Maximum THC% (e.g., 30.0)
  preferred_product_types TEXT[], -- ['flower', 'cart', 'preroll', 'edible']
  
  -- Additional preferences
  max_distance_miles INTEGER DEFAULT 15, -- Proximity filter
  min_value_score DECIMAL(10,2), -- Minimum value score threshold
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_email ON user_preferences(email);
CREATE INDEX idx_user_preferences_brands ON user_preferences USING GIN(preferred_brands);
CREATE INDEX idx_user_preferences_types ON user_preferences USING GIN(preferred_product_types);
```

### 3. Update `newsletter_subscribers` Table

**Link to preferences:**
```sql
-- Already has email, so we can join on email
-- No changes needed, but we'll use email as foreign key
```

---

## 📝 SIGNUP FLOW CHANGES

### Current Flow
1. User visits `/deals`
2. Sees Substack embed widget
3. Enters email → Substack handles everything

### New Flow (Recommended)

**Option A: Custom Form Before Substack (Recommended)**

1. **User visits `/deals`**
2. **Sees custom preference form** (instead of Substack widget directly)
3. **Fills out preferences:**
   - Email
   - ZIP code (for location-based deals)
   - Product type preferences (checkboxes):
     - ☑️ Flower
     - ☑️ Vape/Cart
     - ☑️ Pre-rolls
     - ☑️ Edibles
     - ☑️ Concentrates
     - ☑️ Topicals
   - Brand preferences (multi-select or text input):
     - "Select brands you're interested in"
     - Or: "Any brand" checkbox
   - THC range (slider or inputs):
     - Min THC%: [0-100]
     - Max THC%: [0-100]
   - Best Quantity filter:
     - ☑️ Show only best value/quantity deals
4. **Submits form** → Stores preferences in database
5. **Redirects to Substack** for email confirmation/payment

**Option B: Two-Step Form**

1. **Step 1:** Email + ZIP + Preferences
2. **Step 2:** Substack subscription (free or premium)

---

## 🎨 UI/UX DESIGN

### Preference Form Layout

```
┌─────────────────────────────────────────┐
│  Customize Your Deal Preferences       │
├─────────────────────────────────────────┤
│                                         │
│  Email: [________________]              │
│  ZIP Code: [_____]                     │
│                                         │
│  Product Types (select all you want):  │
│  ☑️ Flower  ☑️ Vape/Cart  ☐ Pre-rolls  │
│  ☑️ Edibles  ☐ Concentrates  ☐ Topicals│
│                                         │
│  Brand Preferences:                    │
│  ☐ Any brand                           │
│  ☐ Select specific brands:            │
│     [Dropdown or multi-select]        │
│                                         │
│  THC Range:                            │
│  Min: [20]%  Max: [30]%                │
│  [Slider: 0% ──────●────── 100%]      │
│                                         │
│  ☑️ Show only best quantity/value deals│
│                                         │
│  [Continue to Subscribe →]             │
└─────────────────────────────────────────┘
```

---

## 🔧 BACKEND IMPLEMENTATION

### 1. API Route: Save Preferences

**File: `app/api/subscribe/preferences/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await request.json();
  const {
    email,
    zip,
    preferredProductTypes,
    preferredBrands,
    minThcPercent,
    maxThcPercent,
    filterByBestQuantity,
  } = body;

  // 1. Save/update subscriber
  const { data: subscriber, error: subError } = await supabase
    .from('newsletter_subscribers')
    .upsert({
      email,
      zip,
      zip_group: getZipGroup(zip), // Helper function
    }, {
      onConflict: 'email',
    })
    .select()
    .single();

  if (subError) throw subError;

  // 2. Save preferences
  const { error: prefError } = await supabase
    .from('user_preferences')
    .upsert({
      email,
      preferred_product_types: preferredProductTypes || [],
      preferred_brands: preferredBrands || [],
      min_thc_percent: minThcPercent || null,
      max_thc_percent: maxThcPercent || null,
      filter_by_best_quantity: filterByBestQuantity ?? true,
    }, {
      onConflict: 'email',
    });

  if (prefError) throw prefError;

  return NextResponse.json({ success: true, email });
}
```

### 2. Update Newsletter Generation

**File: `supabase/functions/generate-newsletters/index.ts`**

**Add filtering function:**
```typescript
function filterDealsByPreferences(
  deals: any[],
  preferences: any
): any[] {
  let filtered = [...deals];

  // Filter by product type
  if (preferences.preferred_product_types?.length > 0) {
    filtered = filtered.filter(deal =>
      preferences.preferred_product_types.includes(deal.product_type)
    );
  }

  // Filter by brand
  if (preferences.preferred_brands?.length > 0) {
    filtered = filtered.filter(deal =>
      preferences.preferred_brands.includes(deal.brand)
    );
  }

  // Filter by THC range
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

  // Filter by best quantity (high value score)
  if (preferences.filter_by_best_quantity) {
    // Only show deals with value_score above threshold
    const threshold = preferences.min_value_score || 15; // Default threshold
    filtered = filtered.filter(deal =>
      deal.value_score >= threshold
    );
  }

  return filtered;
}
```

**Update newsletter generation:**
```typescript
// For each subscriber, get their preferences and filter deals
const { data: subscribers } = await supabase
  .from('newsletter_subscribers')
  .select('email, zip_group, tier');

for (const subscriber of subscribers) {
  // Get user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('email', subscriber.email)
    .single();

  // Get deals for their ZIP group
  const groupDeals = getDealsForZipGroup(subscriber.zip_group);
  
  // Filter by preferences
  const filteredDeals = filterDealsByPreferences(
    groupDeals,
    preferences || {}
  );

  // Generate personalized newsletter
  const markdown = generatePersonalizedNewsletter(
    filteredDeals,
    subscriber.zip_group,
    preferences
  );

  // Publish to Substack (one newsletter per subscriber with preferences)
  await publishToSubstack({
    title: `🔥 Your Personalized Deals - ${subscriber.zip_group}`,
    body: markdown,
    tier: subscriber.tier,
    subscriberEmail: subscriber.email, // For targeting
  });
}
```

---

## 📊 FILTERING LOGIC

### 1. Best Quantity Filter

**What it means:**
- Show only deals with high value scores (best THC-per-dollar)
- Filter out "MID" deals, keep "STEAL" and "SOLID"
- Or: Only show deals above a certain value score threshold

**Implementation:**
```typescript
if (preferences.filter_by_best_quantity) {
  // Option A: Only STEAL and SOLID deals
  filtered = filtered.filter(deal =>
    deal.deal_label === 'STEAL' || deal.deal_label === 'SOLID'
  );
  
  // Option B: Value score threshold
  filtered = filtered.filter(deal =>
    deal.value_score >= 15 // User-configurable threshold
  );
}
```

### 2. Brand Filtering

**Challenges:**
- Need to extract brand from product name or raw data
- Brand names might be inconsistent ("Cookies" vs "Cookies Brand")
- Some products might not have brands

**Solution:**
- Extract brand during deal fetching (from `raw_data`)
- Store in `deals.brand` column
- Normalize brand names (lowercase, remove special chars)
- Allow user to select from list of available brands

**Brand extraction:**
```typescript
// In fetch-deals utils
function extractBrand(product: any): string | null {
  // Try multiple sources
  return product.brand 
    || product.brandName 
    || product.manufacturer
    || extractFromProductName(product.name); // "Cookies Blue Dream" → "Cookies"
}
```

### 3. THC Range Filtering

**Implementation:**
```typescript
if (preferences.min_thc_percent && preferences.max_thc_percent) {
  filtered = filtered.filter(deal =>
    deal.thc_percent >= preferences.min_thc_percent &&
    deal.thc_percent <= preferences.max_thc_percent
  );
}
```

**UI Options:**
- **Slider:** Min/Max THC% with range
- **Dropdown:** Predefined ranges (0-15%, 15-25%, 25%+)
- **Input fields:** Min and Max number inputs

### 4. Product Type Filtering

**Current types:** `flower`, `cart`, `edible`, `concentrate`, `topical`, `other`

**Add:** `preroll`

**Implementation:**
```typescript
if (preferences.preferred_product_types?.length > 0) {
  filtered = filtered.filter(deal =>
    preferences.preferred_product_types.includes(deal.product_type)
  );
}
```

**UI:**
- Checkboxes for each product type
- "Select all" option
- Visual icons for each type

---

## 🎯 NEWSLETTER PERSONALIZATION

### Personalized Newsletter Content

**Subject line:**
- "🔥 Your Personalized Deals - [ZIP Group] - [Date]"
- "🌿 Top Flower Deals in [ZIP Group] - [Date]" (if only flower selected)

**Content:**
```markdown
# Your Personalized Deals - Detroit City

**Monday, January 15, 2024**

Based on your preferences:
- Product types: Flower, Vape/Cart
- Brands: Cookies, Cresco
- THC range: 20-30%
- Best quantity deals only

Here are today's best deals matching your preferences...

## 🌿 Flower (Cookies, Cresco)

### 1. Cookies Blue Dream - Green Leaf
- **Price:** $35 | **THC:** 25.5% | **Weight:** 3.5g
- **Value Score:** 25.5 mg/$ (STEAL 🔥)
- **Brand:** Cookies
```

---

## 🔄 UPDATED SIGNUP FLOW

### Step-by-Step

1. **User visits `/deals`**
2. **Sees preference form** (custom React component)
3. **Fills out:**
   - Email
   - ZIP code
   - Product type checkboxes
   - Brand multi-select (or "Any brand")
   - THC range slider
   - "Best quantity only" checkbox
4. **Clicks "Continue to Subscribe"**
5. **Form submits to `/api/subscribe/preferences`**
6. **Backend saves:**
   - Subscriber info to `newsletter_subscribers`
   - Preferences to `user_preferences`
7. **Redirects to Substack:**
   - Pre-fills email (if possible)
   - User completes subscription (free or premium)
8. **Confirmation:**
   - "Thanks! Check your email to confirm subscription"
   - "Your preferences have been saved"

---

## 📧 NEWSLETTER GENERATION UPDATES

### Current Flow
- Generates one newsletter per ZIP group
- All subscribers in ZIP group get same newsletter

### New Flow (Personalized)
- **Option A:** One newsletter per subscriber (fully personalized)
  - More API calls to Substack
  - More personalized
  - Higher cost/complexity

- **Option B:** Group by preferences (recommended)
  - Group subscribers with similar preferences
  - Generate newsletter per preference group
  - More efficient, still personalized

**Example grouping:**
- Group 1: Flower + Vape, 20-30% THC, Best quantity
- Group 2: Edibles only, Any THC, Any brand
- Group 3: All types, 25%+ THC, Cookies brand

### Implementation Strategy

**For Premium subscribers:**
1. Query all premium subscribers
2. Get their preferences
3. Group by similar preferences
4. Generate personalized newsletter per group
5. Publish to Substack with email targeting

**For Free subscribers:**
- Weekly summary (Mondays)
- Can still apply basic filters (product type, THC range)
- Less personalized than premium

---

## 🗂️ DEAL FETCHING UPDATES

### Extract Brand Information

**Update `lib/fetch/json-api.ts`, `lib/fetch/html-scraper.ts`, etc.:**

```typescript
function normalizeProduct(product: any): any {
  return {
    productName: product.name || product.productName || '',
    productType: normalizeType(product.type || product.productType || ''),
    brand: extractBrand(product), // NEW
    thcPercent: extractNumber(product.thc || product.thcPercent),
    weightGrams: extractNumber(product.weight || product.weightGrams),
    priceUSD: extractPrice(product.price || product.priceUSD),
    rawData: product,
  };
}

function extractBrand(product: any): string | null {
  // Try multiple fields
  if (product.brand) return normalizeBrandName(product.brand);
  if (product.brandName) return normalizeBrandName(product.brandName);
  if (product.manufacturer) return normalizeBrandName(product.manufacturer);
  
  // Try extracting from product name
  // "Cookies Blue Dream" → "Cookies"
  const name = product.name || product.productName || '';
  const brandMatch = name.match(/^([A-Z][a-z]+)\s/); // First capitalized word
  if (brandMatch) return normalizeBrandName(brandMatch[1]);
  
  return null;
}

function normalizeBrandName(brand: string): string {
  return brand
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}
```

### Update Database Schema

**Add brand to deals table:**
```sql
ALTER TABLE deals ADD COLUMN brand TEXT;
CREATE INDEX idx_deals_brand ON deals(brand);
```

---

## 🎨 FRONTEND COMPONENTS

### New Components Needed

1. **`app/deals/preferences-form.tsx`**
   - Custom form component
   - Replaces Substack embed widget
   - Handles all preference inputs

2. **`components/deals/ProductTypeSelector.tsx`**
   - Checkbox group for product types
   - Visual icons for each type

3. **`components/deals/BrandSelector.tsx`**
   - Multi-select dropdown
   - Search/filter brands
   - "Any brand" option

4. **`components/deals/THCRangeSlider.tsx`**
   - Range slider component
   - Min/Max THC% inputs

---

## 📋 IMPLEMENTATION CHECKLIST

### Database
- [ ] Add `brand` column to `deals` table
- [ ] Update `product_type` CHECK constraint to include 'preroll'
- [ ] Create `user_preferences` table
- [ ] Add indexes for performance

### Backend
- [ ] Create `/api/subscribe/preferences` route
- [ ] Update deal fetching to extract brands
- [ ] Add filtering functions to newsletter generation
- [ ] Update Edge Function to use preferences

### Frontend
- [ ] Create preference form component
- [ ] Replace Substack embed with custom form
- [ ] Add product type selector
- [ ] Add brand selector
- [ ] Add THC range slider
- [ ] Add "best quantity" checkbox
- [ ] Handle form submission and redirect

### Testing
- [ ] Test preference saving
- [ ] Test filtering logic
- [ ] Test personalized newsletter generation
- [ ] Test Substack integration with preferences

---

## 🚀 ROLLOUT STRATEGY

### Phase 1: Basic Preferences
- Product type filtering
- THC range filtering
- Best quantity filter

### Phase 2: Brand Filtering
- Extract brands from deals
- Build brand list
- Add brand selector to form

### Phase 3: Advanced Personalization
- Group subscribers by preferences
- Generate personalized newsletters
- A/B test personalization impact

---

## 💡 CONSIDERATIONS

### Performance
- Filtering happens at newsletter generation time
- Consider caching filtered results
- Index preferences columns for fast queries

### Default Preferences
- If user doesn't select preferences, show all deals
- Or: Use smart defaults (all product types, any THC, best quantity)

### Preference Updates
- Allow users to update preferences after signup
- Add "Manage Preferences" link in newsletters
- Store preference history for analytics

### Brand Extraction Challenges
- Brand names might be inconsistent
- Some products don't have brands
- May need manual brand mapping/curation

---

## 📊 EXAMPLE USER PREFERENCES

```json
{
  "email": "user@example.com",
  "zip": "48060",
  "preferred_product_types": ["flower", "cart", "preroll"],
  "preferred_brands": ["cookies", "cresco", "raw garden"],
  "min_thc_percent": 20.0,
  "max_thc_percent": 30.0,
  "filter_by_best_quantity": true,
  "min_value_score": 15.0
}
```

**Result:** Newsletter will only show:
- Flower, Vape/Cart, or Pre-rolls
- From Cookies, Cresco, or Raw Garden brands
- With 20-30% THC
- With value score ≥ 15 (best quantity deals)
- In ZIP group "Troy / Rochester"

---

This plan provides a complete implementation strategy for user preferences and filtering. The system will be highly personalized while maintaining scalability and performance.


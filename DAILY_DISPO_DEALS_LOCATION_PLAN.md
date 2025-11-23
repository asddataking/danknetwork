# Daily Dispo Deals - Location-Based Filtering Plan

## Problem Statement

Large areas like Metro Detroit span 50+ miles. Showing deals from dispensaries 30+ miles away isn't useful. We need to:

1. **Break large areas into smaller sub-regions**
2. **Filter deals by distance** from user's ZIP code
3. **Only show deals within reasonable driving distance** (e.g., 10-15 miles)
4. **Store user location** when they subscribe

---

## 1. Updated Architecture: Location-Based Filtering

### User Journey with Location

```
User Signs Up
  ↓
Enters Email + ZIP Code
  ↓
ZIP stored in our DB (linked to Substack email)
  ↓
Daily Newsletter Generation:
  - Get user's ZIP
  - Calculate distance to each dispensary
  - Filter deals within 15 miles
  - Generate personalized newsletter
```

### Key Changes

1. **Smaller ZIP Groups** - Break Metro Detroit into sub-regions
2. **Distance Calculation** - ZIP code centroids → calculate miles
3. **Proximity Filtering** - Only show deals within X miles
4. **User Location Storage** - Store ZIP when user subscribes

---

## 2. Breaking Down Large Areas

### Metro Detroit → Smaller Sub-Regions

**File: `data/zip-groups.json`** (Updated)

```json
{
  "detroit_city": {
    "name": "Detroit City",
    "zips": ["48201", "48202", "48203", "48204", "48205", "48206", "48207", "48208", "48209", "48210", "48211", "48212", "48213", "48214", "48215", "48216", "48217", "48218", "48219", "48220", "48221", "48222", "48223", "48224", "48225", "48226", "48227", "48228", "48229", "48230", "48231", "48232", "48233", "48234", "48235", "48236", "48237", "48238", "48239", "48240", "48242", "48243"],
    "description": "Detroit city limits"
  },
  "southfield_ferndale": {
    "name": "Southfield / Ferndale",
    "zips": ["48033", "48034", "48035", "48036", "48037", "48038", "48075", "48076", "48083", "48084", "48085", "48086"],
    "description": "Southfield, Ferndale, Royal Oak area"
  },
  "troy_rochester": {
    "name": "Troy / Rochester",
    "zips": ["48083", "48084", "48085", "48098", "48307", "48308", "48309", "48310", "48312", "48313", "48314", "48315", "48316", "48317", "48318", "48320", "48321", "48322", "48323", "48324", "48325", "48326", "48327", "48328", "48329", "48330", "48331", "48334", "48335", "48336", "48340", "48341", "48342", "48343", "48346", "48348", "48350", "48356", "48357", "48359", "48360", "48361", "48362", "48363", "48367", "48370", "48371", "48374", "48375", "48376", "48377", "48380", "48381", "48382", "48383", "48386", "48390", "48393"],
    "description": "Troy, Rochester, Bloomfield Hills area"
  },
  "warren_st_clair_shores": {
    "name": "Warren / St. Clair Shores",
    "zips": ["48080", "48081", "48082", "48083", "48088", "48089", "48090", "48091", "48092", "48093", "48094", "48095", "48096", "48097", "48098", "48099"],
    "description": "Warren, St. Clair Shores, Eastpointe area"
  },
  "livonia_westland": {
    "name": "Livonia / Westland",
    "zips": ["48150", "48151", "48152", "48153", "48154", "48174", "48185", "48186", "48187", "48188", "48189", "48190", "48191", "48192", "48193", "48195"],
    "description": "Livonia, Westland, Canton area"
  },
  "dearborn_dearborn_heights": {
    "name": "Dearborn / Dearborn Heights",
    "zips": ["48120", "48121", "48122", "48123", "48124", "48125", "48126", "48127", "48128"],
    "description": "Dearborn and Dearborn Heights"
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
    "zips": [],
    "description": "All other Michigan areas"
  }
}
```

**Key Change:** Metro Detroit is now broken into 5-6 smaller sub-regions, each covering ~10-15 mile radius.

---

## 3. ZIP Code to Coordinates Mapping

### ZIP Code Centroids

We need lat/lng for each ZIP code to calculate distance.

**Option A: Use a ZIP Code Database**
- Download free ZIP code database (e.g., from GeoNames, USPS)
- Store in Supabase table

**Option B: Use a ZIP Code API**
- Google Geocoding API (free tier: $200/month credit)
- Or use a free service

**Option C: Pre-populate Common ZIPs**
- Manually add lat/lng for Michigan ZIPs we care about
- Store in `zip_codes` table

**Recommended: Option A + C (hybrid)**
- Pre-populate common ZIPs in database
- Use API as fallback for missing ZIPs

### Database Schema

**File: `supabase/migrations/002_create_zip_codes_table.sql`**

```sql
-- ZIP code centroids (lat/lng for distance calculation)
CREATE TABLE IF NOT EXISTS zip_codes (
  zip TEXT PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'MI',
  county TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_zip_codes_coords ON zip_codes(latitude, longitude);

-- Add lat/lng to dispensaries table (if not already there)
ALTER TABLE dispensaries 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX idx_dispensaries_coords ON dispensaries(latitude, longitude);
```

---

## 4. Distance Calculation

### Haversine Formula (Great Circle Distance)

**File: `lib/deals/distance.ts`**

```typescript
/**
 * Calculate distance between two lat/lng points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get ZIP code coordinates from database
 */
export async function getZipCoordinates(zip: string): Promise<{ lat: number; lng: number } | null> {
  const supabase = getDealsClient();
  
  const { data, error } = await supabase
    .from('zip_codes')
    .select('latitude, longitude')
    .eq('zip', zip)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return { lat: data.latitude, lng: data.longitude };
}

/**
 * Calculate distance between two ZIP codes
 */
export async function getDistanceBetweenZips(
  zip1: string,
  zip2: string
): Promise<number | null> {
  const coords1 = await getZipCoordinates(zip1);
  const coords2 = await getZipCoordinates(zip2);
  
  if (!coords1 || !coords2) {
    return null;
  }
  
  return calculateDistance(
    coords1.lat,
    coords1.lng,
    coords2.lat,
    coords2.lng
  );
}
```

---

## 5. User Location Storage

### Updated Subscriber Schema

**File: `supabase/migrations/003_update_subscribers.sql`**

```sql
-- Newsletter subscribers (linked to Substack emails)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  zip TEXT NOT NULL, -- User's ZIP code
  zip_latitude DECIMAL(10, 8), -- Cached for performance
  zip_longitude DECIMAL(11, 8), -- Cached for performance
  zip_group TEXT, -- Computed from ZIP
  tier TEXT NOT NULL, -- 'free' | 'premium'
  max_distance_miles INTEGER DEFAULT 15, -- Max distance for deals (user preference)
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT, -- 'landing_page', 'referral', etc.
  substack_subscriber_id TEXT -- Link to Substack subscriber ID (if available)
);

CREATE INDEX idx_subscribers_zip ON newsletter_subscribers(zip);
CREATE INDEX idx_subscribers_zip_group ON newsletter_subscribers(zip_group);
CREATE INDEX idx_subscribers_tier ON newsletter_subscribers(tier);
```

### Capturing User ZIP on Signup

**Problem:** Substack embed widget doesn't let us capture custom fields easily.

**Solution Options:**

**Option A: Pre-Substack Form (Recommended)**
- User enters email + ZIP on your site first
- Store in your DB
- Then redirect to Substack subscribe page

**Option B: Substack Custom Fields (If Available)**
- Some Substack plans support custom fields
- Check if your plan supports this

**Option C: Post-Subscribe Webhook**
- Substack sends webhook when user subscribes
- You can then prompt user for ZIP via email or link

**Recommended: Option A**

**File: `app/deals/page.tsx`** (Updated)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DealsPage() {
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [step, setStep] = useState<'form' | 'substack'>('form');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store user ZIP in our DB first
    const response = await fetch('/api/deals/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, zip }),
    });
    
    if (response.ok) {
      // Then show Substack embed
      setStep('substack');
    }
  };

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-black">
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-neon-green font-black text-5xl mb-4">
            Stop Searching. Start Saving.
          </h1>
          <p className="text-white text-xl mb-8">
            Get the best dispensary deals near you delivered daily.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-neon-green/20 text-white mb-4"
            />
            <input
              type="text"
              placeholder="ZIP code (e.g., 48060)"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              pattern="[0-9]{5}"
              required
              className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-neon-green/20 text-white mb-4"
            />
            <button
              type="submit"
              className="w-full bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-colors"
            >
              Continue to Subscribe
            </button>
          </form>
        </section>
      </div>
    );
  }

  // Show Substack embed after ZIP is captured
  return (
    <div className="min-h-screen bg-black">
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-neon-green font-black text-5xl mb-4">
          Choose Your Plan
        </h1>
        <div className="max-w-md mx-auto">
          <iframe
            src={`https://dailydispodeals.substack.com/embed?email=${encodeURIComponent(email)}`}
            width="100%"
            height="320"
            frameBorder="0"
            scrolling="no"
            className="rounded-lg"
          />
        </div>
      </section>
    </div>
  );
}
```

**File: `app/api/deals/subscribe/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { getDealsClient } from '@/lib/deals/supabase';
import { getZipCoordinates } from '@/lib/deals/distance';

export async function POST(request: Request) {
  const { email, zip } = await request.json();

  if (!email || !zip) {
    return NextResponse.json({ error: 'Email and ZIP required' }, { status: 400 });
  }

  const supabase = getDealsClient();

  // Get ZIP coordinates
  const zipCoords = await getZipCoordinates(zip);
  
  if (!zipCoords) {
    return NextResponse.json({ 
      error: 'ZIP code not found. Please enter a valid Michigan ZIP code.' 
    }, { status: 400 });
  }

  // Store subscriber (or update if exists)
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert({
      email,
      zip,
      zip_latitude: zipCoords.lat,
      zip_longitude: zipCoords.lng,
      zip_group: getZipGroup(zip), // From zip-groups.ts
      tier: 'free', // Default, can upgrade later
      subscribed_at: new Date().toISOString(),
    }, {
      onConflict: 'email',
    });

  if (error) {
    console.error('Error storing subscriber:', error);
    return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

## 6. Proximity-Based Deal Filtering

### Updated Newsletter Generation

**File: `lib/content/generate-personalized-newsletter.ts`**

```typescript
import { getDealsClient } from '@/lib/deals/supabase';
import { calculateDistance } from '@/lib/deals/distance';

interface Subscriber {
  email: string;
  zip: string;
  zip_latitude: number;
  zip_longitude: number;
  max_distance_miles: number;
}

export async function generatePersonalizedNewsletter(
  subscriber: Subscriber
): Promise<{ title: string; body: string }> {
  const supabase = getDealsClient();
  const maxDistance = subscriber.max_distance_miles || 15;

  // Get all deals from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: allDeals, error } = await supabase
    .from('deals')
    .select('*, dispensaries(zip, latitude, longitude)')
    .gte('fetched_at', today.toISOString())
    .order('value_score', { ascending: false })
    .limit(100); // Get more than needed, then filter by distance

  if (error || !allDeals) {
    throw new Error('Failed to fetch deals');
  }

  // Filter deals by distance
  const nearbyDeals = allDeals.filter((deal) => {
    const dispZip = deal.dispensaries?.zip;
    if (!dispZip) return false;

    // If dispensary has lat/lng, use that
    if (deal.dispensaries.latitude && deal.dispensaries.longitude) {
      const distance = calculateDistance(
        subscriber.zip_latitude,
        subscriber.zip_longitude,
        deal.dispensaries.latitude,
        deal.dispensaries.longitude
      );
      return distance <= maxDistance;
    }

    // Fallback: calculate distance between ZIPs
    // (This requires ZIP code lookup, slower but works)
    return true; // For now, include all if no coords
  });

  // Sort by value score
  nearbyDeals.sort((a, b) => b.value_score - a.value_score);

  // Take top 10
  const topDeals = nearbyDeals.slice(0, 10);

  // Generate markdown
  const title = `🔥 Top Deals Near ${subscriber.zip} - ${formatDate(new Date())}`;
  const body = generateMarkdownFromDeals(topDeals, subscriber.zip);

  return { title, body };
}
```

### Better: Use PostGIS for Distance Queries

**File: `supabase/migrations/004_add_postgis_distance.sql`**

```sql
-- Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to dispensaries (if not exists)
ALTER TABLE dispensaries 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS idx_dispensaries_location ON dispensaries USING GIST(location);

-- Function to get deals within distance
CREATE OR REPLACE FUNCTION get_deals_within_distance(
  user_lat DECIMAL,
  user_lng DECIMAL,
  max_distance_miles INTEGER DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  product_name TEXT,
  value_score DECIMAL,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.product_name,
    d.value_score,
    ST_Distance(
      ST_MakePoint(user_lng, user_lat)::geography,
      disp.location
    ) / 1609.34 AS distance_miles -- Convert meters to miles
  FROM deals d
  JOIN dispensaries disp ON d.dispensary_id = disp.id
  WHERE 
    disp.location IS NOT NULL
    AND ST_Distance(
      ST_MakePoint(user_lng, user_lat)::geography,
      disp.location
    ) / 1609.34 <= max_distance_miles
    AND d.fetched_at >= CURRENT_DATE
  ORDER BY d.value_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

**Updated Query:**

```typescript
export async function getDealsWithinDistance(
  userLat: number,
  userLng: number,
  maxDistanceMiles: number = 15
): Promise<Deal[]> {
  const supabase = getDealsClient();

  const { data, error } = await supabase.rpc('get_deals_within_distance', {
    user_lat: userLat,
    user_lng: userLng,
    max_distance_miles: maxDistanceMiles,
  });

  if (error) {
    console.error('Error fetching deals within distance:', error);
    return [];
  }

  return data || [];
}
```

---

## 7. Updated Newsletter Generation Flow

### Per-User Newsletter (Premium)

**File: `app/api/cron/publish-newsletters/route.ts`** (Updated)

```typescript
import { NextResponse } from 'next/server';
import { getDealsClient } from '@/lib/deals/supabase';
import { generatePersonalizedNewsletter } from '@/lib/content/generate-personalized-newsletter';
import { publishToSubstack } from '@/lib/substack/client';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = getDealsClient();

  // Get all premium subscribers
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('tier', 'premium')
    .is('unsubscribed_at', null)
    .not('zip_latitude', 'is', null)
    .not('zip_longitude', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];

  // Generate personalized newsletter for each subscriber
  for (const subscriber of subscribers || []) {
    try {
      const { title, body } = await generatePersonalizedNewsletter(subscriber);
      
      // Publish to Substack (one newsletter per subscriber)
      // Note: Substack API might need to support per-subscriber publishing
      // Or we send via email API directly
      
      results.push({ 
        email: subscriber.email, 
        success: true 
      });
    } catch (error) {
      console.error(`Failed for ${subscriber.email}:`, error);
      results.push({ 
        email: subscriber.email, 
        success: false, 
        error: error.message 
      });
    }
  }

  return NextResponse.json({ 
    success: true, 
    subscribersProcessed: results.length,
    results 
  });
}
```

**Note:** Substack might not support per-subscriber newsletters. Alternative: Use email service (SendGrid, Resend) for personalized emails.

---

## 8. Free Tier: Group-Based Newsletter

For free tier, still use ZIP groups (smaller now), but filter by distance within group.

**File: `lib/content/generate-group-newsletter.ts`** (Updated)

```typescript
export async function generateNewsletterForGroup(
  groupKey: string,
  date: Date = new Date()
): Promise<{ title: string; body: string }> {
  // Get all ZIPs in this group
  const zips = getZipsInGroup(groupKey);
  
  // Get deals for ZIPs in this group
  const deals = await getTopDealsByZipGroup(groupKey, 20);
  
  // For free tier, we can't personalize by user location
  // But we can show deals from the group, sorted by value
  // Users in that group will see relevant deals
  
  const groupName = getZipGroupName(groupKey);
  const title = `🔥 Top Deals in ${groupName} - ${formatDate(date)}`;
  const body = generateMarkdownFromDeals(deals.slice(0, 10), groupName);
  
  return { title, body };
}
```

---

## 9. Implementation Summary

### Key Changes:

1. **Smaller ZIP Groups** - Break Metro Detroit into 5-6 sub-regions
2. **ZIP Code Database** - Store lat/lng for each ZIP
3. **Distance Calculation** - Haversine formula or PostGIS
4. **Proximity Filtering** - Only show deals within 15 miles
5. **User Location Storage** - Capture ZIP on signup
6. **Personalized Newsletters** - One per premium subscriber (or use email service)

### Database Tables Needed:

1. `zip_codes` - ZIP code centroids (lat/lng)
2. `newsletter_subscribers` - User email + ZIP + coordinates
3. `dispensaries` - Add lat/lng columns
4. `deals` - Already exists

### Next Steps:

1. Create ZIP code database (populate with Michigan ZIPs)
2. Update signup flow to capture ZIP
3. Add distance calculation functions
4. Update newsletter generation to filter by distance
5. Test with real user locations

---

**End of Location-Based Plan**

This plan ensures users only see deals from dispensaries within reasonable driving distance, solving the Metro Detroit coverage problem.


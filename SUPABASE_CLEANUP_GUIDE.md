# Supabase Cleanup Guide

## Overview
This guide helps identify and remove unused database objects after removing the map and Daily Dispo Deals features from DankNetwork.

## Safe to Remove (Definitely Not Needed)

### 1. Map-Specific RPC Functions
These are optional functions that the code has fallbacks for. Safe to remove:
- `get_places_in_bounds(min_lng, min_lat, max_lng, max_lat)` 
- `get_all_published_places()`
- `search_places(...)`

**Note:** The `places` table itself should be KEPT because it's still used by:
- `/place/[slug]` pages (PlaceDetail component)
- `/api/places` route (used by PlaceDetail for nearby places)

### 2. Daily Dispo Deals Tables
Since DDD is now external, these can be removed:
- `dispensaries` - Stores dispensary info for deal fetching
- `deals` - Stores individual product deals
- `user_preferences` - User preferences for DDD filtering
- `zip_codes` - ZIP code coordinates (if only used for DDD)
- `fetch_logs` - Logs for deal fetching operations

### 3. DDD-Related Functions & Triggers
- `add_deals_activity()` - Function that creates activity feed entries for new deals
- `add_deal_activity()` - Similar function (check which one exists)
- `update_updated_at_column()` - Auto-update timestamp function (if only used by dispensaries)
- Trigger: `on_deal_inserted` on `deals` table
- Trigger: `add_deals_activity` on `deals` table (if exists)
- Trigger: `update_dispensaries_updated_at` on `dispensaries` table

### 4. Edge Functions
Remove via Supabase Dashboard or CLI:
- `fetch-deals` - Fetches deals from dispensaries
- `generate-newsletters` - Generates newsletter content for DDD

## Needs Review (May Still Be Used)

### 1. `newsletter_subscribers` Table
**Status:** Still referenced by `/api/subscribe` route and `NewsletterCTA` component

**Decision Needed:**
- If NewsletterCTA is for general DankNetwork newsletter → KEEP table
- If NewsletterCTA should be removed/redirected → REMOVE table

**Current Usage:**
- `app/api/subscribe/route.ts` - General newsletter subscription
- `app/api/subscribe/preferences/route.ts` - DDD preferences (can be removed)
- `components/NewsletterCTA.tsx` - Newsletter signup form on homepage
- `lib/deals/subscriber.ts` - Subscriber management functions

**Recommendation:** 
- If keeping general newsletter → Keep table but remove DDD-specific fields/preferences
- If removing newsletter entirely → Remove table and update NewsletterCTA to redirect

### 2. `deal_collections` Table
**Status:** Referenced by `/deals/collections` route

**Decision Needed:**
- If `/deals/collections` is still used → KEEP
- If `/deals/collections` should be removed → REMOVE

**Current Usage:**
- `app/deals/collections/page.tsx` - User collections of deals
- `app/api/collections/save-deal/route.ts` - API to save deals to collections

**Recommendation:** Remove since DDD is external

## Migration File

See `supabase/migrations/008_cleanup_map_and_ddd.sql` for the SQL migration.

## Steps to Execute Cleanup

1. **Review this guide** and decide what to keep/remove
2. **Backup your database** before running migrations
3. **Run verification queries** in the migration file first
4. **Execute migration** in Supabase SQL Editor
5. **Delete edge functions** via Supabase Dashboard or CLI:
   ```bash
   supabase functions delete fetch-deals
   supabase functions delete generate-newsletters
   ```
6. **Update code** to remove references to deleted objects
7. **Test** that everything still works

## Code Cleanup Needed After Database Cleanup

If you remove the tables, also consider removing/updating:

1. **API Routes:**
   - `app/api/subscribe/preferences/route.ts` - Remove (DDD-specific)
   - `app/api/cron/fetch-deals/route.ts` - Remove (DDD-specific)
   - `app/api/cron/generate-newsletters/route.ts` - Remove (DDD-specific)
   - `app/api/collections/save-deal/route.ts` - Remove (DDD-specific)
   - `app/api/subscribe/route.ts` - Update or remove if newsletter_subscribers is deleted

2. **Components:**
   - `components/deals/PreferenceForm.tsx` - Remove (DDD-specific)
   - `components/NewsletterCTA.tsx` - Update or remove if newsletter_subscribers is deleted

3. **Pages:**
   - `app/deals/collections/page.tsx` - Remove (DDD-specific)

4. **Libraries:**
   - `lib/deals/subscriber.ts` - Remove if newsletter_subscribers is deleted
   - `lib/deals/supabase.ts` - Remove if deals tables are deleted

5. **Edge Functions:**
   - `supabase/functions/fetch-deals/` - Remove directory
   - `supabase/functions/generate-newsletters/` - Remove directory

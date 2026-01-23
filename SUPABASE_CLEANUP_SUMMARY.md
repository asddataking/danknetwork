# Supabase Cleanup Summary

## ✅ Successfully Removed (via Migration)

### Database Objects Removed:
1. **Triggers:**
   - `on_deal_inserted` on `deals` table
   - `update_dispensaries_updated_at` on `dispensaries` table

2. **Functions:**
   - `add_deal_activity()` - Activity feed function for deals
   - `get_places_in_bounds()` - Map RPC function (optional, code has fallbacks)
   - `search_places()` - Map RPC function (optional, code has fallbacks)

3. **Tables (with all data):**
   - `fetch_logs` - Deal fetching logs
   - `deals` - Product deals
   - `dispensaries` - Dispensary information
   - `user_preferences` - User preferences for DDD filtering
   - `zip_codes` - ZIP code coordinates

## ⚠️ Kept (Still in Use)

### Database Objects Kept:
1. **Tables:**
   - `places` - Still used by `/place/[slug]` pages and PlaceDetail component
   - `newsletter_subscribers` - Still used by `/api/subscribe` route and NewsletterCTA component
   - `subscriptions` - Used for premium subscriptions
   - All other tables (rewards, receipts, perks, etc.)

2. **Functions:**
   - `update_updated_at_column()` - Still used by `places` and `subscriptions` tables

## 🔧 Manual Cleanup Required

### Edge Functions to Delete:
These need to be removed via Supabase Dashboard or CLI:

1. **DDD-Related:**
   - `fetch-deals` - Fetches deals from dispensaries
   - `generate-newsletters` - Generates newsletter content for DDD

2. **Map-Related:**
   - `search-places` - Map search functionality
   - `get-filter-options` - Map filter options

**To delete via Supabase CLI:**
```bash
supabase functions delete fetch-deals
supabase functions delete generate-newsletters
supabase functions delete search-places
supabase functions delete get-filter-options
```

**Or via Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Delete each function listed above

## 📝 Next Steps

1. ✅ Database cleanup completed
2. ⏳ Delete edge functions (manual step above)
3. ⏳ Update code to remove references to deleted objects (see SUPABASE_CLEANUP_GUIDE.md)

## Files Created

- `supabase/migrations/008_cleanup_map_and_ddd.sql` - Migration file (already applied)
- `SUPABASE_CLEANUP_GUIDE.md` - Detailed cleanup guide

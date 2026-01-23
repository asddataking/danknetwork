-- Cleanup Migration: Remove Unused Map and DDD Database Objects
-- Run this in Supabase SQL Editor after verifying what's safe to remove
--
-- NOTE: This migration removes:
-- 1. Map-specific RPC functions (optional, code has fallbacks)
-- 2. Daily Dispo Deals tables and related objects (since DDD is now external)
-- 3. Activity feed triggers that depend on deals table
--
-- WARNING: Review carefully before running. Some objects might still be referenced.

-- =============================================
-- PART 1: Remove Activity Feed Triggers (depends on deals table)
-- =============================================

DROP TRIGGER IF EXISTS on_deal_inserted ON public.deals;
DROP FUNCTION IF EXISTS public.add_deal_activity();

-- =============================================
-- PART 2: Remove Map-Specific RPC Functions
-- =============================================
-- These are optional - the code has fallbacks to direct queries
-- Only remove if they exist and are not needed

DROP FUNCTION IF EXISTS public.get_places_in_bounds(min_lng DOUBLE PRECISION, min_lat DOUBLE PRECISION, max_lng DOUBLE PRECISION, max_lat DOUBLE PRECISION);
DROP FUNCTION IF EXISTS public.get_all_published_places();
DROP FUNCTION IF EXISTS public.search_places(
  search_text TEXT,
  county_filter TEXT[],
  cuisine_filter TEXT[],
  tag_filter TEXT[],
  min_price INTEGER,
  max_price INTEGER,
  min_rating DOUBLE PRECISION,
  featured_only BOOLEAN,
  verified_only BOOLEAN,
  limit_count INTEGER
);

-- =============================================
-- PART 3: Remove Daily Dispo Deals Tables
-- =============================================
-- WARNING: These tables are still referenced in API routes but DDD is now external
-- Consider if you want to keep historical data or remove completely
-- BACKUP DATA FIRST if you might need it later!

-- Remove triggers first
DROP TRIGGER IF EXISTS add_deals_activity ON public.deals;
DROP TRIGGER IF EXISTS update_dispensaries_updated_at ON public.dispensaries;

-- Remove functions that depend on tables
DROP FUNCTION IF EXISTS public.add_deals_activity();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Remove tables (CASCADE will remove dependent objects)
-- NOTE: This will delete all data! Backup first if needed.
DROP TABLE IF EXISTS public.fetch_logs CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.dispensaries CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.zip_codes CASCADE;

-- Remove newsletter_subscribers table ONLY if not used by general newsletter
-- WARNING: This table might still be used by /api/subscribe route
-- Check if this table is used elsewhere before removing
-- If you're sure it's not needed:
-- DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;

-- =============================================
-- PART 4: Remove Edge Functions (if they exist)
-- =============================================
-- These would need to be removed via Supabase Dashboard or CLI:
-- supabase functions delete fetch-deals
-- supabase functions delete generate-newsletters
-- supabase functions delete get-filter-options (if only used for map)

-- =============================================
-- VERIFICATION QUERIES (run these first to see what exists)
-- =============================================

-- Check for map RPC functions:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
--   AND routine_name IN ('get_places_in_bounds', 'get_all_published_places', 'search_places');

-- Check for DDD tables:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('dispensaries', 'deals', 'user_preferences', 'zip_codes', 'fetch_logs', 'newsletter_subscribers');

-- Check for triggers:
-- SELECT trigger_name, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_schema = 'public' 
--   AND trigger_name IN ('add_deals_activity', 'update_dispensaries_updated_at', 'on_deal_inserted');

-- Check for functions:
-- SELECT routine_name 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
--   AND routine_name IN ('add_deals_activity', 'add_deal_activity', 'update_updated_at_column');

-- Check table dependencies:
-- SELECT 
--   tc.table_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_schema = 'public'
--   AND (ccu.table_name IN ('dispensaries', 'deals', 'user_preferences', 'zip_codes', 'fetch_logs', 'newsletter_subscribers')
--        OR tc.table_name IN ('dispensaries', 'deals', 'user_preferences', 'zip_codes', 'fetch_logs', 'newsletter_subscribers'));


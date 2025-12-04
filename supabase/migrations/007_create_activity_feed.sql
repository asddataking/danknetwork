-- Activity Feed Migration
-- Creates a public activity feed table for showing recent activity in the sidebar

-- =============================================
-- ACTIVITY FEED TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'new_deal', 
    'new_video', 
    'new_dispensary', 
    'user_milestone', 
    'system_announcement',
    'trivia_game_starting',
    'trivia_winner'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT, -- Emoji or icon name
  action_url TEXT, -- Optional link (e.g., /deals, /shop)
  metadata JSONB, -- Store additional data (deal_id, user_id, etc.)
  is_public BOOLEAN DEFAULT true, -- Public activities visible to all
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON public.activity_feed(is_public) WHERE is_public = true;

-- RLS Policies - Allow public read access
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public activities
CREATE POLICY "Allow public read access to activity feed"
  ON public.activity_feed
  FOR SELECT
  USING (is_public = true);

-- Allow authenticated users to insert (for user milestones, etc.)
CREATE POLICY "Allow authenticated users to insert activities"
  ON public.activity_feed
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only service role can insert system activities (via API)
-- This will be handled server-side with service role key

-- =============================================
-- FUNCTION: Add activity when new deals are fetched
-- =============================================

CREATE OR REPLACE FUNCTION add_deal_activity()
RETURNS TRIGGER AS $$
DECLARE
  dispensary_name TEXT;
  deal_count INTEGER;
BEGIN
  -- Get dispensary name
  SELECT name INTO dispensary_name
  FROM public.dispensaries
  WHERE id = NEW.dispensary_id;

  -- Count new deals added in this batch (same fetched_at timestamp)
  SELECT COUNT(*) INTO deal_count
  FROM public.deals
  WHERE fetched_at = NEW.fetched_at
    AND dispensary_id = NEW.dispensary_id;

  -- Only add activity for first deal in batch (to avoid spam)
  IF deal_count = 1 THEN
    INSERT INTO public.activity_feed (
      type,
      title,
      message,
      icon,
      action_url,
      metadata,
      is_public
    ) VALUES (
      'new_deal',
      'New Deals Available',
      COALESCE(dispensary_name, 'A dispensary') || ' just added new deals!',
      '💰',
      '/deals',
      jsonb_build_object(
        'dispensary_id', NEW.dispensary_id,
        'dispensary_name', dispensary_name,
        'fetched_at', NEW.fetched_at
      ),
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add activity when deals are inserted
CREATE TRIGGER on_deal_inserted
  AFTER INSERT ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION add_deal_activity();

-- =============================================
-- SEED INITIAL ACTIVITIES (Optional)
-- =============================================

-- Add a welcome activity
INSERT INTO public.activity_feed (
  type,
  title,
  message,
  icon,
  action_url,
  is_public
) VALUES (
  'system_announcement',
  'Welcome to Dank Network',
  'Discover the best deals, munchies, and more!',
  '🎉',
  '/',
  true
) ON CONFLICT DO NOTHING;


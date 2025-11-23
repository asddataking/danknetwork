-- Migration: Add user preferences and brand support
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Add brand column to deals table
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS brand TEXT;

CREATE INDEX IF NOT EXISTS idx_deals_brand ON deals(brand);

-- Update product_type constraint to include 'preroll'
ALTER TABLE deals 
DROP CONSTRAINT IF EXISTS deals_product_type_check;

ALTER TABLE deals 
ADD CONSTRAINT deals_product_type_check 
CHECK (product_type IN ('flower', 'cart', 'edible', 'concentrate', 'topical', 'preroll', 'other'));

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  
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

CREATE INDEX IF NOT EXISTS idx_user_preferences_email ON user_preferences(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_brands ON user_preferences USING GIN(preferred_brands);
CREATE INDEX IF NOT EXISTS idx_user_preferences_types ON user_preferences USING GIN(preferred_product_types);

-- Add tier column to newsletter_subscribers if it doesn't exist
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium'));

CREATE INDEX IF NOT EXISTS idx_subscribers_tier ON newsletter_subscribers(tier);

-- Add foreign key relationship (optional, for data integrity)
-- Note: This assumes newsletter_subscribers.email exists
-- ALTER TABLE user_preferences
-- ADD CONSTRAINT fk_user_preferences_email
-- FOREIGN KEY (email) REFERENCES newsletter_subscribers(email) ON DELETE CASCADE;

-- Function to update updated_at timestamp for user_preferences
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Row Level Security for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage user preferences" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');

-- Allow users to read their own preferences (if authenticated)
-- Note: This is optional since we're using service role for newsletter generation
CREATE POLICY "Users can read their own preferences" ON user_preferences
  FOR SELECT USING (auth.email() = email);


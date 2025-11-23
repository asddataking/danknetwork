-- Daily Dispo Deals Database Schema
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dispensaries table
CREATE TABLE IF NOT EXISTS dispensaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  zip TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'MI',
  menu_url TEXT NOT NULL,
  platform_type TEXT NOT NULL CHECK (platform_type IN ('json_api', 'html_scrape', 'weedmaps_pdf', 'html_ai')),
  extraction_config JSONB, -- Store selectors, API keys, etc.
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispensaries_zip ON dispensaries(zip);
CREATE INDEX idx_dispensaries_active ON dispensaries(is_active) WHERE is_active = true;
CREATE INDEX idx_dispensaries_coords ON dispensaries(latitude, longitude);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispensary_id UUID REFERENCES dispensaries(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('flower', 'cart', 'edible', 'concentrate', 'topical', 'other')),
  thc_percent DECIMAL(5,2), -- e.g., 25.5 for 25.5%
  weight_grams DECIMAL(8,2), -- e.g., 3.5 for 3.5g
  price_usd DECIMAL(8,2) NOT NULL,
  zip TEXT NOT NULL,
  mg_thc DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN weight_grams IS NOT NULL AND thc_percent IS NOT NULL 
      THEN weight_grams * 1000 * (thc_percent / 100)
      ELSE NULL
    END
  ) STORED,
  value_score DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN price_usd > 0 AND weight_grams IS NOT NULL AND thc_percent IS NOT NULL
      THEN (weight_grams * 1000 * (thc_percent / 100)) / price_usd
      ELSE 0
    END
  ) STORED,
  deal_label TEXT CHECK (deal_label IN ('STEAL', 'SOLID', 'MID')),
  raw_data JSONB, -- Store original scraped/extracted data for debugging
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispensary_id, product_name, price_usd, DATE(fetched_at)) -- Prevent duplicates per day
);

CREATE INDEX idx_deals_zip ON deals(zip);
CREATE INDEX idx_deals_type ON deals(product_type);
CREATE INDEX idx_deals_value_score ON deals(value_score DESC);
CREATE INDEX idx_deals_fetched_at ON deals(fetched_at DESC);
CREATE INDEX idx_deals_zip_type_score ON deals(zip, product_type, value_score DESC);
CREATE INDEX idx_deals_dispensary_fetched ON deals(dispensary_id, fetched_at DESC);

-- ZIP codes table (for distance calculation)
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

-- Newsletter subscribers table (OPTIONAL - for analytics only)
-- Substack handles all subscriber management, this is just for tracking ZIP codes if needed
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  zip TEXT, -- Optional: User's ZIP code (if we capture it)
  zip_latitude DECIMAL(10, 8),
  zip_longitude DECIMAL(11, 8),
  zip_group TEXT, -- Computed from ZIP
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'landing_page', 'referral', etc.
  substack_subscriber_id TEXT -- Link to Substack subscriber ID (if available via API)
);

CREATE INDEX idx_subscribers_zip ON newsletter_subscribers(zip);
CREATE INDEX idx_subscribers_zip_group ON newsletter_subscribers(zip_group);

-- Fetch logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS fetch_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispensary_id UUID REFERENCES dispensaries(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  deals_found INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fetch_logs_dispensary ON fetch_logs(dispensary_id);
CREATE INDEX idx_fetch_logs_timestamp ON fetch_logs(timestamp DESC);
CREATE INDEX idx_fetch_logs_status ON fetch_logs(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_dispensaries_updated_at
  BEFORE UPDATE ON dispensaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (optional - adjust as needed)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to deals (for newsletter generation)
CREATE POLICY "Deals are publicly readable" ON deals
  FOR SELECT USING (true);

-- Restrict write access to service role only
CREATE POLICY "Only service role can insert deals" ON deals
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Subscribers table is optional (for analytics only)
-- Substack handles all subscriber management


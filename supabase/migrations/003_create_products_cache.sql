-- Migration: Create products_cache table for Fourthwall shop integration
-- This table caches products from Fourthwall to improve performance and provide fallback data

-- Create products_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS products_cache (
  product_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  checkout_url TEXT,
  raw_data JSONB, -- Store complete product data from Fourthwall
  expires_at TIMESTAMPTZ NOT NULL, -- Cache expiration time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_cache_expires_at ON products_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_products_cache_category ON products_cache(category);
CREATE INDEX IF NOT EXISTS idx_products_cache_in_stock ON products_cache(in_stock);

-- Enable Row Level Security
ALTER TABLE products_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (products are public data)
CREATE POLICY IF NOT EXISTS "Allow public read access to products"
  ON products_cache
  FOR SELECT
  TO public
  USING (true);

-- Allow service role to manage products (for caching)
CREATE POLICY IF NOT EXISTS "Allow service role to manage products"
  ON products_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon role to insert/update (for API caching)
CREATE POLICY IF NOT EXISTS "Allow anon to insert/update products"
  ON products_cache
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow anon to update products"
  ON products_cache
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create a function to clean up expired cache entries (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_products_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM products_cache
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment explaining the table
COMMENT ON TABLE products_cache IS 'Caches Fourthwall shop products to improve performance and provide fallback when API is unavailable. Products expire after 1 hour but are kept as stale fallback.';


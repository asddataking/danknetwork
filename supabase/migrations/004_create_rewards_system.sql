-- DankPass Rewards System Migration
-- This creates the necessary tables for the rewards/points functionality

-- =============================================
-- USER PROFILES & PREMIUM
-- =============================================

-- Extend auth.users with reward profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  tier TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  is_premium BOOLEAN DEFAULT false,
  premium_since TIMESTAMP WITH TIME ZONE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  total_points_earned INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  receipts_uploaded INTEGER DEFAULT 0,
  perks_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON public.user_profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium ON public.user_profiles(is_premium);

-- =============================================
-- PARTNERS / BUSINESSES
-- =============================================

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('dispensary', 'restaurant', 'retail', 'other')),
  description TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  points_multiplier DECIMAL(3, 2) DEFAULT 1.00 CHECK (points_multiplier >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_active ON public.partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners(business_type);

-- =============================================
-- RECEIPTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  total DECIMAL(10, 2),
  merchant_name TEXT,
  purchase_date DATE,
  points_awarded INTEGER DEFAULT 0,
  points_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  rejection_reason TEXT,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_receipts_user ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON public.receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_partner ON public.receipts(partner_id);

-- =============================================
-- PERKS / REWARDS
-- =============================================

CREATE TABLE IF NOT EXISTS public.perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  is_premium_only BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('dispensary', 'restaurant', 'retail', 'travel', 'special', 'other')),
  image_url TEXT,
  terms_and_conditions TEXT,
  redemption_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  redeemed_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perks_active ON public.perks(is_active);
CREATE INDEX IF NOT EXISTS idx_perks_category ON public.perks(category);
CREATE INDEX IF NOT EXISTS idx_perks_premium ON public.perks(is_premium_only);
CREATE INDEX IF NOT EXISTS idx_perks_partner ON public.perks(partner_id);

-- =============================================
-- PERK REDEMPTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.perk_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perk_id UUID NOT NULL REFERENCES public.perks(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'refunded')),
  redemption_code TEXT UNIQUE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.perk_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_perk ON public.perk_redemptions(perk_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.perk_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_code ON public.perk_redemptions(redemption_code);

-- =============================================
-- POINTS TRANSACTIONS LOG
-- =============================================

CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'refund', 'bonus', 'adjustment')),
  reference_id UUID,
  reference_type TEXT CHECK (reference_type IN ('receipt', 'perk', 'promotion', 'admin', 'other')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.points_transactions(created_at DESC);

-- =============================================
-- REFERRALS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_points_awarded INTEGER DEFAULT 0,
  referee_points_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perk_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Partners: Public read access
CREATE POLICY "Anyone can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

-- Receipts: Users can only see their own
CREATE POLICY "Users can view own receipts" ON public.receipts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON public.receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Perks: Public read access for active perks
CREATE POLICY "Anyone can view active perks" ON public.perks
  FOR SELECT USING (is_active = true);

-- Perk Redemptions: Users can view their own
CREATE POLICY "Users can view own redemptions" ON public.perk_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON public.perk_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Points Transactions: Users can view their own
CREATE POLICY "Users can view own transactions" ON public.points_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Referrals: Users can view their own referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perks_updated_at BEFORE UPDATE ON public.perks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to award points and update user profile
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction
  INSERT INTO public.points_transactions (
    user_id, amount, transaction_type, reference_id, reference_type, description
  ) VALUES (
    p_user_id, p_amount, p_transaction_type, p_reference_id, p_reference_type, p_description
  );
  
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    points = points + p_amount,
    total_points_earned = total_points_earned + GREATEST(p_amount, 0),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate tier based on points
CREATE OR REPLACE FUNCTION calculate_tier(p_points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_points >= 5000 THEN
    RETURN 'Platinum';
  ELSIF p_points >= 2500 THEN
    RETURN 'Gold';
  ELSIF p_points >= 1000 THEN
    RETURN 'Silver';
  ELSE
    RETURN 'Bronze';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update tier when points change
CREATE OR REPLACE FUNCTION update_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier = calculate_tier(NEW.points);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tier_on_points_change BEFORE UPDATE OF points ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_tier();

-- =============================================
-- SEED DATA (Sample Partners & Perks)
-- =============================================

-- Insert sample partners
INSERT INTO public.partners (business_name, business_type, description, is_active) VALUES
  ('Green Valley Dispensary', 'dispensary', 'Premium cannabis products and accessories', true),
  ('Pizza Palace', 'restaurant', 'Authentic Italian pizza and pasta', true),
  ('Local Coffee Co.', 'restaurant', 'Artisan coffee and baked goods', true),
  ('Elite Dispensary', 'dispensary', 'VIP cannabis experience', true)
ON CONFLICT DO NOTHING;

-- Insert sample perks
INSERT INTO public.perks (
  partner_id,
  title,
  description,
  points_cost,
  is_premium_only,
  category,
  is_active
) 
SELECT 
  p.id,
  CASE p.business_name
    WHEN 'Green Valley Dispensary' THEN '20% Off Edibles'
    WHEN 'Pizza Palace' THEN 'Free Appetizer'
    WHEN 'Local Coffee Co.' THEN 'Free Coffee'
    WHEN 'Elite Dispensary' THEN 'VIP Lounge Access'
  END,
  CASE p.business_name
    WHEN 'Green Valley Dispensary' THEN 'Get 20% off any edible product'
    WHEN 'Pizza Palace' THEN 'Complimentary appetizer with main course'
    WHEN 'Local Coffee Co.' THEN 'Complimentary coffee with any purchase'
    WHEN 'Elite Dispensary' THEN 'Exclusive access to premium lounge area'
  END,
  CASE p.business_name
    WHEN 'Green Valley Dispensary' THEN 500
    WHEN 'Pizza Palace' THEN 400
    WHEN 'Local Coffee Co.' THEN 300
    WHEN 'Elite Dispensary' THEN 1000
  END,
  CASE p.business_name
    WHEN 'Elite Dispensary' THEN true
    ELSE false
  END,
  CASE p.business_type
    WHEN 'dispensary' THEN 'dispensary'
    WHEN 'restaurant' THEN 'restaurant'
  END,
  true
FROM public.partners p
ON CONFLICT DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.partners TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.receipts TO authenticated;
GRANT SELECT ON public.perks TO authenticated;
GRANT SELECT, INSERT ON public.perk_redemptions TO authenticated;
GRANT SELECT ON public.points_transactions TO authenticated;
GRANT SELECT, INSERT ON public.referrals TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION award_points TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_tier TO authenticated;

COMMENT ON TABLE public.user_profiles IS 'Extended user profile data for rewards system';
COMMENT ON TABLE public.partners IS 'Partner businesses offering rewards';
COMMENT ON TABLE public.receipts IS 'User-uploaded receipts for point earning';
COMMENT ON TABLE public.perks IS 'Available rewards that users can redeem';
COMMENT ON TABLE public.perk_redemptions IS 'Record of redeemed perks';
COMMENT ON TABLE public.points_transactions IS 'Ledger of all points movements';
COMMENT ON TABLE public.referrals IS 'Referral tracking for bonus points';


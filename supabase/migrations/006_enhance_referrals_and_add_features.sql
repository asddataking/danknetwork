-- Migration: Enhance Referrals System & Add New Features
-- This migration enhances the referral system and adds new feature tables

-- =============================================
-- ENHANCE REFERRALS TABLE
-- =============================================

-- Add referral type and business referral support
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS referral_type TEXT DEFAULT 'user_signup' 
  CHECK (referral_type IN ('user_signup', 'business_signup', 'premium_upgrade'));

ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;

ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_referrals_type ON public.referrals(referral_type);
CREATE INDEX IF NOT EXISTS idx_referrals_business ON public.referrals(business_id);

-- Add user referral codes table
CREATE TABLE IF NOT EXISTS public.user_referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  total_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_referral_codes_user ON public.user_referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_code ON public.user_referral_codes(code);

-- =============================================
-- DEAL COLLECTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.deal_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deal_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.deal_collections(id) ON DELETE CASCADE,
  deal_id UUID, -- Reference to deals table (if exists) or store deal data
  deal_data JSONB, -- Store deal information
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON public.deal_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_share_code ON public.deal_collections(share_code);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.deal_collection_items(collection_id);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'receipt_approved', 'receipt_rejected', 'points_awarded', 
    'deal_alert', 'referral_reward', 'perk_available', 
    'friend_activity', 'system_announcement', 'collection_updated'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- =============================================
-- POINTS MARKETPLACE (TRANSFERS)
-- =============================================

CREATE TABLE IF NOT EXISTS public.points_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('transfer', 'gift', 'pool')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rejected')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfers_from ON public.points_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON public.points_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.points_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_created ON public.points_transfers(created_at DESC);

-- =============================================
-- ENHANCE PARTNERS TABLE
-- =============================================

-- Add application status for partner onboarding
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'active' 
  CHECK (application_status IN ('pending', 'approved', 'rejected', 'active', 'suspended'));

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS application_data JSONB; -- Store full application data

CREATE INDEX IF NOT EXISTS idx_partners_application_status ON public.partners(application_status);

-- =============================================
-- UPDATE POINTS TRANSACTIONS
-- =============================================

-- Add new transaction types for transfers
ALTER TABLE public.points_transactions 
DROP CONSTRAINT IF EXISTS points_transactions_transaction_type_check;

ALTER TABLE public.points_transactions 
ADD CONSTRAINT points_transactions_transaction_type_check 
CHECK (transaction_type IN ('earned', 'spent', 'refund', 'burn', 'bonus', 'adjustment', 'transfer_sent', 'transfer_received'));

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on new tables
ALTER TABLE public.user_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transfers ENABLE ROW LEVEL SECURITY;

-- User Referral Codes: Users can view and manage their own
CREATE POLICY "Users can view own referral codes" ON public.user_referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes" ON public.user_referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes" ON public.user_referral_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Deal Collections: Users can view their own and public ones
CREATE POLICY "Users can view own collections" ON public.deal_collections
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own collections" ON public.deal_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.deal_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.deal_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Deal Collection Items: Users can manage items in their collections
CREATE POLICY "Users can view collection items" ON public.deal_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deal_collections 
      WHERE id = deal_collection_items.collection_id 
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can add to own collections" ON public.deal_collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deal_collections 
      WHERE id = deal_collection_items.collection_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove from own collections" ON public.deal_collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.deal_collections 
      WHERE id = deal_collection_items.collection_id 
      AND user_id = auth.uid()
    )
  );

-- Notifications: Users can view and update their own
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Points Transfers: Users can view transfers they sent or received
CREATE POLICY "Users can view own transfers" ON public.points_transfers
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transfers from themselves" ON public.points_transfers
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to burn points (for perk redemptions, transfers)
CREATE OR REPLACE FUNCTION burn_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_source_type TEXT DEFAULT NULL,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction (negative amount)
  INSERT INTO public.points_transactions (
    user_id, amount, transaction_type, reference_id, reference_type, description
  ) VALUES (
    p_user_id, -p_amount, 'burn', p_source_id, p_source_type, p_description
  );
  
  -- Update user profile
  UPDATE public.user_profiles
  SET 
    points = GREATEST(points - p_amount, 0), -- Don't go negative
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: DANK-XXXX (4 random alphanumeric)
    v_code := 'DANK-' || UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || p_user_id::TEXT || NOW()::TEXT),
        1, 4
      )
    );
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.user_referral_codes WHERE code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, message, action_url, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_action_url, p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment referral code uses
CREATE OR REPLACE FUNCTION increment_referral_code_uses(code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_referral_codes
  SET total_uses = total_uses + 1,
      updated_at = NOW()
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, UPDATE ON public.user_referral_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deal_collections TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.deal_collection_items TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.points_transfers TO authenticated;

GRANT EXECUTE ON FUNCTION burn_points TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_user_referral_codes_updated_at BEFORE UPDATE ON public.user_referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_collections_updated_at BEFORE UPDATE ON public.deal_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.user_referral_codes IS 'User-generated referral codes for hybrid referral system';
COMMENT ON TABLE public.deal_collections IS 'User-created collections of deals';
COMMENT ON TABLE public.deal_collection_items IS 'Deals saved in collections';
COMMENT ON TABLE public.notifications IS 'In-app notifications for users';
COMMENT ON TABLE public.points_transfers IS 'P2P points transfers and gifts';


-- Unified Subscription System Migration
-- This creates a single source of truth for premium status across the entire Dank Network app
--
-- Key changes:
-- 1. Create unified subscriptions table that works for both Deals and Rewards
-- 2. Deprecate is_premium and tier fields from user_profiles
-- 3. Link newsletter_subscribers to auth.users for unified identity

-- =============================================
-- SUBSCRIPTIONS TABLE (UNIFIED)
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'network_premium', -- 'network_premium' for $4.20/mo plan
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  
  -- Billing details
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active subscription per user per plan
  UNIQUE(user_id, plan_id, status)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON public.subscriptions(user_id, status) WHERE status = 'active';

-- =============================================
-- UPDATE EXISTING TABLES
-- =============================================

-- Add user_id to newsletter_subscribers to link with auth
-- This allows us to check premium status via subscriptions table
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user ON public.newsletter_subscribers(user_id);

-- Mark old premium fields as deprecated in user_profiles
-- We'll keep them for backward compatibility but add comments
COMMENT ON COLUMN public.user_profiles.is_premium IS 'DEPRECATED: Use subscriptions table instead. Check subscriptions.status = active for plan_id = network_premium';
COMMENT ON COLUMN public.user_profiles.premium_since IS 'DEPRECATED: Use subscriptions.created_at instead';
COMMENT ON COLUMN public.user_profiles.premium_expires_at IS 'DEPRECATED: Use subscriptions.current_period_end instead';
COMMENT ON COLUMN public.user_profiles.stripe_customer_id IS 'DEPRECATED: Use subscriptions.stripe_customer_id instead';
COMMENT ON COLUMN public.user_profiles.stripe_subscription_id IS 'DEPRECATED: Use subscriptions.stripe_subscription_id instead';

-- Mark tier field as deprecated in newsletter_subscribers
COMMENT ON COLUMN public.newsletter_subscribers.tier IS 'DEPRECATED: Premium status is now derived from subscriptions table. Keep for legacy email filtering.';

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user has active premium subscription
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
    AND plan_id = 'network_premium'
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_id TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan_id,
    s.status,
    s.current_period_end,
    s.cancel_at_period_end
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  AND s.plan_id = 'network_premium'
  AND s.status IN ('active', 'trialing', 'past_due')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update subscription status (called by webhooks)
CREATE OR REPLACE FUNCTION upsert_subscription(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
BEGIN
  -- Upsert subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    'network_premium',
    p_status,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end,
    NOW(),
    NOW()
  )
  ON CONFLICT (stripe_subscription_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_premium TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_subscription TO service_role;

-- =============================================
-- DATA MIGRATION (Optional)
-- =============================================

-- Migrate existing premium users from user_profiles to subscriptions
-- Only migrate users who have is_premium = true AND have a stripe_subscription_id
INSERT INTO public.subscriptions (
  user_id,
  plan_id,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_end,
  created_at,
  updated_at
)
SELECT 
  id as user_id,
  'network_premium' as plan_id,
  'active' as status,
  stripe_customer_id,
  stripe_subscription_id,
  premium_expires_at as current_period_end,
  premium_since as created_at,
  NOW() as updated_at
FROM public.user_profiles
WHERE is_premium = true 
  AND stripe_subscription_id IS NOT NULL
ON CONFLICT (stripe_subscription_id) DO NOTHING;

-- Log migration results
DO $$
DECLARE
  v_migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_migrated_count FROM public.subscriptions;
  RAISE NOTICE 'Migrated % premium subscriptions to unified subscriptions table', v_migrated_count;
END $$;

COMMENT ON TABLE public.subscriptions IS 'Unified subscription management for all Dank Network premium features. Single source of truth for premium status.';
COMMENT ON FUNCTION is_user_premium IS 'Check if a user has an active premium subscription (network_premium plan)';
COMMENT ON FUNCTION get_user_subscription IS 'Get user''s active subscription details';
COMMENT ON FUNCTION upsert_subscription IS 'Create or update a subscription. Used by Stripe webhooks.';


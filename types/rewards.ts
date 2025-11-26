// DankPass Rewards System Types

export interface UserProfile {
  id: string;
  display_name: string | null;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  is_premium: boolean;
  premium_since: string | null;
  premium_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  total_points_earned: number;
  total_spent: number;
  receipts_uploaded: number;
  perks_redeemed: number;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  business_name: string;
  business_type: 'dispensary' | 'restaurant' | 'retail' | 'other';
  description: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  points_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  partner_id: string | null;
  partner?: Partner;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  total: number | null;
  merchant_name: string | null;
  purchase_date: string | null;
  points_awarded: number;
  points_multiplier: number;
  rejection_reason: string | null;
  parsed_data: any;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface Perk {
  id: string;
  partner_id: string | null;
  partner?: Partner;
  title: string;
  description: string | null;
  points_cost: number;
  is_premium_only: boolean;
  category: 'dispensary' | 'restaurant' | 'retail' | 'travel' | 'special' | 'other';
  image_url: string | null;
  terms_and_conditions: string | null;
  redemption_instructions: string | null;
  is_active: boolean;
  stock_quantity: number | null;
  redeemed_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PerkRedemption {
  id: string;
  user_id: string;
  perk_id: string;
  perk?: Perk;
  points_spent: number;
  status: 'active' | 'used' | 'expired' | 'refunded';
  redemption_code: string | null;
  redeemed_at: string;
  used_at: string | null;
  expires_at: string | null;
  refund_reason: string | null;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'refund' | 'bonus' | 'adjustment';
  reference_id: string | null;
  reference_type: 'receipt' | 'perk' | 'promotion' | 'admin' | 'other' | null;
  description: string | null;
  metadata: any;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  referrer_points_awarded: number;
  referee_points_awarded: number;
  completed_at: string | null;
  created_at: string;
}


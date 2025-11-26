/**
 * Subscriber Management Helper
 * 
 * Functions for creating and managing newsletter subscribers
 */

import { getDealsClient } from './supabase';
import { getZipGroup } from './zip-groups';

interface CreateSubscriberParams {
  email: string;
  zipCode: string;
  tier: 'free' | 'premium';
  userId?: string;
}

interface CreateSubscriberResult {
  success: boolean;
  error?: string;
  subscriber?: {
    id: string;
    email: string;
    zip: string;
    zip_group: string | null;
    tier: string;
    created_at: string;
  };
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates ZIP code format (5 digits)
 */
function isValidZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

/**
 * Create or update a subscriber in the database
 * 
 * @param email - Subscriber email address
 * @param zipCode - 5-digit ZIP code
 * @param tier - Subscription tier ('free' or 'premium')
 * @returns Result object with success status and subscriber data
 */
export async function createSubscriber({
  email,
  zipCode,
  tier,
}: CreateSubscriberParams): Promise<CreateSubscriberResult> {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedZip = zipCode.trim();

    // Validate inputs
    if (!isValidEmail(normalizedEmail)) {
      return {
        success: false,
        error: 'Invalid email address format',
      };
    }

    if (!isValidZipCode(normalizedZip)) {
      return {
        success: false,
        error: 'ZIP code must be 5 digits',
      };
    }

    if (!['free', 'premium'].includes(tier)) {
      return {
        success: false,
        error: 'Tier must be either "free" or "premium"',
      };
    }

    // Get ZIP group for area targeting
    const zipGroup = getZipGroup(normalizedZip);

    // Get Supabase client
    const supabase = getDealsClient();

    // Upsert subscriber (insert or update if exists)
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          zip: normalizedZip,
          zip_group: zipGroup,
          tier,
          user_id: userId || null,
        },
        {
          onConflict: 'email',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[Subscriber] Error saving subscriber:', error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    console.log('[Subscriber] Successfully saved subscriber:', {
      email: normalizedEmail,
      zip: normalizedZip,
      zipGroup,
      tier,
    });

    return {
      success: true,
      subscriber: data,
    };
  } catch (error) {
    console.error('[Subscriber] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a subscriber exists
 */
export async function subscriberExists(email: string): Promise<boolean> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getDealsClient();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('[Subscriber] Error checking subscriber:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('[Subscriber] Unexpected error:', error);
    return false;
  }
}

/**
 * Update subscriber tier
 */
export async function updateSubscriberTier(
  email: string,
  tier: 'free' | 'premium'
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getDealsClient();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ tier })
      .eq('email', normalizedEmail);

    if (error) {
      console.error('[Subscriber] Error updating tier:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[Subscriber] Updated tier:', { email: normalizedEmail, tier });
    return { success: true };
  } catch (error) {
    console.error('[Subscriber] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


// Supabase Edge Function: generate-newsletters
// This function generates markdown content and publishes to Substack
// Substack handles all subscriber management and email delivery

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's deals
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('*, dispensaries(name, zip)')
      .gte('fetched_at', today.toISOString())
      .order('value_score', { ascending: false });

    if (dealsError) throw dealsError;

    const results = [];

    // Check if it's Monday (for weekly free tier newsletter)
    const isMonday = today.getDay() === 1;

    // Generate weekly summary for free tier (only on Mondays)
    if (isMonday) {
      const weeklyMarkdown = generateWeeklySummary(deals || []);
      const weeklyResult = await publishToSubstack({
        title: `Deals of the Week - ${formatDate(today)}`,
        body: weeklyMarkdown,
        tier: 'free',
      });

      results.push({
        type: 'weekly_summary',
        success: true,
        substackPostId: weeklyResult.id,
      });
    }

    // Generate daily newsletters grouped by preferences (Option B)
    const zipGroups = await getZipGroups();
    
    // Get all premium subscribers with preferences
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, zip, zip_group, tier')
      .eq('tier', 'premium')
      .not('zip_group', 'is', null);

    if (subError) {
      console.error('Error fetching subscribers:', subError);
    }

    // Get preferences for all subscribers
    const subscriberEmails = (subscribers || []).map(s => s.email);
    const { data: allPreferences } = await supabase
      .from('user_preferences')
      .select('*')
      .in('email', subscriberEmails);

    // Create preference map
    const preferencesMap = new Map<string, any>();
    (allPreferences || []).forEach(pref => {
      preferencesMap.set(pref.email, pref);
    });

    // Group subscribers by preference signature (similar preferences)
    const preferenceGroups = new Map<string, { subscribers: any[], preferences: any }>();

    for (const subscriber of subscribers || []) {
      const prefs = preferencesMap.get(subscriber.email) || getDefaultPreferences();
      const signature = getPreferenceSignature(prefs, subscriber.zip_group);
      
      if (!preferenceGroups.has(signature)) {
        preferenceGroups.set(signature, {
          subscribers: [],
          preferences: prefs,
        });
      }
      preferenceGroups.get(signature)!.subscribers.push(subscriber);
    }

    // Generate newsletter for each preference group
    for (const [signature, group] of preferenceGroups.entries()) {
      // Get deals for ZIP groups in this preference group
      const zipGroupsInGroup = new Set(
        group.subscribers.map(s => s.zip_group).filter(Boolean)
      );

      let filteredDeals: any[] = [];

      // Collect deals from all ZIP groups in this preference group
      for (const zipGroup of zipGroupsInGroup) {
        const groupDeals = (deals || []).filter(deal => {
          const dealZipGroup = getZipGroupForZip(deal.zip, zipGroups);
          return dealZipGroup === zipGroup;
        });
        filteredDeals.push(...groupDeals);
      }

      // Apply preference filters
      filteredDeals = filterDealsByPreferences(filteredDeals, group.preferences);

      if (filteredDeals.length === 0) continue;

      // Sort by value score
      filteredDeals.sort((a, b) => b.value_score - a.value_score);

      // Get primary ZIP group name (most common in this preference group)
      const primaryZipGroup = getMostCommonZipGroup(group.subscribers);
      const groupName = zipGroups[primaryZipGroup]?.name || 'Michigan';

      const markdown = generatePersonalizedNewsletter(
        filteredDeals,
        groupName,
        group.preferences
      );

      const publishResult = await publishToSubstack({
        title: `🔥 Personalized Deals in ${groupName} - ${formatDate(today)}`,
        body: markdown,
        tier: 'premium',
      });

      results.push({
        preferenceGroup: signature,
        zipGroup: primaryZipGroup,
        subscribersCount: group.subscribers.length,
        dealsCount: filteredDeals.length,
        success: true,
        substackPostId: publishResult.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        newslettersGenerated: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions
async function getZipGroups(): Promise<Record<string, any>> {
  // ZIP groups configuration
  // This matches the zip-groups.json file structure
  return {
    detroit_city: {
      name: 'Detroit City',
      zips: ['48201', '48202', '48203', '48204', '48205', '48206', '48207', '48208', '48209', '48210', '48211', '48212', '48213', '48214', '48215', '48216', '48217', '48218', '48219', '48220', '48221', '48222', '48223', '48224', '48225', '48226', '48227', '48228', '48229', '48230', '48231', '48232', '48233', '48234', '48235', '48236', '48237', '48238', '48239', '48240', '48242', '48243'],
    },
    southfield_ferndale: {
      name: 'Southfield / Ferndale',
      zips: ['48033', '48034', '48035', '48036', '48037', '48038', '48075', '48076', '48083', '48084', '48085', '48086'],
    },
    troy_rochester: {
      name: 'Troy / Rochester',
      zips: ['48083', '48084', '48085', '48098', '48307', '48308', '48309', '48310', '48312', '48313', '48314', '48315', '48316', '48317', '48318', '48320', '48321', '48322', '48323', '48324', '48325', '48326', '48327', '48328', '48329', '48330', '48331', '48334', '48335', '48336', '48340', '48341', '48342', '48343', '48346', '48348', '48350', '48356', '48357', '48359', '48360', '48361', '48362', '48363', '48367', '48370', '48371', '48374', '48375', '48376', '48377', '48380', '48381', '48382', '48383', '48386', '48390', '48393'],
    },
    warren_st_clair_shores: {
      name: 'Warren / St. Clair Shores',
      zips: ['48080', '48081', '48082', '48083', '48088', '48089', '48090', '48091', '48092', '48093', '48094', '48095', '48096', '48097', '48098', '48099'],
    },
    livonia_westland: {
      name: 'Livonia / Westland',
      zips: ['48150', '48151', '48152', '48153', '48154', '48174', '48185', '48186', '48187', '48188', '48189', '48190', '48191', '48192', '48193', '48195'],
    },
    dearborn_dearborn_heights: {
      name: 'Dearborn / Dearborn Heights',
      zips: ['48120', '48121', '48122', '48123', '48124', '48125', '48126', '48127', '48128'],
    },
    ann_arbor: {
      name: 'Ann Arbor',
      zips: ['48103', '48104', '48105', '48106', '48107', '48108', '48109', '48113'],
    },
    grand_rapids: {
      name: 'Grand Rapids',
      zips: ['49501', '49502', '49503', '49504', '49505', '49506', '49507', '49508', '49509', '49510', '49512', '49514', '49515', '49516', '49518', '49519', '49525', '49534', '49544', '49546', '49548'],
    },
    lansing: {
      name: 'Lansing',
      zips: ['48901', '48906', '48910', '48911', '48912', '48915', '48917', '48919', '48924', '48933'],
    },
    kalamazoo: {
      name: 'Kalamazoo',
      zips: ['49001', '49002', '49003', '49004', '49005', '49006', '49007', '49008', '49009', '49048'],
    },
    flint: {
      name: 'Flint',
      zips: ['48501', '48502', '48503', '48504', '48505', '48506', '48507', '48519', '48529', '48532'],
    },
    saginaw: {
      name: 'Saginaw',
      zips: ['48601', '48602', '48603', '48604', '48605', '48607', '48609', '48638'],
    },
    muskegon: {
      name: 'Muskegon',
      zips: ['49440', '49441', '49442', '49443', '49444', '49445'],
    },
    traverse_city: {
      name: 'Traverse City',
      zips: ['49684', '49685', '49686', '49696'],
    },
  };
}

function getZipGroupForZip(zip: string, zipGroups: Record<string, any>): string | null {
  for (const [key, data] of Object.entries(zipGroups)) {
    if (data.zips.includes(zip)) {
      return key;
    }
  }
  return 'other';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function generateWeeklySummary(deals: any[]): string {
  const topDeals = deals.slice(0, 15);
  let markdown = `# Deals of the Week\n\n`;
  markdown += `**Week of ${formatDate(new Date())}**\n\n`;
  markdown += `Here are the best dispensary deals across Michigan this week, ranked by THC-per-dollar value.\n\n---\n\n`;

  // Group by product type
  const byType: Record<string, any[]> = {};
  for (const deal of topDeals) {
    const type = deal.product_type || 'other';
    if (!byType[type]) byType[type] = [];
    byType[type].push(deal);
  }

  const typeOrder = ['flower', 'cart', 'edible', 'concentrate', 'topical', 'other'];
  const emojis: Record<string, string> = {
    flower: '🌿',
    cart: '💨',
    edible: '🍪',
    concentrate: '💎',
    topical: '🧴',
    other: '📦',
  };

  for (const type of typeOrder) {
    if (!byType[type] || byType[type].length === 0) continue;

    const typeDeals = byType[type].slice(0, 5); // Top 5 per type for weekly
    const emoji = emojis[type] || '📦';
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    markdown += `## ${emoji} ${typeName}\n\n`;

    typeDeals.forEach((deal, idx) => {
      const dispensaryName = deal.dispensaries?.name || 'Unknown';
      const thc = deal.thc_percent ? `${deal.thc_percent}%` : 'N/A';
      const weight = deal.weight_grams ? `${deal.weight_grams}g` : 'N/A';
      const valueScore = deal.value_score.toFixed(2);
      const label = deal.deal_label || 'MID';
      const labelEmoji = label === 'STEAL' ? '🔥' : label === 'SOLID' ? '✅' : '';

      markdown += `### ${idx + 1}. ${deal.product_name} - ${dispensaryName}\n`;
      markdown += `- **Price:** $${deal.price_usd} | **THC:** ${thc} | **Weight:** ${weight}\n`;
      markdown += `- **Value Score:** ${valueScore} mg/$ (${label} ${labelEmoji})\n`;
      markdown += `- **Location:** ${deal.zip}\n\n`;
    });
  }

  markdown += `---\n\n`;
  markdown += `💎 Want daily personalized deals? [Upgrade to Premium for $7/month]\n\n`;
  markdown += `**Want to unsubscribe?** [Manage preferences]\n`;

  return markdown;
}

function generateGroupNewsletter(deals: any[], groupName: string): string {
  const topDeals = deals.slice(0, 10);
  let markdown = `# Daily Dispo Deals - ${groupName}\n\n`;
  markdown += `**${formatDate(new Date())}**\n\n`;
  markdown += `Here are today's best dispensary deals in ${groupName}, ranked by THC-per-dollar value.\n\n---\n\n`;

  // Group by product type
  const byType: Record<string, any[]> = {};
  for (const deal of topDeals) {
    const type = deal.product_type || 'other';
    if (!byType[type]) byType[type] = [];
    byType[type].push(deal);
  }

  const typeOrder = ['flower', 'cart', 'edible', 'concentrate', 'topical', 'other'];
  const emojis: Record<string, string> = {
    flower: '🌿',
    cart: '💨',
    edible: '🍪',
    concentrate: '💎',
    topical: '🧴',
    other: '📦',
  };

  for (const type of typeOrder) {
    if (!byType[type] || byType[type].length === 0) continue;

    const typeDeals = byType[type];
    const emoji = emojis[type] || '📦';
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    markdown += `## ${emoji} ${typeName}\n\n`;

    typeDeals.forEach((deal, idx) => {
      const dispensaryName = deal.dispensaries?.name || 'Unknown';
      const thc = deal.thc_percent ? `${deal.thc_percent}%` : 'N/A';
      const weight = deal.weight_grams ? `${deal.weight_grams}g` : 'N/A';
      const valueScore = deal.value_score.toFixed(2);
      const label = deal.deal_label || 'MID';
      const labelEmoji = label === 'STEAL' ? '🔥' : label === 'SOLID' ? '✅' : '';

      markdown += `### ${idx + 1}. ${deal.product_name} - ${dispensaryName}\n`;
      markdown += `- **Price:** $${deal.price_usd} | **THC:** ${thc} | **Weight:** ${weight}\n`;
      markdown += `- **Value Score:** ${valueScore} mg/$ (${label} ${labelEmoji})\n`;
      markdown += `- **Location:** ${deal.zip}\n\n`;
    });
  }

  markdown += `---\n\n`;
  markdown += `**Not seeing your area?** [Upgrade to Premium] for ZIP group-specific daily deals.\n\n`;
  markdown += `**Want to unsubscribe?** [Manage preferences]\n`;

  return markdown;
}

// Filter deals based on user preferences
function filterDealsByPreferences(deals: any[], preferences: any): any[] {
  let filtered = [...deals];

  // Filter by product type
  if (preferences.preferred_product_types && preferences.preferred_product_types.length > 0) {
    filtered = filtered.filter(deal =>
      preferences.preferred_product_types.includes(deal.product_type)
    );
  }

  // Filter by brand
  if (preferences.preferred_brands && preferences.preferred_brands.length > 0) {
    filtered = filtered.filter(deal =>
      deal.brand && preferences.preferred_brands.includes(deal.brand.toLowerCase())
    );
  }

  // Filter by THC range
  if (preferences.min_thc_percent) {
    filtered = filtered.filter(deal =>
      deal.thc_percent && deal.thc_percent >= preferences.min_thc_percent
    );
  }
  if (preferences.max_thc_percent) {
    filtered = filtered.filter(deal =>
      deal.thc_percent && deal.thc_percent <= preferences.max_thc_percent
    );
  }

  // Filter by best quantity (value score threshold)
  if (preferences.filter_by_best_quantity) {
    const threshold = preferences.min_value_score || 15; // Default threshold
    filtered = filtered.filter(deal =>
      deal.value_score >= threshold
    );
  }

  return filtered;
}

// Get preference signature for grouping
function getPreferenceSignature(preferences: any, zipGroup: string): string {
  const parts = [
    zipGroup || 'all',
    (preferences.preferred_product_types || []).sort().join(','),
    (preferences.preferred_brands || []).sort().join(','),
    preferences.min_thc_percent || 'any',
    preferences.max_thc_percent || 'any',
    preferences.filter_by_best_quantity ? 'best' : 'all',
  ];
  return parts.join('|');
}

// Get default preferences
function getDefaultPreferences(): any {
  return {
    preferred_product_types: null,
    preferred_brands: null,
    min_thc_percent: null,
    max_thc_percent: null,
    filter_by_best_quantity: true,
    min_value_score: 15,
  };
}

// Get most common ZIP group from subscribers
function getMostCommonZipGroup(subscribers: any[]): string {
  const counts = new Map<string, number>();
  subscribers.forEach(s => {
    if (s.zip_group) {
      counts.set(s.zip_group, (counts.get(s.zip_group) || 0) + 1);
    }
  });
  
  let maxCount = 0;
  let mostCommon = 'other';
  counts.forEach((count, zipGroup) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = zipGroup;
    }
  });
  
  return mostCommon;
}

// Generate personalized newsletter
function generatePersonalizedNewsletter(
  deals: any[],
  groupName: string,
  preferences: any
): string {
  const topDeals = deals.slice(0, 10);
  let markdown = `# Personalized Deals - ${groupName}\n\n`;
  markdown += `**${formatDate(new Date())}**\n\n`;

  // Add preference summary
  const prefSummary: string[] = [];
  if (preferences.preferred_product_types?.length > 0) {
    prefSummary.push(`Product types: ${preferences.preferred_product_types.join(', ')}`);
  }
  if (preferences.preferred_brands?.length > 0) {
    prefSummary.push(`Brands: ${preferences.preferred_brands.join(', ')}`);
  }
  if (preferences.min_thc_percent || preferences.max_thc_percent) {
    const range = `${preferences.min_thc_percent || 0}% - ${preferences.max_thc_percent || 100}%`;
    prefSummary.push(`THC range: ${range}`);
  }
  if (preferences.filter_by_best_quantity) {
    prefSummary.push('Best quantity deals only');
  }

  if (prefSummary.length > 0) {
    markdown += `Based on your preferences: ${prefSummary.join(' | ')}\n\n`;
  }

  markdown += `Here are today's best deals matching your preferences, ranked by THC-per-dollar value.\n\n---\n\n`;

  // Group by product type
  const byType: Record<string, any[]> = {};
  for (const deal of topDeals) {
    const type = deal.product_type || 'other';
    if (!byType[type]) byType[type] = [];
    byType[type].push(deal);
  }

  const typeOrder = ['flower', 'cart', 'preroll', 'edible', 'concentrate', 'topical', 'other'];
  const emojis: Record<string, string> = {
    flower: '🌿',
    cart: '💨',
    preroll: '🚬',
    edible: '🍪',
    concentrate: '💎',
    topical: '🧴',
    other: '📦',
  };

  for (const type of typeOrder) {
    if (!byType[type] || byType[type].length === 0) continue;

    const typeDeals = byType[type];
    const emoji = emojis[type] || '📦';
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    markdown += `## ${emoji} ${typeName}\n\n`;

    typeDeals.forEach((deal, idx) => {
      const dispensaryName = deal.dispensaries?.name || 'Unknown';
      const thc = deal.thc_percent ? `${deal.thc_percent}%` : 'N/A';
      const weight = deal.weight_grams ? `${deal.weight_grams}g` : 'N/A';
      const valueScore = deal.value_score.toFixed(2);
      const label = deal.deal_label || 'MID';
      const labelEmoji = label === 'STEAL' ? '🔥' : label === 'SOLID' ? '✅' : '';
      const brand = deal.brand ? ` (${deal.brand})` : '';

      markdown += `### ${idx + 1}. ${deal.product_name}${brand} - ${dispensaryName}\n`;
      markdown += `- **Price:** $${deal.price_usd} | **THC:** ${thc} | **Weight:** ${weight}\n`;
      markdown += `- **Value Score:** ${valueScore} mg/$ (${label} ${labelEmoji})\n`;
      markdown += `- **Location:** ${deal.zip}\n\n`;
    });
  }

  markdown += `---\n\n`;
  markdown += `**Want to update your preferences?** [Manage preferences]\n\n`;
  markdown += `**Want to unsubscribe?** [Manage preferences]\n`;

  return markdown;
}

async function publishToSubstack(post: {
  title: string;
  body: string;
  tier: 'free' | 'premium';
}): Promise<{ id: string }> {
  const substackApiKey = Deno.env.get('SUBSTACK_API_KEY');
  const substackPublicationId = Deno.env.get('SUBSTACK_PUBLICATION_ID');

  if (!substackApiKey || !substackPublicationId) {
    throw new Error('Substack API not configured');
  }

  const response = await fetch('https://substack.com/api/v1/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${substackApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publication_id: substackPublicationId,
      title: post.title,
      body: post.body,
      send: true, // Auto-send
    }),
  });

  if (!response.ok) {
    throw new Error(`Substack API error: ${response.statusText}`);
  }

  return await response.json();
}


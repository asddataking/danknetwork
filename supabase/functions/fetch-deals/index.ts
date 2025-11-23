// Supabase Edge Function: fetch-deals
// This function fetches deals from all active dispensaries daily

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active dispensaries
    const { data: dispensaries, error: dispError } = await supabase
      .from('dispensaries')
      .select('*')
      .eq('is_active', true);

    if (dispError) throw dispError;

    console.log(`Processing ${dispensaries?.length || 0} dispensaries`);

    const results = [];

    // Process each dispensary
    for (const dispensary of dispensaries || []) {
      try {
        console.log(`Processing ${dispensary.name}...`);

        // Fetch deals based on platform type
        let deals: any[] = [];

        switch (dispensary.platform_type) {
          case 'json_api':
            deals = await fetchJsonApi(dispensary);
            break;
          case 'html_scrape':
            deals = await fetchHtmlScrape(dispensary);
            break;
          case 'weedmaps_pdf':
            deals = await fetchWeedmapsPDF(dispensary);
            break;
          case 'html_ai':
            deals = await fetchHtmlAI(dispensary);
            break;
          default:
            console.warn(`Unknown platform type: ${dispensary.platform_type}`);
        }

        // Calculate value scores and labels
        const processedDeals = deals.map((deal) => {
          const valueScore = calculateValueScore(
            deal.thcPercent,
            deal.weightGrams,
            deal.priceUSD
          );
          const dealLabel = getDealLabel(valueScore, deal.productType);

          return {
            dispensary_id: dispensary.id,
            product_name: deal.productName,
            product_type: deal.productType,
            brand: deal.brand || null,
            thc_percent: deal.thcPercent,
            weight_grams: deal.weightGrams,
            price_usd: deal.priceUSD,
            zip: dispensary.zip,
            deal_label: dealLabel,
            raw_data: deal.rawData || {},
          };
        });

        // Store deals in database
        if (processedDeals.length > 0) {
          const { error: insertError } = await supabase
            .from('deals')
            .upsert(processedDeals, {
              onConflict: 'dispensary_id,product_name,price_usd,fetched_at',
            });

          if (insertError) throw insertError;

          // Update last_fetched_at
          await supabase
            .from('dispensaries')
            .update({ last_fetched_at: new Date().toISOString() })
            .eq('id', dispensary.id);

          // Log success
          await supabase.from('fetch_logs').insert({
            dispensary_id: dispensary.id,
            status: 'success',
            deals_found: processedDeals.length,
          });

          results.push({
            dispensary: dispensary.name,
            dealsFound: processedDeals.length,
            success: true,
          });
        } else {
          results.push({
            dispensary: dispensary.name,
            dealsFound: 0,
            success: true,
          });
        }
      } catch (error) {
        console.error(`Error processing ${dispensary.name}:`, error);

        // Log error
        await supabase.from('fetch_logs').insert({
          dispensary_id: dispensary.id,
          status: 'error',
          error_message: (error as Error).message,
        });

        results.push({
          dispensary: dispensary.name,
          error: (error as Error).message,
          success: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dispensariesProcessed: results.length,
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

// Import utility functions
import {
  fetchJsonApiDeals,
  fetchHtmlScrapeDeals,
  fetchWeedmapsPDFDeals,
  fetchHtmlAIDeals,
} from './utils.ts';

// Helper functions
async function fetchJsonApi(dispensary: any): Promise<any[]> {
  const config = dispensary.extraction_config || {};
  return fetchJsonApiDeals(dispensary.menu_url, config);
}

async function fetchHtmlScrape(dispensary: any): Promise<any[]> {
  const config = dispensary.extraction_config || {};
  return fetchHtmlScrapeDeals(dispensary.menu_url, config);
}

async function fetchWeedmapsPDF(dispensary: any): Promise<any[]> {
  const config = dispensary.extraction_config || {};
  return fetchWeedmapsPDFDeals(dispensary.menu_url, config);
}

async function fetchHtmlAI(dispensary: any): Promise<any[]> {
  const config = dispensary.extraction_config || {};
  return fetchHtmlAIDeals(dispensary.menu_url, config);
}

function calculateValueScore(
  thcPercent: number | null,
  weightGrams: number | null,
  priceUSD: number
): number {
  if (!priceUSD || priceUSD <= 0) return 0;
  if (!thcPercent || !weightGrams) return 0;

  const mgTHC = weightGrams * 1000 * (thcPercent / 100);
  return mgTHC / priceUSD;
}

function getDealLabel(
  valueScore: number,
  productType: string
): 'STEAL' | 'SOLID' | 'MID' {
  const thresholds: Record<string, { steal: number; solid: number }> = {
    flower: { steal: 20, solid: 15 },
    cart: { steal: 10, solid: 7 },
    edible: { steal: 5, solid: 3 },
    concentrate: { steal: 25, solid: 18 },
    topical: { steal: 3, solid: 2 },
    other: { steal: 15, solid: 10 },
  };

  const thresh = thresholds[productType.toLowerCase()] || thresholds.other;

  if (valueScore >= thresh.steal) return 'STEAL';
  if (valueScore >= thresh.solid) return 'SOLID';
  return 'MID';
}


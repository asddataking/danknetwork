import { NextResponse } from 'next/server';
import { fourthwallClient } from '@/lib/fourthwall';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const shopUrl = process.env.FW_SHOP_URL || '';
    
    if (!shopUrl) {
      return NextResponse.json({
        error: 'FW_SHOP_URL not configured',
        shopUrl: null,
        feedUrl: null,
      }, { status: 500 });
    }

    const cleanShopUrl = shopUrl.replace(/\/$/, '');
    const feedUrl = `${cleanShopUrl}/products.json`;

    // Fetch the raw JSON feed
    let rawData: any = null;
    let fetchError: any = null;
    
    try {
      const response = await fetch(feedUrl, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        fetchError = {
          status: response.status,
          statusText: response.statusText,
          body: await response.text().catch(() => ''),
        };
      } else {
        rawData = await response.json();
      }
    } catch (error: any) {
      fetchError = {
        message: error.message,
        stack: error.stack,
      };
    }

    // Check cache status directly
    let cacheStatus: any = {
      accessible: false,
      totalCount: 0,
      nonExpiredCount: 0,
      expiredCount: 0,
      sampleProducts: [],
      error: null,
    };

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const now = new Date().toISOString();
        
        // Get total count
        const { count: totalCount } = await supabase
          .from('products_cache')
          .select('*', { count: 'exact', head: true });
        
        // Get non-expired count
        const { count: nonExpiredCount } = await supabase
          .from('products_cache')
          .select('*', { count: 'exact', head: true })
          .gt('expires_at', now);
        
        // Get expired count
        const { count: expiredCount } = await supabase
          .from('products_cache')
          .select('*', { count: 'exact', head: true })
          .lte('expires_at', now);
        
        // Get sample products (including expired)
        const { data: sampleData } = await supabase
          .from('products_cache')
          .select('product_id, name, price, category, in_stock, expires_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5);
        
        cacheStatus = {
          accessible: true,
          totalCount: totalCount || 0,
          nonExpiredCount: nonExpiredCount || 0,
          expiredCount: expiredCount || 0,
          sampleProducts: sampleData || [],
        };
      }
    } catch (error: any) {
      cacheStatus.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    // Also try to get products using the client
    let clientProducts: any[] = [];
    let clientError: any = null;
    
    try {
      clientProducts = await fourthwallClient.getProducts({});
    } catch (error: any) {
      clientError = {
        message: error.message,
        stack: error.stack,
      };
    }

    // Test Storefront API directly - try multiple endpoint formats
    const storefrontToken = process.env.FW_STOREFRONT_TOKEN || '';
    const storefrontUrlPatterns = [
      `${cleanShopUrl}/api/storefront/products`,
      `${cleanShopUrl}/storefront/api/products`,
      `https://api.fourthwall.com/storefront/products`,
      `https://api.fourthwall.com/v1/products`,
    ];
    
    let storefrontTest: any = {
      hasToken: !!storefrontToken,
      tokenLength: storefrontToken ? storefrontToken.length : 0,
      attempts: [],
    };

    if (storefrontToken) {
      for (const url of storefrontUrlPatterns) {
        const attempt: any = { url, status: null, error: null, response: null };
        try {
          const storefrontResponse = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${storefrontToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          attempt.status = storefrontResponse.status;
          attempt.statusText = storefrontResponse.statusText;
          
          if (storefrontResponse.ok) {
            const storefrontData = await storefrontResponse.json();
            attempt.response = {
              hasProducts: !!storefrontData?.products,
              isArray: Array.isArray(storefrontData),
              productCount: storefrontData?.products?.length || (Array.isArray(storefrontData) ? storefrontData.length : 0),
              topLevelKeys: storefrontData ? Object.keys(storefrontData) : [],
            };
            storefrontTest.successfulUrl = url;
            break; // Found working endpoint
          } else {
            const errorText = await storefrontResponse.text().catch(() => '');
            attempt.error = {
              status: storefrontResponse.status,
              statusText: storefrontResponse.statusText,
              body: errorText.substring(0, 200), // Limit error text length
            };
          }
        } catch (error: any) {
          attempt.error = {
            message: error.message,
          };
        }
        storefrontTest.attempts.push(attempt);
      }
    }

    return NextResponse.json({
      shopUrl,
      feedUrl,
      rawFeed: {
        data: rawData,
        error: fetchError,
        isArray: Array.isArray(rawData),
        hasProducts: !!rawData?.products,
        productCount: rawData?.products?.length || (Array.isArray(rawData) ? rawData.length : 0),
        topLevelKeys: rawData ? Object.keys(rawData) : [],
        firstProductKeys: rawData?.products?.[0] ? Object.keys(rawData.products[0]) : (Array.isArray(rawData) && rawData[0] ? Object.keys(rawData[0]) : []),
        firstProductSample: rawData?.products?.[0] || (Array.isArray(rawData) ? rawData[0] : null),
      },
      cacheStatus,
      clientProducts: {
        count: clientProducts.length,
        products: clientProducts.slice(0, 3), // First 3 products
        error: clientError,
      },
      storefrontTest,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}


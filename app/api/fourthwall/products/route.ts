import { NextRequest, NextResponse } from 'next/server';
import { fourthwallClient } from '@/lib/fourthwall';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : undefined;
    const featured = searchParams.get('featured') === 'true';

    console.log('[Products API] Fetching products with options:', { category, limit, featured });
    console.log('[Products API] Using JSON feed implementation (not Storefront API)');
    console.log('[Products API] FW_SHOP_URL env var:', process.env.FW_SHOP_URL ? 'SET' : 'NOT SET');

    const startTime = Date.now();
    const products = await fourthwallClient.getProducts({
      category,
      limit,
      featured,
    });
    const fetchTime = Date.now() - startTime;

    console.log(`[Products API] Fetched ${products.length} products in ${fetchTime}ms`);
    if (products.length === 0) {
      console.warn('[Products API] WARNING: No products returned');
      console.warn('[Products API] This could mean:');
      console.warn('[Products API] 1. JSON feed is returning 403/404 (check FW_SHOP_URL)');
      console.warn('[Products API] 2. Cache is empty (products need to be fetched successfully at least once)');
      console.warn('[Products API] 3. All feed URL patterns failed');
      console.warn('[Products API] Check server logs above for FourthwallClient errors');
    }

    return NextResponse.json({ 
      products,
      _debug: {
        count: products.length,
        fetchedIn: `${fetchTime}ms`,
        timestamp: new Date().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[Products API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[Products API] Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        errorMessage,
        products: [] 
      },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { fourthwallClient } from '@/lib/fourthwall';

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
      clientProducts: {
        count: clientProducts.length,
        products: clientProducts.slice(0, 3), // First 3 products
        error: clientError,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}


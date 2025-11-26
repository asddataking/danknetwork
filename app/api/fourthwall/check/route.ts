import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      FW_SHOP_URL: {
        isSet: !!process.env.FW_SHOP_URL,
        value: process.env.FW_SHOP_URL || 'NOT SET',
        length: process.env.FW_SHOP_URL?.length || 0,
      },
      FW_STOREFRONT_TOKEN: {
        isSet: !!process.env.FW_STOREFRONT_TOKEN,
        length: process.env.FW_STOREFRONT_TOKEN?.length || 0,
      },
      FW_COLLECTION_SLUG: {
        isSet: !!process.env.FW_COLLECTION_SLUG,
        value: process.env.FW_COLLECTION_SLUG || 'all',
      },
      FW_DONATION_PRODUCT_HANDLE: {
        isSet: !!process.env.FW_DONATION_PRODUCT_HANDLE,
        value: process.env.FW_DONATION_PRODUCT_HANDLE || 'donation',
      },
    },
    feedUrls: [] as any[],
    recommendations: [] as string[],
  };

  // Test feed URLs if shop URL is set
  if (process.env.FW_SHOP_URL) {
    const cleanShopUrl = process.env.FW_SHOP_URL.replace(/\/$/, '');
    const feedUrlPatterns = [
      `${cleanShopUrl}/products.json`,
      `${cleanShopUrl}/collections/all/products.json`,
      `${cleanShopUrl}/api/products.json`,
      `${cleanShopUrl}/feed/products.json`,
    ];

    for (const feedUrl of feedUrlPatterns) {
      const test: any = {
        url: feedUrl,
        status: null,
        error: null,
        accessible: false,
        productCount: 0,
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(feedUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; DankNetwork/1.0)',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        test.status = response.status;
        test.accessible = response.ok;

        if (response.ok) {
          const data = await response.json();
          const productsArray = Array.isArray(data) ? data : (data.products || []);
          test.productCount = productsArray.length;
          test.dataStructure = {
            isArray: Array.isArray(data),
            hasProducts: !!data.products,
            topLevelKeys: Object.keys(data || {}),
          };
        }
      } catch (error: any) {
        test.error = error.message;
      }

      diagnostics.feedUrls.push(test);
    }
  } else {
    diagnostics.recommendations.push('❌ FW_SHOP_URL is not set. Please add it to your Vercel environment variables.');
    diagnostics.recommendations.push('📝 Format: https://your-shop.fourthwall.com');
  }

  // Generate recommendations
  if (diagnostics.environment.FW_SHOP_URL.isSet) {
    const workingFeeds = diagnostics.feedUrls.filter(f => f.accessible && f.productCount > 0);
    if (workingFeeds.length === 0) {
      diagnostics.recommendations.push('❌ No working feed URLs found. Check if your Fourthwall shop is public and has products.');
      diagnostics.recommendations.push('🔍 Try visiting your shop URL directly in a browser to verify it\'s accessible.');
      
      const anyAccessible = diagnostics.feedUrls.some(f => f.accessible);
      if (anyAccessible) {
        diagnostics.recommendations.push('⚠️ Feed is accessible but returned 0 products. Make sure your shop has active products.');
      }
    } else {
      diagnostics.recommendations.push(`✅ Found ${workingFeeds.length} working feed URL(s) with products!`);
      workingFeeds.forEach(f => {
        diagnostics.recommendations.push(`  📦 ${f.url} - ${f.productCount} products`);
      });
    }
  }

  if (!diagnostics.environment.FW_STOREFRONT_TOKEN.isSet) {
    diagnostics.recommendations.push('⚠️ FW_STOREFRONT_TOKEN is not set. This is optional but provides a fallback if the JSON feed fails.');
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


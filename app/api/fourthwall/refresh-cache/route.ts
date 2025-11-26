import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Manual cache refresh endpoint for Fourthwall products
 * Visit this endpoint to force fetch from JSON feed and populate cache
 * 
 * Usage: GET /api/fourthwall/refresh-cache
 */
export async function GET() {
  try {
    const shopUrl = process.env.FW_SHOP_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!shopUrl) {
      return NextResponse.json({
        error: 'FW_SHOP_URL not configured',
        message: 'Please set FW_SHOP_URL environment variable in Vercel',
      }, { status: 500 });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Supabase not configured',
        message: 'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      }, { status: 500 });
    }

    console.log('[Cache Refresh] Starting manual cache refresh...');
    console.log('[Cache Refresh] Shop URL:', shopUrl);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try multiple JSON feed URL patterns
    const cleanShopUrl = shopUrl.replace(/\/$/, '');
    const feedUrlPatterns = [
      `${cleanShopUrl}/products.json`,
      `${cleanShopUrl}/collections/all/products.json`,
      `${cleanShopUrl}/api/products.json`,
      `${cleanShopUrl}/feed/products.json`,
    ];

    let products: any[] = [];
    let successfulUrl: string | null = null;

    for (const feedUrl of feedUrlPatterns) {
      console.log(`[Cache Refresh] Trying: ${feedUrl}`);
      
      try {
        const response = await fetch(feedUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; DankNetwork/1.0)',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const productsArray = Array.isArray(data) ? data : (data.products || []);
          
          if (productsArray.length > 0) {
            products = productsArray;
            successfulUrl = feedUrl;
            console.log(`[Cache Refresh] ✓ Success! Found ${products.length} products at ${feedUrl}`);
            break;
          } else {
            console.log(`[Cache Refresh] ✗ Feed returned 0 products at ${feedUrl}`);
          }
        } else {
          console.log(`[Cache Refresh] ✗ ${response.status} ${response.statusText} at ${feedUrl}`);
        }
      } catch (error: any) {
        console.log(`[Cache Refresh] ✗ Error at ${feedUrl}:`, error.message);
      }
    }

    if (products.length === 0) {
      return NextResponse.json({
        error: 'No products found',
        message: 'All JSON feed URLs returned 0 products or failed',
        attemptedUrls: feedUrlPatterns,
        suggestion: 'Check if your Fourthwall shop has published products',
      }, { status: 404 });
    }

    // Transform and save products to cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache

    console.log(`[Cache Refresh] Transforming and caching ${products.length} products...`);

    let savedCount = 0;
    let errors: any[] = [];

    for (const product of products) {
      try {
        // Extract price from variants
        let price = 0;
        if (product.variants && product.variants.length > 0) {
          const variantPrice = product.variants[0].price;
          if (typeof variantPrice === 'string') {
            price = parseFloat(variantPrice) / 100; // Assume cents
          } else if (typeof variantPrice === 'number') {
            price = variantPrice > 1000 ? variantPrice / 100 : variantPrice;
          }
        }

        // Extract images
        let imageUrl = null;
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const img = product.images[0];
          imageUrl = typeof img === 'string' ? img : (img.src || img.url);
        } else if (product.image) {
          imageUrl = typeof product.image === 'string' ? product.image : (product.image.src || product.image.url);
        }

        // Build checkout URL
        const checkoutUrl = product.url || `${shopUrl}/products/${product.handle || product.id}`;

        // Transform to our format
        const transformedProduct = {
          id: product.id?.toString() || product.handle || `product-${savedCount}`,
          title: product.title || product.name || 'Untitled Product',
          handle: product.handle || product.id?.toString() || '',
          price,
          compareAtPrice: product.variants?.[0]?.compare_at_price 
            ? (typeof product.variants[0].compare_at_price === 'string' 
                ? parseFloat(product.variants[0].compare_at_price) / 100 
                : product.variants[0].compare_at_price / 100)
            : undefined,
          images: imageUrl ? [imageUrl] : [],
          available: product.variants?.some((v: any) => v.available !== false) !== false,
          variants: (product.variants || []).map((v: any) => ({
            id: v.id?.toString() || '',
            title: v.title || 'Default',
            price: typeof v.price === 'number' ? (v.price > 1000 ? v.price / 100 : v.price) : parseFloat(v.price || 0) / 100,
            available: v.available !== false,
          })),
          checkoutUrl,
          collection: product.collection || product.product_type || 'General',
          description: product.body_html || product.description || '',
          tags: Array.isArray(product.tags) ? product.tags : (typeof product.tags === 'string' ? product.tags.split(',') : []),
        };

        // Save to cache
        const { error } = await supabase
          .from('products_cache')
          .upsert({
            product_id: transformedProduct.id,
            name: transformedProduct.title,
            description: transformedProduct.description,
            price: transformedProduct.price,
            currency: 'USD',
            image_url: imageUrl,
            category: transformedProduct.collection,
            in_stock: transformedProduct.available,
            checkout_url: transformedProduct.checkoutUrl,
            raw_data: transformedProduct,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_id',
          });

        if (error) {
          errors.push({ product: transformedProduct.id, error: error.message });
          console.error(`[Cache Refresh] Error saving product ${transformedProduct.id}:`, error);
        } else {
          savedCount++;
        }
      } catch (error: any) {
        errors.push({ product: product.id || product.handle, error: error.message });
        console.error('[Cache Refresh] Error transforming product:', error);
      }
    }

    console.log(`[Cache Refresh] ✓ Successfully cached ${savedCount} / ${products.length} products`);

    return NextResponse.json({
      success: true,
      message: `Successfully cached ${savedCount} products from Fourthwall JSON feed`,
      feedUrl: successfulUrl,
      totalProducts: products.length,
      savedProducts: savedCount,
      failedProducts: errors.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : [], // Show first 5 errors
      expiresAt: expiresAt.toISOString(),
      expiresIn: '1 hour',
      sampleProducts: products.slice(0, 3).map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        hasVariants: !!p.variants?.length,
        hasImages: !!p.images?.length,
      })),
    });

  } catch (error: any) {
    console.error('[Cache Refresh] Unexpected error:', error);
    return NextResponse.json({
      error: 'Cache refresh failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}


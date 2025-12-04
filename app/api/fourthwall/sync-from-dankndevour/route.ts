import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Sync products from www.dankndevour.com API response
 * This extracts real products and caches them in Supabase
 * 
 * Usage: GET /api/fourthwall/sync-from-dankndevour
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.supabase_url;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.supabase_anon_key;
    const shopUrl = process.env.FW_SHOP_URL || 'https://dankndevour-shop.fourthwall.com';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Supabase not configured',
        message: 'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      }, { status: 500 });
    }

    console.log('[Sync] Fetching products from www.dankndevour.com...');
    
    // Fetch products from www.dankndevour.com API
    const response = await fetch('https://www.dankndevour.com/api/fourthwall/products', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch from dankndevour.com',
        status: response.status,
        statusText: response.statusText,
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Handle both formats: direct array or {products: [...]}
    const productsArray = Array.isArray(data) ? data : (data.products || []);
    
    if (productsArray.length === 0) {
      return NextResponse.json({
        error: 'No products found',
        message: 'www.dankndevour.com returned 0 products',
      }, { status: 404 });
    }

    console.log(`[Sync] Found ${productsArray.length} products from dankndevour.com`);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache

    let savedCount = 0;
    const errors: any[] = [];

    for (const product of productsArray) {
      try {
        // Transform product to our cache format
        // Handle both formats: {name, image, inStock} and {title, images, available}
        const productId = product.id || product.product_id || `product-${savedCount}`;
        const productName = product.name || product.title || 'Untitled Product';
        const productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
        const productImage = product.image || (product.images && product.images[0]) || null;
        const productDescription = product.description || '';
        const productCategory = product.category || 'General';
        const inStock = product.inStock !== false && product.available !== false;
        const checkoutUrl = product.checkoutUrl || `${shopUrl}/products/${product.handle || product.id}`;

        // Build raw_data in our standard format
        const rawData = {
          id: productId,
          title: productName,
          handle: product.handle || product.id?.toString() || '',
          price: productPrice,
          images: productImage ? [productImage] : [],
          available: inStock,
          variants: product.variants || [],
          checkoutUrl: checkoutUrl,
          collection: productCategory,
          description: productDescription,
          tags: product.tags || [],
        };

        // Save to cache
        const { error } = await supabase
          .from('products_cache')
          .upsert({
            product_id: productId,
            name: productName,
            description: productDescription,
            price: productPrice,
            currency: product.currency || 'USD',
            image_url: productImage,
            category: productCategory,
            in_stock: inStock,
            checkout_url: checkoutUrl,
            raw_data: rawData,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_id',
          });

        if (error) {
          errors.push({ product: productId, error: error.message });
          console.error(`[Sync] Error saving product ${productId}:`, error);
        } else {
          savedCount++;
        }
      } catch (error: any) {
        errors.push({ product: product.id || 'unknown', error: error.message });
        console.error('[Sync] Error transforming product:', error);
      }
    }

    console.log(`[Sync] ✓ Successfully cached ${savedCount} / ${productsArray.length} products`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${savedCount} products from www.dankndevour.com`,
      totalProducts: productsArray.length,
      savedProducts: savedCount,
      failedProducts: errors.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : [],
      expiresAt: expiresAt.toISOString(),
      expiresIn: '1 hour',
    });

  } catch (error: any) {
    console.error('[Sync] Unexpected error:', error);
    return NextResponse.json({
      error: 'Sync failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}


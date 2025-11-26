import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Seed test products for development/testing
 * This populates the cache with fake products so the UI works
 * while debugging the real Fourthwall integration
 * 
 * Usage: GET /api/fourthwall/seed-test-products
 * 
 * ⚠️ FOR TESTING ONLY - Remove before production
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const shopUrl = process.env.FW_SHOP_URL || 'https://dankndevour-shop.fourthwall.com';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Supabase not configured',
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test products
    const testProducts = [
      {
        product_id: 'test-hoodie-1',
        name: 'Dank Network Hoodie',
        description: 'Premium quality hoodie with Dank Network logo. Super soft and comfortable.',
        price: 49.99,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        category: 'Apparel',
        in_stock: true,
        checkout_url: `${shopUrl}/products/dank-network-hoodie`,
        raw_data: {
          id: 'test-hoodie-1',
          title: 'Dank Network Hoodie',
          handle: 'dank-network-hoodie',
          price: 49.99,
          images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
          available: true,
          variants: [
            { id: 'var-1', title: 'Small', price: 49.99, available: true },
            { id: 'var-2', title: 'Medium', price: 49.99, available: true },
            { id: 'var-3', title: 'Large', price: 49.99, available: true },
          ],
          checkoutUrl: `${shopUrl}/products/dank-network-hoodie`,
          collection: 'Apparel',
          description: 'Premium quality hoodie with Dank Network logo. Super soft and comfortable.',
          tags: ['apparel', 'hoodie', 'featured'],
        },
      },
      {
        product_id: 'test-tshirt-1',
        name: 'Dank\'N\'Devour T-Shirt',
        description: 'Classic Dank\'N\'Devour logo tee. 100% cotton, pre-shrunk.',
        price: 24.99,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        category: 'Apparel',
        in_stock: true,
        checkout_url: `${shopUrl}/products/dank-devour-tshirt`,
        raw_data: {
          id: 'test-tshirt-1',
          title: 'Dank\'N\'Devour T-Shirt',
          handle: 'dank-devour-tshirt',
          price: 24.99,
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
          available: true,
          variants: [
            { id: 'var-4', title: 'Small', price: 24.99, available: true },
            { id: 'var-5', title: 'Medium', price: 24.99, available: true },
            { id: 'var-6', title: 'Large', price: 24.99, available: true },
          ],
          checkoutUrl: `${shopUrl}/products/dank-devour-tshirt`,
          collection: 'Apparel',
          description: 'Classic Dank\'N\'Devour logo tee. 100% cotton, pre-shrunk.',
          tags: ['apparel', 'tshirt'],
        },
      },
      {
        product_id: 'test-hat-1',
        name: 'Dank Network Snapback',
        description: 'Adjustable snapback hat with embroidered logo. One size fits most.',
        price: 29.99,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
        category: 'Accessories',
        in_stock: true,
        checkout_url: `${shopUrl}/products/dank-network-snapback`,
        raw_data: {
          id: 'test-hat-1',
          title: 'Dank Network Snapback',
          handle: 'dank-network-snapback',
          price: 29.99,
          images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500'],
          available: true,
          variants: [
            { id: 'var-7', title: 'One Size', price: 29.99, available: true },
          ],
          checkoutUrl: `${shopUrl}/products/dank-network-snapback`,
          collection: 'Accessories',
          description: 'Adjustable snapback hat with embroidered logo. One size fits most.',
          tags: ['accessories', 'hat', 'featured'],
        },
      },
      {
        product_id: 'test-sticker-1',
        name: 'Dank Network Sticker Pack',
        description: 'Set of 5 vinyl stickers featuring Dank Network logos and designs.',
        price: 9.99,
        currency: 'USD',
        image_url: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500',
        category: 'Accessories',
        in_stock: true,
        checkout_url: `${shopUrl}/products/dank-network-sticker-pack`,
        raw_data: {
          id: 'test-sticker-1',
          title: 'Dank Network Sticker Pack',
          handle: 'dank-network-sticker-pack',
          price: 9.99,
          images: ['https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500'],
          available: true,
          variants: [
            { id: 'var-8', title: 'Default', price: 9.99, available: true },
          ],
          checkoutUrl: `${shopUrl}/products/dank-network-sticker-pack`,
          collection: 'Accessories',
          description: 'Set of 5 vinyl stickers featuring Dank Network logos and designs.',
          tags: ['accessories', 'stickers'],
        },
      },
    ];

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    console.log('[Test Seed] Seeding', testProducts.length, 'test products...');

    let savedCount = 0;
    const errors: any[] = [];

    for (const product of testProducts) {
      const { error } = await supabase
        .from('products_cache')
        .upsert({
          ...product,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'product_id',
        });

      if (error) {
        errors.push({ product: product.product_id, error: error.message });
        console.error(`[Test Seed] Error saving ${product.product_id}:`, error);
      } else {
        savedCount++;
      }
    }

    console.log(`[Test Seed] ✓ Seeded ${savedCount} test products`);

    return NextResponse.json({
      success: true,
      message: `✓ Seeded ${savedCount} test products for development`,
      warning: '⚠️ These are test products with placeholder images. Replace with real Fourthwall data.',
      savedProducts: savedCount,
      totalProducts: testProducts.length,
      errors: errors.length > 0 ? errors : undefined,
      expiresAt: expiresAt.toISOString(),
      expiresIn: '1 hour',
      products: testProducts.map(p => ({
        id: p.product_id,
        name: p.name,
        price: p.price,
      })),
    });

  } catch (error: any) {
    console.error('[Test Seed] Error:', error);
    return NextResponse.json({
      error: 'Failed to seed test products',
      message: error.message,
    }, { status: 500 });
  }
}


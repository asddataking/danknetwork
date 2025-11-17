// Fourthwall API Client
// Based on michiganmunchiemap integration pattern

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client for caching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

export interface FourthwallProduct {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  available: boolean;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    available: boolean;
  }>;
  checkoutUrl: string;
  collection?: string;
  description?: string;
  tags?: string[];
}

export interface FourthwallCheckoutResponse {
  checkoutUrl: string;
  error?: string;
}

class FourthwallClient {
  private storefrontToken: string;
  private shopUrl: string;
  private collectionSlug: string;

  constructor() {
    // Server-side only - these are accessed in API routes
    if (typeof window === 'undefined') {
      this.storefrontToken = process.env.FW_STOREFRONT_TOKEN || '';
      this.shopUrl = process.env.FW_SHOP_URL || '';
      this.collectionSlug = process.env.FW_COLLECTION_SLUG || 'all';
    } else {
      // Client-side fallback (shouldn't be used)
      this.storefrontToken = '';
      this.shopUrl = '';
      this.collectionSlug = 'all';
    }
  }

  /**
   * Get cached products from Supabase
   * The products_cache table stores individual products, so we fetch all and filter
   */
  private async getCachedProducts(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  }): Promise<FourthwallProduct[] | null> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      // Get all non-expired products from cache
      const now = new Date().toISOString();
      let query = client
        .from('products_cache')
        .select('product_id, name, description, price, image_url, checkout_url, raw_data, expires_at, category, in_stock')
        .gt('expires_at', now);

      // Filter by category if specified
      if (options.category) {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return null;
      }

      // Transform cached products
      const products: FourthwallProduct[] = data
        .map((item: any) => {
          // Try to use raw_data first, fallback to individual fields
          let product = null;
          if (item.raw_data && typeof item.raw_data === 'object') {
            product = item.raw_data;
          }

          // Extract images - handle both 'image' (singular) and 'images' (plural)
          let images: string[] = [];
          if (product?.images) {
            images = Array.isArray(product.images) ? product.images : [product.images];
          } else if (product?.image) {
            images = [product.image];
          } else if (item.image_url) {
            images = [item.image_url];
          }

          // Build product from raw_data or individual fields
          const transformed: FourthwallProduct = {
            id: product?.id || item.product_id || '',
            title: product?.title || product?.name || item.name || 'Untitled Product',
            handle: product?.handle || '',
            price: product?.price 
              ? (typeof product.price === 'string' ? parseFloat(product.price) : product.price)
              : parseFloat(item.price || 0),
            images: images,
            available: item.in_stock !== false && (product?.available !== false && product?.inStock !== false),
            variants: product?.variants || [],
            checkoutUrl: product?.checkoutUrl || item.checkout_url || '',
            collection: product?.collection || item.category || 'General',
            description: product?.description || item.description || '',
            tags: product?.tags || [],
          };

          if (product?.compareAtPrice !== undefined) {
            transformed.compareAtPrice = typeof product.compareAtPrice === 'string'
              ? parseFloat(product.compareAtPrice)
              : product.compareAtPrice;
          }

          return transformed;
        })
        .filter((p): p is FourthwallProduct => p !== null && !!p.id && !!p.title);

      // Apply filters
      let filtered = products;
      if (options.featured) {
        filtered = filtered.filter((p): p is FourthwallProduct => {
          if (!p) return false;
          return (
            p.tags?.includes('featured') || 
            p.tags?.includes('Featured') ||
            p.collection === 'featured'
          );
        });
      }

      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered.length > 0 ? filtered : null;
    } catch (error) {
      console.error('[FourthwallClient] Error getting cache:', error);
      return null;
    }
  }

  /**
   * Save products to cache in Supabase
   * Each product is cached individually by product_id
   */
  private async saveToCache(products: FourthwallProduct[], options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  }): Promise<void> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return;
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache for products

      // Save each product to cache individually
      for (const product of products) {
        const { error } = await client
          .from('products_cache')
          .upsert({
            product_id: product.id,
            name: product.title,
            description: product.description,
            price: product.price,
            currency: 'USD',
            image_url: product.images?.[0] || null,
            category: product.collection || options.category || 'General',
            in_stock: product.available,
            checkout_url: product.checkoutUrl,
            raw_data: product,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_id',
          });

        if (error) {
          console.error(`[FourthwallClient] Error saving product ${product.id} to cache:`, error);
        }
      }

      console.log(`[FourthwallClient] Cached ${products.length} products for 1 hour`);
    } catch (error) {
      console.error('[FourthwallClient] Error saving to cache:', error);
    }
  }

  /**
   * Fetch products from Fourthwall Storefront API
   * Storefront API endpoint: https://[shop].fourthwall.com/api/storefront/products
   * Uses Supabase cache to avoid hitting API too frequently (1 hour cache)
   */
  async getProducts(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  } = {}): Promise<FourthwallProduct[]> {
    try {
      // Try to get from cache first
      const cachedProducts = await this.getCachedProducts(options);
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`[FourthwallClient] Returning ${cachedProducts.length} products from cache`);
        return cachedProducts;
      }

      // Cache miss or expired, fetch from Fourthwall
      console.log('[FourthwallClient] Cache miss, fetching from Fourthwall API...');

      // Check if we have required credentials
      if (!this.storefrontToken || !this.shopUrl) {
        console.warn('Fourthwall credentials missing, falling back to JSON feed');
        const products = await this.getProductsFromFeed(options);
        await this.saveToCache(products, options);
        return products;
      }

      // Build Storefront API URL
      // Format: https://[shop].fourthwall.com/api/storefront/products
      const storefrontUrl = `${this.shopUrl}/api/storefront/products`;
      const params = new URLSearchParams();
      
      if (options.category) {
        params.append('collection', options.category);
      } else if (this.collectionSlug && this.collectionSlug !== 'all') {
        params.append('collection', this.collectionSlug);
      }
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }

      const url = params.toString() ? `${storefrontUrl}?${params.toString()}` : storefrontUrl;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.storefrontToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Fourthwall Storefront API error: ${response.status} ${response.statusText}`);
        // Fallback to public JSON feed
        return await this.getProductsFromFeed(options);
      }

      const data = await response.json();
      
      // Storefront API returns { products: [...] } or just an array
      const products = data.products || data;
      
      if (!Array.isArray(products)) {
        console.error('Fourthwall API returned invalid format:', data);
        return await this.getProductsFromFeed(options);
      }

      const transformed = this.transformProducts(products);
      
      // Apply featured filter if needed
      let filtered = transformed;
      if (options.featured) {
        filtered = transformed.filter(p => 
          p.tags?.includes('featured') || 
          p.tags?.includes('Featured') ||
          p.collection === 'featured'
        );
      }

      // Save to cache for next time
      await this.saveToCache(filtered, options);

      return filtered;
    } catch (error) {
      console.error('[FourthwallClient] Storefront API error:', error);
      
      // On error, try to return cached data even if expired
      const cachedProducts = await this.getCachedProducts(options);
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('[FourthwallClient] API failed, returning stale cache');
        return cachedProducts;
      }
      
      // Fallback to public JSON feed
      const products = await this.getProductsFromFeed(options);
      await this.saveToCache(products, options);
      return products;
    }
  }

  /**
   * Fallback: Fetch products from public JSON feed
   */
  private async getProductsFromFeed(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  } = {}): Promise<FourthwallProduct[]> {
    try {
      const feedUrl = `${this.shopUrl}/products.json`;
      const response = await fetch(feedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products feed');
      }

      const data = await response.json();
      let products = this.transformProductsFromFeed(data.products || []);

      // Apply filters
      if (options.category) {
        const category = options.category;
        products = products.filter(p => 
          p.collection === category || 
          (p.tags && p.tags.includes(category))
        );
      }

      if (options.featured) {
        products = products.filter(p => 
          p.tags?.includes('featured') || 
          p.tags?.includes('Featured')
        );
      }

      if (options.limit) {
        products = products.slice(0, options.limit);
      }

      // Save to cache
      await this.saveToCache(products, options);

      return products;
    } catch (error) {
      console.error('[FourthwallClient] Feed error:', error);
      
      // Try to return cached data on error
      const cachedProducts = await this.getCachedProducts(options);
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('[FourthwallClient] Feed failed, returning stale cache');
        return cachedProducts;
      }
      
      return [];
    }
  }

  /**
   * Transform Storefront API products to our format
   * Storefront API format may vary, handle both formats
   */
  private transformProducts(products: any[]): FourthwallProduct[] {
    return products.map((product: any) => {
      // Handle price - could be in cents or dollars
      let price = 0;
      if (product.price) {
        price = typeof product.price === 'string' 
          ? parseFloat(product.price) 
          : product.price;
        // If price > 1000, assume it's in cents
        if (price > 1000) price = price / 100;
      } else if (product.variants?.[0]?.price) {
        price = typeof product.variants[0].price === 'string'
          ? parseFloat(product.variants[0].price)
          : product.variants[0].price;
        if (price > 1000) price = price / 100;
      }

      // Handle images - could be array of strings or objects, or single image
      let images: string[] = [];
      if (product.images) {
        images = Array.isArray(product.images) 
          ? product.images.map((img: any) => {
              if (typeof img === 'string') return img;
              return img.src || img.url || img;
            })
          : [product.images];
      } else if (product.image) {
        // Handle single image (could be string or object)
        const imageUrl = typeof product.image === 'string' 
          ? product.image 
          : product.image.src || product.image.url || product.image;
        if (imageUrl) {
          images = [imageUrl];
        }
      }

      // Handle checkout URL
      const checkoutUrl = product.checkoutUrl 
        || product.url 
        || (product.handle ? `${this.shopUrl}/products/${product.handle}` : this.shopUrl);

      // Handle tags - could be array or comma-separated string
      let tags: string[] = [];
      if (product.tags) {
        tags = Array.isArray(product.tags) 
          ? product.tags 
          : product.tags.split(',').map((t: string) => t.trim());
      }

      return {
        id: product.id?.toString() || product.handle || `product-${Math.random()}`,
        title: product.title || product.name || 'Untitled Product',
        handle: product.handle || product.slug || '',
        price,
        compareAtPrice: product.compareAtPrice 
          ? (typeof product.compareAtPrice === 'string' 
              ? parseFloat(product.compareAtPrice) 
              : product.compareAtPrice) / (product.compareAtPrice > 1000 ? 100 : 1)
          : undefined,
        images,
        available: product.available !== false && product.inventory_quantity !== 0,
        variants: product.variants?.map((v: any) => {
          let variantPrice = 0;
          if (v.price) {
            variantPrice = typeof v.price === 'string' ? parseFloat(v.price) : v.price;
            if (variantPrice > 1000) variantPrice = variantPrice / 100;
          }
          return {
            id: v.id?.toString() || '',
            title: v.title || v.name || 'Default',
            price: variantPrice,
            available: v.available !== false && v.inventory_quantity !== 0,
          };
        }) || [],
        checkoutUrl,
        collection: product.collection?.handle || product.collection || product.collection_id,
        description: product.description || product.body_html || '',
        tags,
      };
    });
  }

  /**
   * Transform JSON feed products to our format
   */
  private transformProductsFromFeed(products: any[]): FourthwallProduct[] {
    return products.map((product: any) => ({
      id: product.id?.toString() || product.handle,
      title: product.title,
      handle: product.handle,
      price: parseFloat(product.variants?.[0]?.price || 0) / 100,
      compareAtPrice: product.variants?.[0]?.compare_at_price
        ? parseFloat(product.variants[0].compare_at_price) / 100
        : undefined,
      images: product.images?.map((img: any) => img.src || img) || [],
      available: product.variants?.some((v: any) => v.available) !== false,
      variants: product.variants?.map((v: any) => ({
        id: v.id?.toString(),
        title: v.title || 'Default',
        price: parseFloat(v.price || 0) / 100,
        available: v.available !== false,
      })) || [],
      checkoutUrl: `${this.shopUrl}/products/${product.handle}`,
      description: product.body_html,
      tags: product.tags?.split(',').map((t: string) => t.trim()) || [],
    }));
  }

  /**
   * Create a donation checkout for Feed the Crew
   * Note: This requires a donation product to be set up in Fourthwall
   * The product handle should be configured in FW_DONATION_PRODUCT_HANDLE env var
   * Or we can use a direct checkout URL pattern
   */
  async createDonationCheckout(
    amount: number,
    message?: string
  ): Promise<FourthwallCheckoutResponse> {
    try {
      // Option 1: If you have a donation product in Fourthwall
      // You can use the product handle and add custom properties
      const donationProductHandle = process.env.FW_DONATION_PRODUCT_HANDLE || 'donation';
      
      // Build checkout URL with amount and message as line item properties
      const params = new URLSearchParams();
      params.append('items[0][id]', donationProductHandle);
      params.append('items[0][quantity]', '1');
      params.append('items[0][properties][Amount]', `$${amount.toFixed(2)}`);
      if (message) {
        params.append('items[0][properties][Message]', message);
      }
      
      const checkoutUrl = `${this.shopUrl}/cart/add?${params.toString()}`;
      
      return {
        checkoutUrl,
      };
    } catch (error) {
      console.error('Donation checkout error:', error);
      return {
        checkoutUrl: '',
        error: 'Failed to create checkout',
      };
    }
  }

  /**
   * Get a single product by ID or handle
   */
  async getProductById(idOrHandle: string): Promise<FourthwallProduct | null> {
    try {
      const products = await this.getProducts({ limit: 100 });
      return products.find(p => p.id === idOrHandle || p.handle === idOrHandle) || null;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const fourthwallClient = new FourthwallClient();


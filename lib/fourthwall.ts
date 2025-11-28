// Fourthwall API Client
// Based on michiganmunchiemap integration pattern

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client for caching
// Support both naming conventions: NEXT_PUBLIC_* (standard) and supabase_* (local dev)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.supabase_url || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.supabase_anon_key || '';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[FourthwallClient] Supabase not configured:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[FourthwallClient] Supabase client initialized successfully');
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
      
      // Log configuration on initialization
      console.log('[FourthwallClient] Initialized with:', {
        hasShopUrl: !!this.shopUrl,
        shopUrl: this.shopUrl || 'NOT SET',
        hasStorefrontToken: !!this.storefrontToken,
        collectionSlug: this.collectionSlug,
        envVarSet: process.env.FW_SHOP_URL ? 'YES' : 'NO'
      });
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
    allowStale?: boolean;
  }): Promise<FourthwallProduct[] | null> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.warn('[FourthwallClient] Cannot access cache - Supabase client not available');
        return null;
      }
      
      console.log('[FourthwallClient] Supabase client available, querying cache...');

      // Get all non-expired products from cache (or stale if allowStale is true)
      const now = new Date().toISOString();
      console.log('[FourthwallClient] Checking cache for products, expires_at >', now, 'allowStale:', options.allowStale);
      let query = client
        .from('products_cache')
        .select('product_id, name, description, price, image_url, checkout_url, raw_data, expires_at, category, in_stock');
      
      // Only filter by expiration if not allowing stale data
      if (!options.allowStale) {
        query = query.gt('expires_at', now);
      }

      // Filter by category if specified
      if (options.category) {
        query = query.eq('category', options.category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[FourthwallClient] Cache query error:', error);
        console.error('[FourthwallClient] Error details:', JSON.stringify(error, null, 2));
        console.error('[FourthwallClient] Supabase client initialized:', !!client);
        console.error('[FourthwallClient] Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
        console.error('[FourthwallClient] Supabase Anon Key:', supabaseAnonKey ? 'SET' : 'NOT SET');
        return null;
      }

      if (!data || data.length === 0) {
        console.log('[FourthwallClient] No products found in cache (expired or empty)');
        console.log('[FourthwallClient] Query conditions:', {
          allowStale: options.allowStale,
          category: options.category,
          now: new Date().toISOString(),
        });
        return null;
      }

      console.log(`[FourthwallClient] Found ${data.length} products in cache`);
      console.log('[FourthwallClient] Sample cache item:', data[0]);

      // Transform cached products
      const products: FourthwallProduct[] = data
        .map((item: any) => {
          try {
            // Try to use raw_data first, fallback to individual fields
            let product = null;
            if (item.raw_data && typeof item.raw_data === 'object') {
              product = item.raw_data;
            }

            // Extract images - use improved logic to handle all formats
            let images: string[] = [];
            if (product?.images) {
              if (Array.isArray(product.images)) {
                images = product.images.map((img: any) => {
                  if (typeof img === 'string') return img;
                  // Handle various image object formats
                  if (img && typeof img === 'object') {
                    return img.src || img.url || img.original || img.large || img.medium || img.small || '';
                  }
                  return '';
                }).filter(Boolean);
              } else if (typeof product.images === 'string') {
                images = [product.images];
              } else if (product.images && typeof product.images === 'object') {
                const img = product.images.src || product.images.url || product.images.original || '';
                if (img) images = [img];
              }
            } else if (product?.image) {
              if (typeof product.image === 'string') {
                images = [product.image];
              } else if (product.image && typeof product.image === 'object') {
                const img = product.image.src || product.image.url || product.image.original || '';
                if (img) images = [img];
              }
            } else if (product?.featured_image) {
              images = typeof product.featured_image === 'string' 
                ? [product.featured_image]
                : (product.featured_image?.src ? [product.featured_image.src] : []);
            } else if (item.image_url) {
              images = [item.image_url];
            }
            
            // Ensure we have at least one image - if none found, log for debugging
            if (images.length === 0) {
              console.warn('[FourthwallClient] No images found for cached product:', {
                product_id: item.product_id,
                has_raw_data_image: !!product?.image,
                has_raw_data_images: !!product?.images,
                has_item_image_url: !!item.image_url,
                raw_data_keys: product ? Object.keys(product) : []
              });
            }

            // Parse price using the same helper function
            let price = 0;
            if (product?.price !== undefined) {
              price = this.parsePrice(product.price);
            } else if (product?.variants?.[0]?.price !== undefined) {
              price = this.parsePrice(product.variants[0].price);
            } else {
              price = this.parsePrice(item.price);
            }

            // Parse compare at price
            let compareAtPrice: number | undefined = undefined;
            if (product?.compareAtPrice !== undefined) {
              compareAtPrice = this.parsePrice(product.compareAtPrice);
            } else if (product?.variants?.[0]?.compare_at_price !== undefined) {
              compareAtPrice = this.parsePrice(product.variants[0].compare_at_price);
            } else if (product?.compare_at_price !== undefined) {
              compareAtPrice = this.parsePrice(product.compare_at_price);
            }

            // Handle variants - ensure prices are parsed correctly
            const variants = (product?.variants || []).map((v: any) => ({
              id: v.id?.toString() || v.sku || '',
              title: v.title || v.name || 'Default',
              price: this.parsePrice(v.price),
              available: v.available !== false && v.inventory_quantity !== 0,
            }));

            // Determine availability - handle both 'available' and 'inStock' fields
            let available = true;
            if (product?.inStock !== undefined) {
              available = product.inStock !== false;
            } else if (product?.available !== undefined) {
              available = product.available !== false;
            } else if (item.in_stock !== undefined) {
              available = item.in_stock !== false;
            } else if (variants.length > 0) {
              available = variants.some((v: any) => v.available !== false) !== false;
            }

            // Build product from raw_data or individual fields
            const transformed: FourthwallProduct = {
              id: product?.id || item.product_id || '',
              title: product?.title || product?.name || item.name || 'Untitled Product',
              handle: product?.handle || '',
              price: price,
              compareAtPrice: compareAtPrice,
              images: images,
              available: available,
              variants: variants,
              checkoutUrl: product?.checkoutUrl || item.checkout_url || '',
              collection: product?.collection || item.category || 'General',
              description: product?.description || item.description || '',
              tags: product?.tags || [],
            };

            console.log(`[FourthwallClient] Transformed cached product: ${transformed.id} - ${transformed.title}`, {
              price: transformed.price,
              compareAtPrice: transformed.compareAtPrice,
              images: transformed.images.length,
            });
            return transformed;
          } catch (error) {
            console.error('[FourthwallClient] Error transforming cached product:', item, error);
            return null;
          }
        })
        .filter((p): p is FourthwallProduct => p !== null && !!p.id && !!p.title);
      
      console.log(`[FourthwallClient] Transformed ${products.length} products from ${data.length} cache items`);

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
   * Fetch products from Fourthwall
   * JSON feed ONLY - no fallbacks to cache or Storefront API
   */
  async getProducts(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  } = {}): Promise<FourthwallProduct[]> {
    try {
      // JSON feed ONLY - no fallbacks
      if (!this.shopUrl) {
        console.error('[FourthwallClient] shopUrl not configured, cannot fetch from JSON feed');
        console.error('[FourthwallClient] Please set FW_SHOP_URL environment variable');
        // Try cache even if shopUrl is not configured
        const cachedProducts = await this.getCachedProducts({ ...options, allowStale: true });
        if (cachedProducts && cachedProducts.length > 0) {
          console.log(`[FourthwallClient] Returning ${cachedProducts.length} cached products (shopUrl not configured)`);
          return cachedProducts;
        }
        return [];
      }

      // First, try to get fresh products from cache (non-expired)
      const freshCachedProducts = await this.getCachedProducts({ ...options, allowStale: false });
      if (freshCachedProducts && freshCachedProducts.length > 0) {
        console.log(`[FourthwallClient] Returning ${freshCachedProducts.length} fresh cached products`);
        return freshCachedProducts;
      }

      // Check for stale cache before trying feed (since feed often returns 403)
      // This ensures we return cached products even if feed is unavailable
      const staleCachedProducts = await this.getCachedProducts({ ...options, allowStale: true });
      if (staleCachedProducts && staleCachedProducts.length > 0) {
        console.log(`[FourthwallClient] Using ${staleCachedProducts.length} stale cached products`);
        console.log(`[FourthwallClient] Note: JSON feed may be unavailable (403), using cached products as fallback`);
        return staleCachedProducts;
      }

      // If no cache at all, try JSON feed
      console.log('[FourthwallClient] No cache found, fetching from JSON feed...');
      let jsonFeedProducts: FourthwallProduct[] = [];
      
      try {
        jsonFeedProducts = await this.getProductsFromFeed(options);
        console.log(`[FourthwallClient] JSON feed returned ${jsonFeedProducts.length} products`);
        if (jsonFeedProducts.length > 0) {
          return jsonFeedProducts;
        }
      } catch (feedError: any) {
        console.warn('[FourthwallClient] JSON feed failed:', feedError.message);
        // If it's a 403, this is expected for private shops
        if (feedError.message?.includes('403') || feedError.message?.includes('Forbidden')) {
          console.warn('[FourthwallClient] JSON feed is returning 403 Forbidden - shop may be private or feed URL not publicly accessible');
          console.warn('[FourthwallClient] To fix: Make sure products are cached manually using /api/fourthwall/refresh-cache');
        }
      }
      
      // If we get here, both feed and cache failed
      console.warn('[FourthwallClient] Both JSON feed and cache returned 0 products');
      console.warn('[FourthwallClient] Check the debug endpoint at /api/fourthwall/debug to see raw feed data');
      console.warn('[FourthwallClient] Try manually refreshing cache: GET /api/fourthwall/refresh-cache');
      
      return [];
    } catch (error) {
      console.error('[FourthwallClient] Error fetching products:', error);
      
      // On error, try to return cached data even if expired
      const cachedProducts = await this.getCachedProducts({ ...options, allowStale: true });
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('[FourthwallClient] Error occurred, returning stale cache');
        return cachedProducts;
      }
      
      // Last resort: return empty array
      console.warn('[FourthwallClient] All methods failed, returning empty array');
      return [];
    }
  }

  /**
   * Fetch products from Fourthwall Storefront API
   * Used as fallback when JSON feed fails
   */
  private async getProductsFromStorefrontAPI(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  } = {}): Promise<FourthwallProduct[]> {
    if (!this.storefrontToken) {
      console.warn('[FourthwallClient] Storefront token not configured, cannot use Storefront API');
      return [];
    }

    if (!this.shopUrl) {
      console.warn('[FourthwallClient] Shop URL not configured, cannot use Storefront API');
      return [];
    }

    // Build Storefront API URL
    // Format: https://[shop].fourthwall.com/api/storefront/products
    const cleanShopUrl = this.shopUrl.replace(/\/$/, '');
    const storefrontUrl = `${cleanShopUrl}/api/storefront/products`;
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
    console.log('[FourthwallClient] Fetching from Storefront API:', url);
    
    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.storefrontToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[FourthwallClient] Storefront API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Storefront API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[FourthwallClient] Storefront API response:', { 
        hasProducts: !!data.products, 
        isArray: Array.isArray(data),
        productCount: data.products?.length || (Array.isArray(data) ? data.length : 0)
      });
      
      // Storefront API returns { products: [...] } or just an array
      const products = data.products || data;
      
      if (!Array.isArray(products)) {
        console.error('[FourthwallClient] Storefront API returned invalid format');
        throw new Error('Storefront API returned invalid format');
      }

      console.log(`[FourthwallClient] Storefront API returned ${products.length} products`);

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

      // Apply limit if specified
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      // Save to cache for next time
      await this.saveToCache(filtered, options);

      return filtered;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('[FourthwallClient] Storefront API fetch timeout after 10 seconds');
        throw new Error('Storefront API timeout');
      }
      console.error('[FourthwallClient] Storefront API fetch error:', fetchError);
      throw fetchError;
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
      // Check if shopUrl is available
      if (!this.shopUrl) {
        console.warn('[FourthwallClient] shopUrl not configured, cannot fetch from JSON feed');
        // Try to return cached data even if expired
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data: staleData } = await client
              .from('products_cache')
              .select('product_id, name, description, price, image_url, checkout_url, raw_data, expires_at, category, in_stock')
              .limit(100);
            
            if (staleData && staleData.length > 0) {
              const staleProducts = staleData
                .map((item: any) => {
                  try {
                    let product = null;
                    if (item.raw_data && typeof item.raw_data === 'object') {
                      product = item.raw_data;
                    }
                    let images: string[] = [];
                    if (product?.images) {
                      images = Array.isArray(product.images) ? product.images : [product.images];
                    } else if (product?.image) {
                      images = [product.image];
                    } else if (item.image_url) {
                      images = [item.image_url];
                    }
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
                  } catch (error) {
                    return null;
                  }
                })
                .filter((p): p is FourthwallProduct => p !== null && !!p.id && !!p.title);
              
              if (staleProducts.length > 0) {
                console.log('[FourthwallClient] Returning stale cache (shopUrl not configured)');
                // Apply filters
                let filtered = staleProducts;
                if (options.featured) {
                  filtered = filtered.filter(p => 
                    p.tags?.includes('featured') || 
                    p.tags?.includes('Featured') ||
                    p.collection === 'featured'
                  );
                }
                if (options.limit) {
                  filtered = filtered.slice(0, options.limit);
                }
                return filtered;
              }
            }
          } catch (error) {
            console.error('[FourthwallClient] Error fetching stale cache:', error);
          }
        }
        return [];
      }

      // Ensure shopUrl doesn't have trailing slash
      const cleanShopUrl = this.shopUrl.replace(/\/$/, '');
      
      // Try multiple feed URL patterns - Fourthwall might use different paths
      const feedUrlPatterns = [
        `${cleanShopUrl}/products.json`,
        `${cleanShopUrl}/collections/all/products.json`,
        `${cleanShopUrl}/api/products.json`,
        `${cleanShopUrl}/feed/products.json`,
      ];
      
      console.log('[FourthwallClient] Shop URL configured:', this.shopUrl ? 'Yes' : 'No');
      console.log('[FourthwallClient] Shop URL value:', this.shopUrl || 'NOT SET');
      console.log('[FourthwallClient] FW_SHOP_URL env var:', process.env.FW_SHOP_URL ? 'SET' : 'NOT SET');
      console.log('[FourthwallClient] Will try feed URLs:', feedUrlPatterns);
      
      // Try each feed URL pattern until one works
      let response: Response | null = null;
      let successfulFeedUrl: string | null = null;
      let lastError: any = null;
      
      for (const feedUrl of feedUrlPatterns) {
        console.log(`[FourthwallClient] Trying feed URL: ${feedUrl}`);
        
        try {
          // Add timeout to prevent hanging (10 seconds per attempt)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          try {
            const testResponse = await fetch(feedUrl, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; DankNetwork/1.0)',
              },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            
            // If successful, use this URL
            if (testResponse.ok) {
              console.log(`[FourthwallClient] Successfully accessed feed at: ${feedUrl}`);
              response = testResponse;
              successfulFeedUrl = feedUrl;
              break;
            }
            
            // For 403, this means the feed is not publicly accessible
            if (testResponse.status === 403) {
              console.warn(`[FourthwallClient] Feed URL ${feedUrl} returned 403 Forbidden - shop feed is not publicly accessible`);
              console.warn(`[FourthwallClient] This is common for private shops. Products should be cached manually.`);
              lastError = new Error(`Feed access forbidden (403) - shop may be private`);
              continue;
            }
            
            // For 404, try next URL pattern
            if (testResponse.status === 404) {
              console.warn(`[FourthwallClient] Feed URL ${feedUrl} returned 404, trying next pattern...`);
              continue;
            }
            
            // For other errors, log and try next
            console.warn(`[FourthwallClient] Feed URL ${feedUrl} returned ${testResponse.status}, trying next pattern...`);
            continue;
            
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
              console.warn(`[FourthwallClient] Feed URL ${feedUrl} timed out, trying next pattern...`);
              continue;
            }
            
            // For network errors, try next URL
            console.warn(`[FourthwallClient] Feed URL ${feedUrl} error: ${fetchError.message}, trying next pattern...`);
            lastError = fetchError;
            continue;
          }
        } catch (error: any) {
          console.warn(`[FourthwallClient] Feed URL ${feedUrl} failed:`, error.message);
          lastError = error;
          continue;
        }
      }
      
      // If we tried all URLs and none worked, check cache before failing
      if (!response || !successfulFeedUrl) {
        console.error('[FourthwallClient] All feed URL patterns failed');
        console.error('[FourthwallClient] Attempted URLs:', feedUrlPatterns);
        
        // Try cache before giving up
        const cachedProducts = await this.getCachedProducts({ ...options, allowStale: true });
        if (cachedProducts && cachedProducts.length > 0) {
          console.log(`[FourthwallClient] All feeds failed, using ${cachedProducts.length} cached products`);
          return cachedProducts;
        }
        
        throw lastError || new Error('All feed URL patterns failed and no cache available');
      }
      
      // At this point, response is guaranteed to be ok (we only break when ok is true)
      // Parse the JSON data
      const data = await response.json();
      console.log('[FourthwallClient] Feed response:', { 
        productCount: data.products?.length || 0,
        hasProducts: !!data.products,
        isArray: Array.isArray(data),
        dataKeys: Object.keys(data || {}),
        firstProduct: data.products?.[0] ? {
          id: data.products[0].id,
          title: data.products[0].title,
          name: data.products[0].name,
          handle: data.products[0].handle,
          hasVariants: !!data.products[0].variants,
          variantCount: data.products[0].variants?.length || 0,
          hasImages: !!data.products[0].images,
          imageCount: data.products[0].images?.length || 0,
          allKeys: Object.keys(data.products[0] || {}),
        } : null,
        // Log first few products' keys to understand structure
        sampleProductKeys: data.products?.[0] ? Object.keys(data.products[0]) : []
      });
      
      // Handle case where data is directly an array (some JSON feeds return array directly)
      const productsArray = Array.isArray(data) ? data : (data.products || []);
      console.log('[FourthwallClient] Products array length:', productsArray.length);
      
      if (productsArray.length === 0) {
        console.warn('[FourthwallClient] No products found in JSON feed');
        console.warn('[FourthwallClient] Data structure:', {
          isArray: Array.isArray(data),
          hasProducts: !!data.products,
          topLevelKeys: Object.keys(data || {}),
          dataType: typeof data
        });
        return [];
      }
      
      // Log sample of raw product data before transformation
      if (productsArray.length > 0) {
        console.log('[FourthwallClient] Sample raw product (before transform):', {
          keys: Object.keys(productsArray[0]),
          id: productsArray[0].id,
          title: productsArray[0].title,
          name: productsArray[0].name,
          handle: productsArray[0].handle,
          hasVariants: !!productsArray[0].variants,
          hasImages: !!productsArray[0].images,
        });
      }
      
      let products = this.transformProductsFromFeed(productsArray);
      
      console.log(`[FourthwallClient] Transformed ${products.length} products from ${productsArray.length} raw products`);
      
      if (products.length === 0 && productsArray.length > 0) {
        console.error('[FourthwallClient] WARNING: All products were filtered out during transformation!');
        console.error('[FourthwallClient] This usually means products are missing required fields (id or title)');
        console.error('[FourthwallClient] Check server logs above for "Skipping product" warnings');
      }

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

      console.log(`[FourthwallClient] Feed returned ${products.length} products after filtering`);

      // Save to cache
      await this.saveToCache(products, options);

      return products;
    } catch (error) {
      console.error('[FourthwallClient] Feed error:', error);
      
      // Always try to return cached data on error (even if expired)
      // This is critical for resilience - we should never return empty if we have cache
      const cachedProducts = await this.getCachedProducts({ ...options, allowStale: true });
      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`[FourthwallClient] Feed failed, returning ${cachedProducts.length} cached products (stale allowed)`);
        return cachedProducts;
      }
      
      // If no cache, re-throw the error so the caller can try Storefront API
      console.warn('[FourthwallClient] No products available from feed or cache, will try Storefront API');
      throw error;
    }
  }

  /**
   * Helper function to parse price - handles both cents and dollars
   * Used by both transformProducts and transformProductsFromFeed
   */
  private parsePrice(priceValue: any): number {
    if (priceValue == null) return 0;
    
    if (typeof priceValue === 'number') {
      // If number > 1000, likely in cents (e.g., 2999 = $29.99)
      return priceValue > 1000 ? priceValue / 100 : priceValue;
    }
    
    if (typeof priceValue === 'string') {
      const parsed = parseFloat(priceValue);
      if (isNaN(parsed)) return 0;
      
      // If string contains a decimal point, it's already in dollars (e.g., "29.99")
      // If no decimal point and > 100, likely in cents (e.g., "2999")
      if (priceValue.includes('.')) {
        return parsed;
      } else if (parsed > 100) {
        return parsed / 100;
      } else {
        // Small numbers without decimals might be dollars already
        return parsed;
      }
    }
    
    return 0;
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
        price = this.parsePrice(product.price);
      } else if (product.variants?.[0]?.price) {
        price = this.parsePrice(product.variants[0].price);
      }

      // Handle compare at price
      let compareAtPrice: number | undefined = undefined;
      if (product.compareAtPrice) {
        compareAtPrice = this.parsePrice(product.compareAtPrice);
      } else if (product.variants?.[0]?.compare_at_price) {
        compareAtPrice = this.parsePrice(product.variants[0].compare_at_price);
      }

      // Handle images - could be array of strings or objects, or single image
      let images: string[] = [];
      if (product.images) {
        if (Array.isArray(product.images)) {
          images = product.images.map((img: any) => {
            if (typeof img === 'string') return img;
            // Handle various image object formats
            if (img && typeof img === 'object') {
              return img.src || img.url || img.original || img.large || img.medium || img.small || '';
            }
            return '';
          }).filter(Boolean);
        } else if (typeof product.images === 'string') {
          images = [product.images];
        } else if (product.images && typeof product.images === 'object') {
          const img = product.images.src || product.images.url || product.images.original || '';
          if (img) images = [img];
        }
      } else if (product.image) {
        // Handle single image (could be string or object)
        if (typeof product.image === 'string') {
          images = [product.image];
        } else if (product.image && typeof product.image === 'object') {
          const img = product.image.src || product.image.url || product.image.original || '';
          if (img) images = [img];
        }
      } else if (product.featured_image) {
        // Some feeds use featured_image
        images = typeof product.featured_image === 'string' 
          ? [product.featured_image]
          : (product.featured_image?.src ? [product.featured_image.src] : []);
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
        compareAtPrice,
        images,
        available: (product.inStock !== undefined ? product.inStock !== false : product.available !== false) && product.inventory_quantity !== 0,
        variants: product.variants?.map((v: any) => ({
          id: v.id?.toString() || '',
          title: v.title || v.name || 'Default',
          price: this.parsePrice(v.price),
          available: v.available !== false && v.inventory_quantity !== 0,
        })) || [],
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
    return products
      .map((product: any) => {
        try {
          // Handle different price formats (cents vs dollars)
          let price = 0;
          if (product.variants && product.variants.length > 0) {
            price = this.parsePrice(product.variants[0].price);
          } else if (product.price) {
            // Some feeds have price directly on product
            price = this.parsePrice(product.price);
          }

          // Handle compare at price
          let compareAtPrice: number | undefined = undefined;
          if (product.variants?.[0]?.compare_at_price) {
            compareAtPrice = this.parsePrice(product.variants[0].compare_at_price);
          } else if (product.compare_at_price) {
            compareAtPrice = this.parsePrice(product.compare_at_price);
          }

          // Handle images - can be array of objects with src, or array of strings, or single string
          let images: string[] = [];
          if (product.images) {
            if (Array.isArray(product.images)) {
              images = product.images.map((img: any) => {
                if (typeof img === 'string') return img;
                // Handle various image object formats
                if (img && typeof img === 'object') {
                  return img.src || img.url || img.original || img.large || img.medium || img.small || '';
                }
                return '';
              }).filter(Boolean);
            } else if (typeof product.images === 'string') {
              images = [product.images];
            } else if (product.images && typeof product.images === 'object') {
              // Handle single image object
              const img = product.images.src || product.images.url || product.images.original || '';
              if (img) images = [img];
            }
          } else if (product.image) {
            // Some feeds have single image field
            if (typeof product.image === 'string') {
              images = [product.image];
            } else if (product.image && typeof product.image === 'object') {
              const img = product.image.src || product.image.url || product.image.original || '';
              if (img) images = [img];
            }
          } else if (product.featured_image) {
            // Some feeds use featured_image
            images = typeof product.featured_image === 'string' 
              ? [product.featured_image]
              : (product.featured_image?.src ? [product.featured_image.src] : []);
          }

          // Handle variants
          const variants = (product.variants || []).map((v: any) => ({
            id: v.id?.toString() || v.sku || '',
            title: v.title || v.name || 'Default',
            price: this.parsePrice(v.price),
            available: v.available !== false && v.inventory_quantity !== 0,
          }));

          // Determine availability - handle both 'available' and 'inStock' fields
          let available = true;
          if (product.inStock !== undefined) {
            available = product.inStock !== false;
          } else if (product.available !== undefined) {
            available = product.available !== false;
          } else if (product.variants && product.variants.length > 0) {
            available = product.variants.some((v: any) => 
              (v.available !== false && v.inventory_quantity !== 0) ||
              (v.inStock !== false)
            ) !== false;
          }

          // Build checkout URL - use product URL if available, otherwise construct it
          let checkoutUrl = '';
          if (product.url) {
            checkoutUrl = product.url;
          } else if (product.handle && this.shopUrl) {
            checkoutUrl = `${this.shopUrl}/products/${product.handle}`;
          } else if (product.id && this.shopUrl) {
            checkoutUrl = `${this.shopUrl}/products/${product.id}`;
          }

          // Handle tags - can be string (comma-separated) or array
          let tags: string[] = [];
          if (product.tags) {
            if (Array.isArray(product.tags)) {
              tags = product.tags;
            } else if (typeof product.tags === 'string') {
              tags = product.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
            }
          }

          const transformed: FourthwallProduct = {
            id: product.id?.toString() || product.handle || product.sku || '',
            title: product.title || product.name || 'Untitled Product',
            handle: product.handle || product.id?.toString() || product.slug || '',
            price,
            compareAtPrice,
            images,
            available,
            variants,
            checkoutUrl,
            collection: product.collection || product.product_type || product.type || undefined,
            description: product.body_html || product.description || product.body || product.summary || '',
            tags,
          };

          // Validate required fields
          if (!transformed.id || !transformed.title || transformed.title === 'Untitled Product') {
            console.warn('[FourthwallClient] Skipping product with missing id or title:', {
              id: transformed.id,
              title: transformed.title,
              originalProduct: {
                id: product.id,
                handle: product.handle,
                sku: product.sku,
                title: product.title,
                name: product.name,
                keys: Object.keys(product)
              }
            });
            return null;
          }

          return transformed;
        } catch (error) {
          console.error('[FourthwallClient] Error transforming product:', error, product);
          return null;
        }
      })
      .filter((p): p is FourthwallProduct => p !== null);
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


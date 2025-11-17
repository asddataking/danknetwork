// Fourthwall API Client
// Based on michiganmunchiemap integration pattern

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
   * Fetch products from Fourthwall Storefront API
   * Storefront API endpoint: https://[shop].fourthwall.com/api/storefront/products
   */
  async getProducts(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  } = {}): Promise<FourthwallProduct[]> {
    try {
      // Check if we have required credentials
      if (!this.storefrontToken || !this.shopUrl) {
        console.warn('Fourthwall credentials missing, falling back to JSON feed');
        return await this.getProductsFromFeed(options);
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
      if (options.featured) {
        return transformed.filter(p => 
          p.tags?.includes('featured') || 
          p.tags?.includes('Featured') ||
          p.collection === 'featured'
        );
      }

      return transformed;
    } catch (error) {
      console.error('Fourthwall Storefront API error:', error);
      // Fallback to public JSON feed
      return await this.getProductsFromFeed(options);
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

      return products;
    } catch (error) {
      console.error('Fourthwall feed error:', error);
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

      // Handle images - could be array of strings or objects
      let images: string[] = [];
      if (product.images) {
        images = product.images.map((img: any) => {
          if (typeof img === 'string') return img;
          return img.src || img.url || img;
        });
      } else if (product.image) {
        images = [typeof product.image === 'string' ? product.image : product.image.src || product.image.url];
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


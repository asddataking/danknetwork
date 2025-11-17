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
   */
  async getProducts(options: {
    category?: string;
    limit?: number;
    featured?: boolean;
  } = {}): Promise<FourthwallProduct[]> {
    try {
      // Try Storefront API first
      const storefrontUrl = `${this.shopUrl}/api/storefront/products`;
      const params = new URLSearchParams();
      
      if (options.category) {
        params.append('collection', options.category);
      } else if (this.collectionSlug !== 'all') {
        params.append('collection', this.collectionSlug);
      }
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }

      const response = await fetch(`${storefrontUrl}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.storefrontToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return this.transformProducts(data.products || data);
      }

      // Fallback to public JSON feed
      return await this.getProductsFromFeed(options);
    } catch (error) {
      console.error('Fourthwall API error:', error);
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
   */
  private transformProducts(products: any[]): FourthwallProduct[] {
    return products.map((product: any) => ({
      id: product.id || product.handle,
      title: product.title,
      handle: product.handle,
      price: parseFloat(product.price || product.variants?.[0]?.price || 0) / 100,
      compareAtPrice: product.compareAtPrice 
        ? parseFloat(product.compareAtPrice) / 100 
        : undefined,
      images: product.images?.map((img: any) => img.src || img.url) || [],
      available: product.available !== false,
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: parseFloat(v.price || 0) / 100,
        available: v.available !== false,
      })) || [],
      checkoutUrl: product.checkoutUrl || `${this.shopUrl}/products/${product.handle}`,
      collection: product.collection?.handle,
      description: product.description,
      tags: product.tags || [],
    }));
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


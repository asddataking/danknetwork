'use client';

import { useState, useEffect } from 'react';
import { FourthwallProduct } from '@/lib/fourthwall';

export default function ShopPage() {
  const [products, setProducts] = useState<FourthwallProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const category = selectedCategory === 'all' ? undefined : selectedCategory;
        const response = await fetch(`/api/fourthwall/products${category ? `?category=${category}` : ''}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Failed to fetch products');
          setProducts([]);
        } else {
          setProducts(data.products || []);
          
          // If response is OK but no products, show a helpful message
          if (!data.products || data.products.length === 0) {
            setError('Configuration issue detected. Products not loading.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-neon-green font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 uppercase">
            Shop
          </h1>
          <p className="text-white text-base sm:text-lg max-w-2xl">
            Rep the Dank Network with official merch. Limited edition drops and exclusive gear.
          </p>
        </div>

        {/* Category Filter (if needed) */}
        {/* <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {['All', 'Apparel', 'Accessories'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-neon-green text-black'
                    : 'bg-dark-surface text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div> */}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 animate-pulse">
                <div className="aspect-square bg-gray-800"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error || products.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-dark-surface border border-yellow-500/30 rounded-lg p-6 sm:p-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  Shop Temporarily Unavailable
                </h3>
                <p className="text-gray-300 mb-6">
                  {error || 'No products are currently available. Our shop integration may need configuration.'}
                </p>
                
                <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-400 mb-2">
                    <strong className="text-neon-green">For Site Admin:</strong>
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Check diagnostic endpoint: <code className="text-neon-green">/api/fourthwall/check</code></li>
                    <li>Verify <code className="text-yellow-400">FW_SHOP_URL</code> is set in Vercel</li>
                    <li>See <code className="text-blue-400">FOURTHWALL_FIX_GUIDE.md</code> for setup</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-neon-green text-black font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase text-sm"
                  >
                    Try Again
                  </button>
                  <a
                    href="/"
                    className="px-6 py-3 bg-dark-surface text-white font-bold rounded-lg hover:bg-gray-800 transition-colors duration-200 uppercase text-sm border border-gray-700"
                  >
                    Back to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 hover:border-neon-green/50 transition-all duration-200 group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-900 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">No Image</span>
                    </div>
                  )}
                  {!product.available && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-base mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green font-bold text-lg">${product.price.toFixed(2)}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-gray-500 text-sm line-through">${product.compareAtPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={product.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-neon-green text-black font-bold py-2 px-4 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase text-sm text-center"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


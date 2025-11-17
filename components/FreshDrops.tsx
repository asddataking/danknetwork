'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FourthwallProduct } from '@/lib/fourthwall';

export default function FreshDrops() {
  const [products, setProducts] = useState<FourthwallProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('[FreshDrops] Fetching products...');
        const response = await fetch('/api/fourthwall/products?limit=4');
        const data = await response.json();
        console.log('[FreshDrops] Received products:', data.products?.length || 0, data);
        setProducts(data.products || []);
      } catch (error) {
        console.error('[FreshDrops] Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Fresh Drops from the Shop</h2>
          <Link
            href="/shop"
            className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 bg-dark-surface rounded-lg border border-gray-800 animate-pulse">
              <div className="aspect-square bg-gray-800"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-800 rounded"></div>
                <div className="h-6 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-neon-green font-bold text-2xl uppercase">Fresh Drops from the Shop</h2>
        <Link
          href="/shop"
          className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-64 bg-dark-surface rounded-lg border border-gray-800 hover:border-neon-green/50 transition-all duration-200 group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-900 overflow-hidden rounded-t-lg">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full bg-gray-800 flex items-center justify-center"><span class="text-gray-600 text-sm">No Image</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-white font-bold text-base mb-2 line-clamp-2">{product.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-neon-green font-bold text-lg">${product.price.toFixed(2)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-gray-500 text-sm line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="bg-neon-green text-black font-bold py-2 px-4 rounded-lg text-center text-sm uppercase">
                Shop Now
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FourthwallProduct } from '@/lib/fourthwall';

export default function ShopShowcase() {
  const [products, setProducts] = useState<FourthwallProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Try featured first, but if none, get regular products
        let response = await fetch('/api/fourthwall/products?limit=4&featured=true');
        let data = await response.json();
        
        // If no featured products, get regular products
        if (!data.products || data.products.length === 0) {
          console.log('[ShopShowcase] No featured products, fetching regular products');
          response = await fetch('/api/fourthwall/products?limit=4');
          data = await response.json();
        }
        
        console.log('[ShopShowcase] Fetched products:', data.products?.length || 0);
        setProducts(data.products || []);
      } catch (error) {
        console.error('[ShopShowcase] Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Shop</h2>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 animate-pulse">
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
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Shop</h2>
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
        <p className="text-gray-400 text-center py-8">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-neon-green font-bold text-2xl uppercase">Shop</h2>
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 hover:border-neon-green/50 transition-all duration-200 group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-900 overflow-hidden">
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
    </div>
  );
}


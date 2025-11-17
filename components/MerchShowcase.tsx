'use client';

import { merchItems } from '@/data/products';
import Link from 'next/link';

export default function MerchShowcase() {
  const featuredMerch = merchItems.slice(0, 4);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-neon-green font-bold text-2xl uppercase">Merch</h2>
        <Link
          href="/merch"
          className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredMerch.map((item) => (
          <div
            key={item.id}
            className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 hover:border-neon-green/50 transition-all duration-200 group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-900 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {item.isLimitedEdition && (
                <div className="absolute top-2 right-2">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                    Limited
                  </span>
                </div>
              )}
              {item.stock < 10 && (
                <div className="absolute top-2 left-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Low Stock
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-white font-bold text-base mb-2 line-clamp-2">{item.name}</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-neon-green font-bold text-lg">${item.price}</span>
                {item.sizes && (
                  <span className="text-gray-400 text-xs">
                    {item.sizes.length} {item.sizes.length === 1 ? 'Size' : 'Sizes'}
                  </span>
                )}
              </div>
              <button className="w-full bg-neon-green text-black font-bold py-2 px-4 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase text-sm">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


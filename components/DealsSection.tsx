'use client';

import { useState } from 'react';
import { affiliateProducts } from '@/data/products';

export default function DealsSection() {
  const categories = ['All', 'Kitchen', 'Food', 'Gear', 'Accessories'] as const;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = selectedCategory === 'All'
    ? affiliateProducts
    : affiliateProducts.filter(p => {
        const categoryMap: Record<string, string> = {
          'Kitchen': 'kitchen',
          'Food': 'food',
          'Gear': 'gear',
          'Accessories': 'accessories',
        };
        return p.category === categoryMap[selectedCategory];
      });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-neon-green font-bold text-2xl uppercase">Deals & Gear</h2>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-neon-green text-black'
                : 'bg-dark-surface text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Carousel */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {filteredProducts.map((product) => (
          <a
            key={product.id}
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-64 bg-dark-surface rounded-lg border border-gray-800 hover:border-neon-green/50 transition-all duration-200 p-4 group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden mb-3">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {product.originalPrice && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <p className="text-gray-400 text-xs mb-1">{product.brand}</p>
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="text-gray-400 text-xs ml-1">{product.rating}</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-neon-green font-bold text-lg">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-gray-500 text-sm line-through">${product.originalPrice}</span>
                )}
              </div>

              {/* CTA */}
              <button className="w-full bg-neon-green text-black font-bold py-2 px-4 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase text-xs">
                Shop on Amazon
              </button>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


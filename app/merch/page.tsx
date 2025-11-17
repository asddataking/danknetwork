'use client';

import MerchShowcase from '@/components/MerchShowcase';
import { merchItems } from '@/data/products';

export default function MerchPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-neon-green font-black text-4xl md:text-5xl mb-4 uppercase">
            Merch
          </h1>
          <p className="text-white text-lg max-w-2xl">
            Rep the Dank Network with official merch. Limited edition drops and exclusive gear.
          </p>
        </div>

        {/* Featured Merch */}
        <div className="mb-12">
          <MerchShowcase />
        </div>

        {/* All Merch Grid */}
        <div>
          <h2 className="text-white font-bold text-2xl mb-6 uppercase">All Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {merchItems.map((item) => (
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
      </div>
    </div>
  );
}


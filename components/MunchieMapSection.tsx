'use client';

import Link from 'next/link';

export default function MunchieMapSection() {
  return (
    <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-8 md:p-10 mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Content */}
        <div>
          <h2 className="text-neon-green font-black text-3xl md:text-4xl mb-4 uppercase">
            Interactive Munchie Map
          </h2>
          <p className="text-white text-lg mb-8">
            Discover Michigan&apos;s most authentic food experiences, verified dispensaries, and hidden gems all in one interactive map
          </p>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Verified Spots</h4>
                <p className="text-gray-400 text-xs">Every location is personally verified by our team</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Real Reviews</h4>
                <p className="text-gray-400 text-xs">Authentic ratings from our community</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚗</span>
              <div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Easy Navigation</h4>
                <p className="text-gray-400 text-xs">One-click directions to any location</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Hidden Gems</h4>
                <p className="text-gray-400 text-xs">Discover spots you won&apos;t find anywhere else</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-neon-green font-black text-3xl mb-1">500+</div>
              <div className="text-gray-400 text-sm">Verified Spots</div>
            </div>
            <div>
              <div className="text-neon-green font-black text-3xl mb-1">83</div>
              <div className="text-gray-400 text-sm">Counties</div>
            </div>
            <div>
              <div className="text-neon-green font-black text-3xl mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Updated</div>
            </div>
          </div>

          <Link
            href="https://michiganmunchiemap.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-neon-green text-black px-8 py-4 font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase"
          >
            Explore Interactive Map →
          </Link>
        </div>

        {/* Map Preview/Placeholder */}
        <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-500 text-sm">Map Preview</p>
              <p className="text-gray-600 text-xs mt-2">Click to explore full map</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


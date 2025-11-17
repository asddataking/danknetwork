'use client';

import Link from 'next/link';

export default function DankNDevourHero() {
  return (
    <div className="relative bg-gradient-to-br from-black via-dark-surface to-black border-b-2 border-neon-green/30 py-16 md:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff00' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-xl bg-neon-green flex items-center justify-center shadow-lg shadow-neon-green/30">
            <span className="text-black font-black text-2xl">DN</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase">
            Dank&apos;N&apos;Devour
          </h1>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black text-neon-green mb-4 uppercase">
          Where Food Meets the HighLife
        </h2>
        
        <p className="text-gray-300 text-xl mb-8 max-w-3xl">
          Find Michigan&apos;s best bites and dispensary deals. Earn rewards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="#map"
            className="bg-neon-green text-black px-8 py-4 font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 text-center uppercase"
          >
            Explore Map
          </Link>
          <Link
            href="#episodes"
            className="border-2 border-white text-white px-8 py-4 font-bold rounded-lg hover:bg-white/10 transition-colors duration-200 text-center uppercase"
          >
            Watch Episodes
          </Link>
          <Link
            href="/#feed-the-crew"
            className="border-2 border-neon-green text-neon-green px-8 py-4 font-bold rounded-lg hover:bg-neon-green/10 transition-colors duration-200 text-center uppercase"
          >
            Support Us
          </Link>
        </div>
      </div>
    </div>
  );
}


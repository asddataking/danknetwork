'use client';

import Link from 'next/link';

export default function NetworkStrip() {
  return (
    <div className="relative bg-gradient-to-b from-dark-surface via-dark-bg to-dark-surface border-y border-accent-turquoise/30 py-10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(15,185,201,0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-white font-black text-2xl md:text-3xl mb-2 bg-gradient-to-r from-accent-turquoise to-accent-sky bg-clip-text text-transparent">
            Part of the Dank Network
          </h2>
          <p className="text-gray-400 text-sm">Your hub for Michigan food, weed, and sports culture</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dank'N'Devour */}
          <div className="group relative bg-gradient-to-br from-dark-surface to-dark-bg border-2 border-accent-turquoise/40 rounded-2xl p-6 hover:border-accent-turquoise hover:shadow-2xl hover:shadow-accent-turquoise/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-turquoise/5 rounded-full blur-3xl group-hover:bg-accent-turquoise/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-turquoise flex items-center justify-center shadow-lg">
                  <span className="text-dark-bg font-black text-lg">DN</span>
                </div>
                <h3 className="text-accent-turquoise font-black text-xl">Dank&apos;N&apos;Devour</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">Michigan food + weed reviews.</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/danknddevour"
                  className="px-5 py-2.5 bg-gradient-turquoise text-dark-bg font-bold rounded-xl hover:shadow-lg hover:shadow-accent-turquoise/30 transition-all duration-200 text-center text-sm hover:scale-105"
                >
                  Watch on Dank Network
                </Link>
              </div>
              <p className="text-gray-500 text-xs mt-3">Full episode archives at danknddevour.com</p>
            </div>
          </div>

          {/* Dank Recipes */}
          <div className="group relative bg-gradient-to-br from-dark-surface to-dark-bg border-2 border-accent-sky/40 rounded-2xl p-6 hover:border-accent-sky hover:shadow-2xl hover:shadow-accent-sky/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-sky/5 rounded-full blur-3xl group-hover:bg-accent-sky/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-sky flex items-center justify-center shadow-lg">
                  <span className="text-dark-bg font-black text-lg">DR</span>
                </div>
                <h3 className="text-accent-sky font-black text-xl">Dank Recipes</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">High & hungry home cooking.</p>
              <Link
                href="/recipes"
                className="block px-5 py-2.5 bg-gradient-sky text-dark-bg font-bold rounded-xl hover:shadow-lg hover:shadow-accent-sky/30 transition-all duration-200 text-center text-sm hover:scale-105"
              >
                View Recipes
              </Link>
            </div>
          </div>

          {/* DankPass */}
          <div className="group relative bg-gradient-to-br from-dark-surface to-dark-bg border-2 border-purple-500/40 rounded-2xl p-6 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-purple flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-lg">DP</span>
                </div>
                <h3 className="text-purple-400 font-black text-xl">DankPass</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">Upload receipts. Earn munchie rewards.</p>
              <Link
                href="/rewards"
                className="block px-5 py-2.5 bg-gradient-purple text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 text-center text-sm hover:scale-105"
              >
                Open DankPass
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


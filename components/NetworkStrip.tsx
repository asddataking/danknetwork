'use client';

import Link from 'next/link';

export default function NetworkStrip() {
  return (
    <div className="bg-dark-surface border-y border-accent-turquoise/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-white font-bold text-lg mb-4">Part of the Dank Network</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dank'N'Devour */}
          <div className="bg-dark-bg border border-accent-turquoise/30 rounded-lg p-4 hover:border-accent-turquoise transition-colors">
            <h3 className="text-accent-turquoise font-semibold text-lg mb-1">Dank&apos;N&apos;Devour</h3>
            <p className="text-gray-400 text-sm mb-3">Michigan food + weed reviews.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/danknddevour"
                className="px-4 py-2 bg-accent-turquoise text-dark-bg font-semibold rounded-lg hover:bg-accent-turquoise/90 transition-colors text-center text-sm"
              >
                Watch on Dank Network
              </Link>
            </div>
            <p className="text-gray-500 text-xs mt-2">Full episode archives at danknddevour.com</p>
          </div>

          {/* Dank Recipes */}
          <div className="bg-dark-bg border border-accent-sky/30 rounded-lg p-4 hover:border-accent-sky transition-colors">
            <h3 className="text-accent-sky font-semibold text-lg mb-1">Dank Recipes</h3>
            <p className="text-gray-400 text-sm mb-3">High & hungry home cooking.</p>
            <Link
              href="/recipes"
              className="block px-4 py-2 bg-accent-sky text-dark-bg font-semibold rounded-lg hover:bg-accent-sky/90 transition-colors text-center text-sm"
            >
              View Recipes
            </Link>
          </div>

          {/* DankPass */}
          <div className="bg-dark-bg border border-purple-500/30 rounded-lg p-4 hover:border-purple-500 transition-colors">
            <h3 className="text-purple-400 font-semibold text-lg mb-1">DankPass</h3>
            <p className="text-gray-400 text-sm mb-3">Upload receipts. Earn munchie rewards.</p>
            <a
              href="https://www.dankpass.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-500/90 transition-colors text-center text-sm"
            >
              Open DankPass
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


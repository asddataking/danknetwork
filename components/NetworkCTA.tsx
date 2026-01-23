'use client';

import Link from 'next/link';

export default function NetworkCTA() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-neon-green font-bold text-2xl uppercase mb-2">
          The Network
        </h2>
        <p className="text-gray-400 text-sm">
          Pick your lane: Watch • Save • Earn
        </p>
      </div>

      {/* Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: DankNDevour */}
        <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-6 hover:border-neon-green/60 transition-all duration-200 group">
          <div className="mb-4">
            <h3 className="text-neon-green font-black text-xl md:text-2xl uppercase mb-2">
              DankNDevour
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Food + dispensary reviews and the full archive.
            </p>
          </div>
          <Link
            href="https://dankndevour.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-6 py-3 rounded-lg hover:bg-neon-green-dark transition-all duration-200 uppercase text-sm group-hover:scale-105"
          >
            Watch Reviews
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Card 2: Daily Dispo Deals */}
        <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-6 hover:border-neon-green/60 transition-all duration-200 group">
          <div className="mb-4">
            <h3 className="text-neon-green font-black text-xl md:text-2xl uppercase mb-2">
              Daily Dispo Deals
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Find dispensary deals fast — zero searching.
            </p>
          </div>
          <Link
            href="https://dailydispodeals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-6 py-3 rounded-lg hover:bg-neon-green-dark transition-all duration-200 uppercase text-sm group-hover:scale-105"
          >
            Find Deals
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Card 3: DankPass */}
        <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-6 hover:border-neon-green/60 transition-all duration-200 group">
          <div className="mb-4">
            <h3 className="text-neon-green font-black text-xl md:text-2xl uppercase mb-2">
              DankPass
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Earn rewards and unlock perks.
            </p>
          </div>
          <Link
            href="https://dankpass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-neon-green text-black font-bold px-6 py-3 rounded-lg hover:bg-neon-green-dark transition-all duration-200 uppercase text-sm group-hover:scale-105"
          >
            Join DankPass
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

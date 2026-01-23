'use client';

import Link from 'next/link';

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-neon-green font-black text-3xl sm:text-4xl md:text-5xl uppercase mb-4">
            <span className="text-neon-green">Daily Dispo</span>
            <br />
            <span className="text-neon-orange">Deals</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-4">
            Find dispensary deals fast — zero searching.
          </p>
          <p className="text-gray-400 text-base mb-8">
            Daily Dispo Deals is now available at its own dedicated site.
          </p>
          <Link
            href="https://dailydispodeals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-neon-green text-black font-bold px-8 py-4 rounded-lg hover:bg-neon-green-dark transition-all duration-200 uppercase text-lg transform hover:scale-105"
          >
            Find Deals on DailyDispoDeals.com
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

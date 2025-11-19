'use client';

import { Place } from '@/types/place';
import Link from 'next/link';

interface PlaceDetailProps {
  place: Place;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  if (!place) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-neon-green text-2xl mb-4">Place not found</h1>
          <Link
            href="/munchie-map"
            className="bg-neon-green text-black px-6 py-3 rounded-lg font-bold uppercase hover:bg-neon-green-dark transition-colors"
          >
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  const isDispensary = place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis');
  const placeType = isDispensary ? 'Dispensary' : 'Restaurant';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-dark-surface">
        {place.hero_image_url ? (
          <img
            src={place.hero_image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <span className="text-gray-600 text-6xl">📍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <Link
            href="/munchie-map"
            className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold uppercase transition-colors flex items-center gap-2 text-xs sm:text-sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Map</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-neon-green font-black text-2xl sm:text-3xl md:text-4xl uppercase mb-2">
                {place.name || 'Unnamed Place'}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-400 uppercase text-sm font-semibold">{placeType}</span>
                {place.is_verified && (
                  <span className="bg-neon-green text-black px-3 py-1 rounded text-sm font-bold uppercase">
                    ✓ Verified
                  </span>
                )}
                {place.is_featured && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold uppercase">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          {(place.address || place.city || place.state || place.county) && (
            <div className="space-y-1 mb-4">
              {place.address && (
                <p className="text-white text-base sm:text-lg">{place.address}</p>
              )}
              {(place.city || place.state || place.zip) && (
                <p className="text-gray-400 text-sm sm:text-base">
                  {place.city || ''}
                  {place.city && place.state && ', '}
                  {place.state || ''}
                  {place.zip && ` ${place.zip}`}
                </p>
              )}
              {place.county && (
                <p className="text-gray-500 text-xs sm:text-sm">{place.county} County</p>
              )}
            </div>
          )}

          {/* Rating & Price */}
          <div className="flex items-center gap-6 flex-wrap mb-6">
            {place.rating && (
              <div className="flex items-center gap-2">
                <span className="text-neon-green text-xl">⭐</span>
                <span className="text-white text-xl font-bold">{place.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">/ 5.0</span>
              </div>
            )}
            {place.price_level && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Price:</span>
                <span className="text-neon-green font-bold">
                  {'$'.repeat(place.price_level)}
                  {'$'.repeat(4 - place.price_level).replace(/\$/g, '·')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neon-green text-black px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-colors uppercase text-sm sm:text-base"
              >
                Visit Website
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${place.name || ''} ${place.address || ''} ${place.city || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-neon-green text-neon-green px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold hover:bg-neon-green/10 transition-colors uppercase text-sm sm:text-base"
            >
              Get Directions
            </a>
            {place.menu_url && (
              <a
                href={place.menu_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold hover:bg-white/10 transition-colors uppercase text-sm sm:text-base"
              >
                View Menu
              </a>
            )}
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="border-2 border-white text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold hover:bg-white/10 transition-colors uppercase text-sm sm:text-base"
              >
                {place.phone}
              </a>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Cuisines */}
          {place.cuisines && place.cuisines.length > 0 && (
            <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
              <h3 className="text-neon-green font-bold text-lg uppercase mb-3">Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {place.cuisines.map((cuisine, idx) => (
                  <span
                    key={idx}
                    className="bg-neon-green/20 text-neon-green px-3 py-1 rounded uppercase text-sm font-semibold"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
              <h3 className="text-neon-green font-bold text-lg uppercase mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hours */}
        {place.hours && Object.keys(place.hours).length > 0 && (
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4 mb-8">
            <h3 className="text-neon-green font-bold text-lg uppercase mb-3">Hours</h3>
            <div className="space-y-1">
              {Object.entries(place.hours).map(([day, hours]: [string, any]) => (
                <div key={day} className="flex justify-between text-white">
                  <span className="font-semibold capitalize">{day}</span>
                  <span>{hours || 'Closed'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(place.ig_url || place.website) && (
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
            <h3 className="text-neon-green font-bold text-lg uppercase mb-3">Connect</h3>
            <div className="flex gap-3">
              {place.ig_url && (
                <a
                  href={place.ig_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-neon-green transition-colors font-semibold"
                >
                  Instagram →
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-neon-green transition-colors font-semibold"
                >
                  Website →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


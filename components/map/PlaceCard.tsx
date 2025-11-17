'use client';

import { Place } from '@/types/place';
import Link from 'next/link';

interface PlaceCardProps {
  place: Place;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function PlaceCard({ place, isSelected, onSelect }: PlaceCardProps) {
  return (
    <div
      id={`place-${place.id}`}
      onClick={onSelect}
      className={`bg-dark-surface rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-neon-green shadow-lg shadow-neon-green/30'
          : 'border-neon-green/30 hover:border-neon-green/60'
      }`}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
          {place.hero_image_url ? (
            <img
              src={place.hero_image_url}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-600 text-2xl">📍</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-bold text-lg line-clamp-1">{place.name}</h3>
            <div className="flex gap-1 flex-shrink-0">
              {place.is_verified && (
                <span className="bg-neon-green text-black px-2 py-1 rounded text-xs font-bold uppercase">
                  ✓
                </span>
              )}
              {place.is_featured && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                  Featured
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-2">
            {place.address && (
              <p className="text-gray-400 text-sm line-clamp-1">{place.address}</p>
            )}
            <p className="text-gray-400 text-sm">
              {place.city}
              {place.state && `, ${place.state}`}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {place.rating && (
              <div className="flex items-center gap-1">
                <span className="text-neon-green">⭐</span>
                <span className="text-white text-sm font-semibold">{place.rating.toFixed(1)}</span>
              </div>
            )}
            {place.cuisines && place.cuisines.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {place.cuisines.slice(0, 2).map((cuisine, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded uppercase font-semibold"
                  >
                    {cuisine}
                  </span>
                ))}
                {place.cuisines.length > 2 && (
                  <span className="text-gray-500 text-xs">+{place.cuisines.length - 2}</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${place.name} ${place.address || ''} ${place.city || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs bg-neon-green text-black px-3 py-1.5 rounded font-bold hover:bg-neon-green-dark transition-colors uppercase"
            >
              Directions
            </a>
            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs border border-neon-green/50 text-neon-green px-3 py-1.5 rounded font-bold hover:bg-neon-green/10 transition-colors uppercase"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


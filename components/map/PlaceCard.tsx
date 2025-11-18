'use client';

import { Place } from '@/types/place';
import Link from 'next/link';

interface PlaceCardProps {
  place: Place;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function PlaceCard({ place, isSelected, onSelect }: PlaceCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // If clicking on a link or button, let it handle navigation
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    // Otherwise, navigate to detail page if slug exists
    if (place.slug) {
      window.location.href = `/place/${place.slug}`;
    } else {
      // Fallback to selecting on map
      onSelect();
    }
  };

  return (
    <div
      id={`place-${place.id}`}
      onClick={handleClick}
      className={`bg-dark-surface rounded-lg border-2 p-2.5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-neon-green shadow-lg shadow-neon-green/30'
          : 'border-neon-green/30 hover:border-neon-green/60'
      }`}
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
          {place.hero_image_url ? (
            <img
              src={place.hero_image_url}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-600 text-lg">📍</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm line-clamp-1">{place.name}</h3>
              {/* Show type (Restaurant or Dispensary) */}
              {(place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis')) && (
                <span className="text-xs text-neon-green uppercase font-semibold">Dispensary</span>
              )}
              {!(place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis')) && (
                <span className="text-xs text-gray-400 uppercase font-semibold">Restaurant</span>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {place.is_verified && (
                <span className="bg-neon-green text-black px-1.5 py-0.5 rounded text-xs font-bold">
                  ✓
                </span>
              )}
              {place.is_featured && (
                <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                  ★
                </span>
              )}
            </div>
          </div>

          <div className="space-y-0.5 mb-1.5">
            {place.address && (
              <p className="text-gray-400 text-xs line-clamp-1">{place.address}</p>
            )}
            <p className="text-gray-400 text-xs">
              {place.city}
              {place.state && `, ${place.state}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {place.rating && (
              <div className="flex items-center gap-0.5">
                <span className="text-neon-green text-xs">⭐</span>
                <span className="text-white text-xs font-semibold">{place.rating.toFixed(1)}</span>
              </div>
            )}
            {place.cuisines && place.cuisines.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {place.cuisines.slice(0, 1).map((cuisine, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-neon-green/20 text-neon-green px-1.5 py-0.5 rounded uppercase font-semibold"
                  >
                    {cuisine}
                  </span>
                ))}
                {place.cuisines.length > 1 && (
                  <span className="text-gray-500 text-xs">+{place.cuisines.length - 1}</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 mt-2">
            {place.slug && (
              <Link
                href={`/place/${place.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs bg-neon-green text-black px-2 py-1 rounded font-bold hover:bg-neon-green-dark transition-colors uppercase"
              >
                View
              </Link>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${place.name} ${place.address || ''} ${place.city || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs border border-neon-green/50 text-neon-green px-2 py-1 rounded font-bold hover:bg-neon-green/10 transition-colors uppercase"
            >
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


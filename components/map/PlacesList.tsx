'use client';

import { Place } from '@/types/place';
import PlaceCard from './PlaceCard';

interface PlacesListProps {
  places: Place[];
  selectedPlace: Place | null;
  hoveredPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  loading?: boolean;
}

export default function PlacesList({ places, selectedPlace, hoveredPlace, onPlaceSelect, loading }: PlacesListProps) {
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-dark-surface border-l border-neon-green/20">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-neon-green text-lg mb-4 font-bold uppercase">Loading Places...</div>
            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="h-full flex flex-col bg-dark-surface border-l border-neon-green/20">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-400 text-lg">No places found matching your filters.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-surface border-l border-neon-green/20">
      <div className="p-3 sm:p-4 lg:p-5 flex-shrink-0 border-b border-neon-green/20">
        <h2 className="text-neon-green font-bold text-base sm:text-lg lg:text-xl uppercase">
          {places.length} {places.length === 1 ? 'Place' : 'Places'} Found
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
        <div className="space-y-2 sm:space-y-3">
          {places.map((place) => {
            const isHovered = hoveredPlace?.id === place.id;
            return (
              <div
                key={place.id}
                id={`place-${place.id}`}
                className={isHovered ? 'transition-all duration-200' : 'transition-all duration-200'}
              >
                <PlaceCard
                  place={place}
                  isSelected={selectedPlace?.id === place.id}
                  isHovered={isHovered}
                  onSelect={() => onPlaceSelect(place)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


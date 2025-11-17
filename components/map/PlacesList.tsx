'use client';

import { Place } from '@/types/place';
import PlaceCard from './PlaceCard';

interface PlacesListProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  loading?: boolean;
}

export default function PlacesList({ places, selectedPlace, onPlaceSelect, loading }: PlacesListProps) {
  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <div className="text-neon-green text-lg mb-4 font-bold uppercase">Loading Places...</div>
          <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No places found matching your filters.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-neon-green font-bold text-xl uppercase">
          {places.length} {places.length === 1 ? 'Place' : 'Places'} Found
        </h2>
      </div>
      <div className="space-y-3">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isSelected={selectedPlace?.id === place.id}
            onSelect={() => onPlaceSelect(place)}
          />
        ))}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapView from './MapView';
import PlacesList from './PlacesList';
import FilterPanel from './filters/FilterPanel';
import ViewToggle from './ViewToggle';
import { Place } from '@/types/place';

type ViewMode = 'map' | 'list' | 'split';

export default function MapContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Fetch places
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
        if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
        if (filters.counties?.length) params.append('counties', filters.counties.join(','));
        if (filters.cuisines?.length) params.append('cuisines', filters.cuisines.join(','));
        if (filters.tags?.length) params.append('tags', filters.tags.join(','));
        if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
        if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
        if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());

        const response = await fetch(`/api/places?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setPlaces(data.places || []);
          setFilteredPlaces(data.places || []);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    // Scroll to place in list if in split/list view
    if (viewMode === 'split' || viewMode === 'list') {
      const element = document.getElementById(`place-${place.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-black">
      {/* View Toggle */}
      <div className="bg-dark-surface border-b border-neon-green/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        <div className="w-80 bg-dark-surface border-r border-neon-green/20 overflow-y-auto">
          <div className="p-4">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Map/List Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map View */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2 border-r border-neon-green/20' : 'w-full'}>
              <MapView
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onPlaceSelect={handlePlaceSelect}
              />
            </div>
          )}

          {/* List View */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2 overflow-y-auto' : 'w-full overflow-y-auto'}>
              <PlacesList
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onPlaceSelect={handlePlaceSelect}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


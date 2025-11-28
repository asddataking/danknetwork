'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapView from './MapView';
import PlacesList from './PlacesList';
import FilterPanel from './filters/FilterPanel';
import ViewToggle from './ViewToggle';
import { Place } from '@/types/place';
import { X, Filter } from 'lucide-react';

type ViewMode = 'map' | 'list' | 'split';

export default function MapContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Set default view mode based on screen size on initial load only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // Mobile: default to map view instead of split
      setViewMode('map');
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch places immediately on mount (before map loads) and when filters change
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
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

        const apiUrl = `/api/places?${params.toString()}`;
        console.log(`[MapContainer] Fetching places from: ${apiUrl}`);
        
        const startTime = Date.now();
        const response = await fetch(apiUrl);
        const fetchTime = Date.now() - startTime;
        console.log(`[MapContainer] Places fetch took ${fetchTime}ms`);
        
        if (response.ok) {
          const data = await response.json();
          const fetchedPlaces = data.places || [];
          console.log(`[MapContainer] Fetched ${fetchedPlaces.length} places in ${fetchTime}ms`, fetchedPlaces);
          
          // Verify places have coordinates
          const placesWithCoords = fetchedPlaces.filter((p: Place) => p.latitude && p.longitude);
          console.log(`[MapContainer] ${placesWithCoords.length} places have valid coordinates`);
          
          if (placesWithCoords.length === 0 && fetchedPlaces.length > 0) {
            console.error('[MapContainer] Places fetched but none have coordinates!', fetchedPlaces[0]);
          }
          
          setPlaces(placesWithCoords);
          setFilteredPlaces(placesWithCoords);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('[MapContainer] API error:', response.status, errorData);
          setPlaces([]);
          setFilteredPlaces([]);
        }
      } catch (error) {
        console.error('[MapContainer] Error fetching places:', error);
        setPlaces([]);
        setFilteredPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on mount
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

  // Scroll to hovered place in list
  useEffect(() => {
    if (hoveredPlace && (viewMode === 'split' || viewMode === 'list')) {
      const element = document.getElementById(`place-${hoveredPlace.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [hoveredPlace, viewMode]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* View Toggle & Filter Button */}
      <div className="bg-dark-surface border-b border-neon-green/20 px-3 sm:px-4 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {/* Mobile Filter Button */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg font-bold text-sm uppercase transition-colors border border-neon-green/30"
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Filters Sidebar - Desktop: always visible, Mobile: drawer */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-80 max-w-[85vw] lg:max-w-none
            bg-dark-surface border-r border-neon-green/20 
            overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:translate-x-0
          `}
        >
          <div className="p-4">
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="text-neon-green font-bold text-lg uppercase">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 text-gray-400 hover:text-neon-green transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Mobile Overlay when filters open */}
        {filtersOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Map/List Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Map View */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div
              className={`
                ${viewMode === 'split' ? 'w-full lg:w-[40%]' : 'w-full'}
                ${viewMode === 'split' ? 'h-1/2 lg:h-auto' : 'h-full'}
                ${viewMode === 'split' ? 'border-b lg:border-b-0 lg:border-r border-neon-green/20' : ''}
                flex-shrink-0
              `}
            >
              <MapView
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onPlaceSelect={handlePlaceSelect}
                onPlaceHover={setHoveredPlace}
              />
            </div>
          )}

          {/* List View */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div
              className={`
                ${viewMode === 'split' ? 'w-full lg:w-[60%]' : 'w-full'}
                ${viewMode === 'split' ? 'h-1/2 lg:h-auto' : 'h-full'}
                overflow-y-auto
                flex-shrink-0
              `}
            >
              <PlacesList
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                hoveredPlace={hoveredPlace}
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


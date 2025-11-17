'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Place } from '@/types/place';

interface MunchieMapProps {
  initialPlaces?: Place[];
  filters?: any;
}

export default function MunchieMap({ initialPlaces = [], filters = {} }: MunchieMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN || '';

    // Initialize map with MapTiler or Mapbox
    const mapStyle = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/style.json?access_token=${mapboxToken}`
      : {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle as any,
      center: [-84.5467, 44.3148], // Center of Michigan
      zoom: 6,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setLoading(false);
      fetchPlaces();
    });

    // Refetch when filters change
    if (map.current && map.current.loaded()) {
      fetchPlaces();
    }

    // Fetch places when map bounds change
    map.current.on('moveend', () => {
      if (map.current) {
        const bounds = map.current.getBounds();
        fetchPlacesInBounds(bounds);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
      // Clean up markers
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, []);

  const fetchPlaces = async (currentFilters = filters) => {
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.verified !== undefined) params.append('verified', currentFilters.verified.toString());
      if (currentFilters.featured !== undefined) params.append('featured', currentFilters.featured.toString());
      
      const response = await fetch(`/api/places?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPlaces(data.places || []);
        addPlacesToMap(data.places || []);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
    }
  };

  const fetchPlacesInBounds = async (bounds: maplibregl.LngLatBounds) => {
    try {
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const params = new URLSearchParams();
      params.append('bbox', bbox);
      if (filters.search) params.append('search', filters.search);
      if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
      
      const response = await fetch(`/api/places?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPlaces(data.places || []);
        addPlacesToMap(data.places || []);
      }
    } catch (error) {
      console.error('Error fetching places in bounds:', error);
    }
  };

  const addPlacesToMap = (placesData: Place[]) => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each place
    placesData.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = place.is_verified ? '24px' : '20px';
      el.style.height = place.is_verified ? '24px' : '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = place.is_verified ? '#00ff00' : '#00cc00';
      el.style.border = '3px solid #000';
      el.style.cursor = 'pointer';
      el.style.boxShadow = place.is_verified
        ? '0 0 10px rgba(0, 255, 0, 0.8)'
        : '0 0 5px rgba(0, 204, 0, 0.5)';

      const popup = new maplibregl.Popup({ offset: 25, className: 'map-popup' }).setHTML(`
        <div class="text-black p-3 min-w-[200px]">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-lg">${place.name}</h3>
            ${place.is_verified ? '<span class="text-xs bg-green-500 text-white px-2 py-1 rounded">✓ Verified</span>' : ''}
          </div>
          ${place.address ? `<p class="text-sm text-gray-600 mb-1">${place.address}</p>` : ''}
          ${place.city ? `<p class="text-sm text-gray-600 mb-1">${place.city}${place.state ? `, ${place.state}` : ''}</p>` : ''}
          ${place.rating ? `<p class="text-sm text-gray-600 mb-1">⭐ ${place.rating.toFixed(1)}</p>` : ''}
          ${place.cuisines && place.cuisines.length > 0 ? `<p class="text-xs text-gray-500 mt-2">${place.cuisines.join(', ')}</p>` : ''}
          <div class="mt-3 flex gap-2">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address || ''} ${place.city || ''}`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs bg-neon-green text-black px-3 py-1 rounded font-bold hover:bg-neon-green-dark transition-colors"
            >
              Directions
            </a>
            ${place.website ? `<a href="${place.website}" target="_blank" rel="noopener noreferrer" class="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Website</a>` : ''}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker(el)
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedPlace(place);
      });
    });
  };

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      fetchPlaces(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (places.length > 0 && map.current && map.current.loaded()) {
      addPlacesToMap(places);
    }
  }, [places]);

  return (
    <div className="relative w-full h-full bg-dark-surface">
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 bg-dark-surface/90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-neon-green text-xl mb-4 font-bold uppercase">Loading Interactive Map...</div>
            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}

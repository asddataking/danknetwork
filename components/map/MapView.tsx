'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Place } from '@/types/place';

interface MapViewProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  onPlaceHover?: (place: Place | null) => void;
}

export default function MapView({ places, selectedPlace, onPlaceSelect, onPlaceHover }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);

  // Define updateMarkers function that can be called from anywhere
  const updateMarkersRef = useRef<(() => void) | null>(null);
  
  // Store places in a ref so we can access current value in event handlers
  const placesRef = useRef<Place[]>(places);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  const updateMarkers = () => {
    const currentMap = map.current;
    if (!currentMap || !currentMap.loaded()) {
      console.warn('[MapView] Map not loaded, skipping marker update');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch (e) {
        // Marker might already be removed, ignore
      }
    });
    markersRef.current = [];

    // Get current places from ref
    const currentPlaces = placesRef.current;
    
    if (currentPlaces.length === 0) {
      console.log('[MapView] No places to display');
      return;
    }

    console.log(`[MapView] Rendering ${currentPlaces.length} individual markers`);

    // Create individual marker for each place
    currentPlaces.forEach((place) => {
      if (!place || !place.latitude || !place.longitude || !place.id) {
        console.warn('[MapView] Invalid place (missing required fields):', place);
        return;
      }

      // Check if this is a dispensary
      const isDispensary = place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis');
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      
      if (isDispensary) {
        // Larger orange marker for dispensaries
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#ff6600'; // Orange
        el.style.border = '3px solid #000';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 10px rgba(255, 102, 0, 0.8)';
      } else {
        // Blue marker for restaurants
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#3b82f6'; // Blue
        el.style.border = '2px solid #fff';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 5px rgba(59, 130, 246, 0.6)';
      }

      const popup = new mapboxgl.Popup({ offset: 25, className: 'map-popup' }).setHTML(`
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
              href="/place/${place.slug}"
              class="text-xs bg-neon-green text-black px-3 py-1 rounded font-bold hover:bg-neon-green-dark transition-colors"
            >
              View
            </a>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address || ''} ${place.city || ''}`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              Directions
            </a>
            ${place.website ? `<a href="${place.website}" target="_blank" rel="noopener noreferrer" class="text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Website</a>` : ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(currentMap);

      markersRef.current.push(marker);

      // Create hover popup (separate from click popup)
      const hoverPopup = new mapboxgl.Popup({ 
        offset: 25, 
        className: 'map-popup-hover',
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div class="p-2 min-w-[150px]">
          <h3 class="font-bold text-sm mb-1">${place.name}</h3>
          ${place.slug ? `<a href="/place/${place.slug}" class="text-xs hover:underline">View Details →</a>` : ''}
        </div>
      `);

      // Track if we're currently showing hover popup
      let showingHoverPopup = false;

      // Add hover handlers
      el.addEventListener('mouseenter', () => {
        if (onPlaceHover) {
          onPlaceHover(place);
        }
        // Show hover popup
        showingHoverPopup = true;
        hoverPopup.addTo(currentMap);
        marker.setPopup(hoverPopup);
      });

      el.addEventListener('mouseleave', () => {
        if (onPlaceHover) {
          onPlaceHover(null);
        }
        // Hide hover popup
        showingHoverPopup = false;
        hoverPopup.remove();
        // Reset to original popup (but don't show it)
        marker.setPopup(popup);
      });

      // Add click handler - navigate to detail page
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        // Navigate to place detail page
        if (place.slug) {
          window.location.href = `/place/${place.slug}`;
        } else {
          // Fallback to selecting on map if no slug
          onPlaceSelect(place);
        }
      });
    });
  };

  // Store reference to updateMarkers for use in event handlers
  updateMarkersRef.current = updateMarkers;

  useEffect(() => {
    if (!mapContainer.current || map.current) return; // Prevent re-initialization

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    if (!mapboxToken) {
      console.error('[MapView] No Mapbox token configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN');
      setLoading(false);
      return;
    }

    // Set Mapbox access token (required for Mapbox GL JS)
    mapboxgl.accessToken = mapboxToken;

    // Initialize map with Mapbox style and caching to reduce API calls
    // Mapbox GL JS automatically uses browser cache for tiles, sprites, and glyphs
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Use Mapbox Streets style
      center: [-84.5467, 44.3148], // Center of Michigan
      zoom: 6,
      // Enable tile caching to reduce API calls
      maxTileCacheSize: 50, // Cache up to 50 tiles in memory
      // Browser automatically caches tiles based on HTTP cache headers from Mapbox
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    );

    // Handle map load - trigger marker initialization if places are available
    map.current.on('load', () => {
      console.log('[MapView] Map loaded successfully');
      setLoading(false);
      
      // Check if places are available and trigger initialization directly
      // Use placesRef to get current value (not closure value)
      const currentPlaces = placesRef.current;
      if (currentPlaces.length > 0) {
        console.log(`[MapView] Map loaded, places available (${currentPlaces.length}) - triggering marker initialization`);
        // Use a small delay to ensure everything is ready
        setTimeout(() => {
          if (initializeMarkersRef.current) {
            initializeMarkersRef.current();
          }
        }, 50);
      } else {
        console.log('[MapView] Map loaded but no places yet - markers will initialize when places arrive');
      }
    });

    // Handle errors
    map.current.on('error', (e: any) => {
      console.error('[MapView] Map error:', e);
    });

    // No need to update markers on move/zoom since we're showing all markers
    // (clustering is removed, so all markers are always visible)

    return () => {
      if (map.current) {
        map.current.remove();
      }
      markersRef.current.forEach((m) => m.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared initialization function that can be called from both useEffect and map.on('load')
  const initializeMarkersRef = useRef<(() => void) | null>(null);
  
  // Initialize clustering and markers when places change (after map is loaded)
  // This is the primary initialization point - it handles both cases:
  // 1. Places arrive before map loads → waits for map to load
  // 2. Map loads before places arrive → waits for places to arrive
  useEffect(() => {
    const doInitializeMarkers = () => {
      if (!map.current) {
        console.log('[MapView] Map instance not available');
        return;
      }

      if (!map.current.loaded()) {
        console.log('[MapView] Map not loaded yet, will initialize when map loads');
        return;
      }

      // Use placesRef to get current value (handles race conditions)
      const currentPlaces = placesRef.current;
      
      if (currentPlaces.length === 0) {
        console.log('[MapView] No places to display - clearing markers');
        // Clear markers if no places
        markersRef.current.forEach((m) => {
          try {
            m.remove();
          } catch (e) {
            // Ignore
          }
        });
        markersRef.current = [];
        return;
      }

      console.log(`[MapView] Initializing markers for ${currentPlaces.length} places`);
      
      // Just call updateMarkers to render all individual markers
      if (updateMarkersRef.current) {
        updateMarkersRef.current();
        console.log('[MapView] Markers initialized');
      } else {
        console.error('[MapView] updateMarkersRef.current is null!');
      }
    };

    // Store reference so map.on('load') can call it
    initializeMarkersRef.current = doInitializeMarkers;

    // Always try to initialize - this handles both cases:
    // - If map is loaded and places are available → initialize immediately
    // - If map not loaded yet → will be triggered by map.on('load') handler
    // - If places not available yet → will be triggered when places arrive
    if (map.current && map.current.loaded() && places.length > 0) {
      console.log(`[MapView] Both map loaded and places available (${places.length}) - initializing markers now`);
      doInitializeMarkers();
    } else if (!map.current || !map.current.loaded()) {
      console.log('[MapView] Map not loaded yet, markers will initialize when map loads');
    } else if (places.length === 0) {
      console.log('[MapView] Map loaded but no places yet - markers will initialize when places arrive');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Update markers and center map when selected place changes
  useEffect(() => {
    if (map.current && map.current.loaded() && updateMarkersRef.current) {
      updateMarkersRef.current();
      
      // Center map on selected place
      if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
        map.current.flyTo({
          center: [selectedPlace.longitude, selectedPlace.latitude],
          zoom: 15,
          duration: 1000,
        });
      }
    }
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-full bg-dark-surface">
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 bg-dark-surface/90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-neon-green text-xl mb-4 font-bold uppercase">Loading Map...</div>
            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}

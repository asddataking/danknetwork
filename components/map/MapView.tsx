'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { Place } from '@/types/place';

interface MapViewProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
}

export default function MapView({ places, selectedPlace, onPlaceSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clusterMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const clusterRef = useRef<Supercluster | null>(null);
  const [loading, setLoading] = useState(true);

  // Define updateMarkers function - will be assigned in useEffect
  const updateMarkersRef = useRef<(() => void) | null>(null);

  // Define updateMarkers function that can be called from anywhere
  const updateMarkers = () => {
    const currentMap = map.current;
    if (!currentMap || !currentMap.loaded()) {
      console.warn('[MapView] Map not loaded, skipping marker update');
      return;
    }

    if (!clusterRef.current) {
      console.warn('[MapView] Cluster ref not initialized, skipping marker update');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    clusterMarkersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    clusterMarkersRef.current = [];

    const bounds = currentMap.getBounds();
    if (!bounds) {
      console.warn('[MapView] Map bounds not available, skipping marker update');
      return;
    }
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const zoom = Math.floor(currentMap.getZoom());
    const clusters = clusterRef.current.getClusters(bbox, zoom);
    
    console.log(`[MapView] Rendering ${clusters.length} clusters/markers at zoom ${zoom}`);

    clusters.forEach((cluster) => {
      if (cluster.properties.cluster) {
        // Render cluster marker
        const pointCount = cluster.properties.point_count;
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#00ff00';
        el.style.border = '3px solid #000';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '14px';
        el.style.color = '#000';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.6)';
        el.style.zIndex = '1000';
        el.textContent = pointCount.toString();

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]])
          .addTo(currentMap);

        el.addEventListener('click', () => {
          const expansionZoom = Math.min(
            clusterRef.current!.getClusterExpansionZoom(cluster.id as number),
            18
          );
          currentMap.easeTo({
            center: [cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]],
            zoom: expansionZoom,
          });
        });

        clusterMarkersRef.current.push(marker);
      } else {
        // Render individual place marker - all markers come from places data
        const place = cluster.properties.place as Place;
        if (!place || !place.latitude || !place.longitude || !place.id) {
          console.warn('[MapView] Invalid place in cluster (missing required fields):', place);
          return;
        }
        
        // Ensure this is a valid place from our places data
        if (!place.name || !place.slug) {
          console.warn('[MapView] Place missing name or slug:', place);
          return;
        }

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

        // Add click handler
        el.addEventListener('click', () => {
          onPlaceSelect(place);
        });
      }
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

    // Handle map load
    map.current.on('load', () => {
      console.log('[MapView] Map loaded successfully');
      setLoading(false);
      // Trigger marker initialization after map is loaded
      if (places.length > 0) {
        setTimeout(() => {
          const initializeMarkers = () => {
            if (!map.current || !map.current.loaded()) return;
            if (places.length === 0) return;
            
            const uniquePlaces = Array.from(
              new Map(places.map(p => [p.id, p])).values()
            );
            
            const points = uniquePlaces
              .filter((p) => p.latitude && p.longitude)
              .map((place) => ({
                type: 'Feature' as const,
                properties: { place },
                geometry: {
                  type: 'Point' as const,
                  coordinates: [place.longitude, place.latitude],
                },
              }));

            if (points.length === 0) return;

            clusterRef.current = new Supercluster({
              radius: 50,
              maxZoom: 16,
              minZoom: 0,
            });

            clusterRef.current.load(points);
            if (updateMarkersRef.current) {
              updateMarkersRef.current();
            }
          };
          initializeMarkers();
        }, 100);
      }
    });

    // Handle errors
    map.current.on('error', (e: any) => {
      console.error('[MapView] Map error:', e);
    });

    // Debounce marker updates to reduce unnecessary re-renders and API calls
    let updateTimeout: NodeJS.Timeout | null = null;
    const debouncedUpdateMarkers = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        if (map.current && map.current.loaded() && clusterRef.current && updateMarkersRef.current) {
          updateMarkersRef.current();
        }
      }, 150); // 150ms debounce to reduce API calls
    };

    map.current.on('moveend', debouncedUpdateMarkers);
    map.current.on('zoomend', debouncedUpdateMarkers);

    return () => {
      if (map.current) {
        map.current.remove();
      }
      markersRef.current.forEach((m) => m.remove());
      clusterMarkersRef.current.forEach((m) => m.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize clustering and markers
  useEffect(() => {
    const initializeMarkers = () => {
      if (!map.current) {
        console.log('[MapView] Map instance not available');
        return;
      }

      if (!map.current.loaded()) {
        console.log('[MapView] Map not loaded yet, will retry...');
        // Retry after a short delay
        setTimeout(() => {
          if (map.current && map.current.loaded()) {
            initializeMarkers();
          }
        }, 200);
        return;
      }

      if (places.length === 0) {
        console.log('[MapView] No places to display');
        return;
      }

      console.log(`[MapView] Initializing markers for ${places.length} places from places data`);
      
      // Filter to ensure we only use places with valid coordinates
      // Remove duplicates by place ID to prevent duplicate markers
      const uniquePlaces = Array.from(
        new Map(places.map(p => [p.id, p])).values()
      );
      
      const points = uniquePlaces
        .filter((p) => {
          const hasCoords = p.latitude && p.longitude;
          if (!hasCoords) {
            console.warn(`[MapView] Place ${p.id || p.name} missing coordinates - skipping marker`);
          }
          return hasCoords;
        })
        .map((place) => ({
          type: 'Feature' as const,
          properties: { place },
          geometry: {
            type: 'Point' as const,
            coordinates: [place.longitude, place.latitude],
          },
        }));

      console.log(`[MapView] Created ${points.length} unique place markers from ${uniquePlaces.length} places (${uniquePlaces.length - points.length} filtered out due to missing coordinates)`);

      if (points.length === 0) {
        console.warn('[MapView] No valid points to cluster');
        return;
      }

      clusterRef.current = new Supercluster({
        radius: 50,
        maxZoom: 16,
        minZoom: 0,
      });

      clusterRef.current.load(points);
      console.log('[MapView] Cluster loaded, updating markers');
      if (updateMarkersRef.current) {
        updateMarkersRef.current();
      }
    };

    // Only initialize if map is already loaded, otherwise wait for 'load' event
    if (map.current && map.current.loaded()) {
      initializeMarkers();
    } else {
      // Map will trigger initialization on 'load' event
      console.log('[MapView] Waiting for map to load before initializing markers');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  const updateMarkers = () => {
    const currentMap = map.current;
    if (!currentMap || !currentMap.loaded()) {
      console.warn('[MapView] Map not loaded, skipping marker update');
      return;
    }

    if (!clusterRef.current) {
      console.warn('[MapView] Cluster ref not initialized, skipping marker update');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    clusterMarkersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    clusterMarkersRef.current = [];

    const bounds = currentMap.getBounds();
    if (!bounds) {
      console.warn('[MapView] Map bounds not available, skipping marker update');
      return;
    }
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const zoom = Math.floor(currentMap.getZoom());
    const clusters = clusterRef.current.getClusters(bbox, zoom);
    
    console.log(`[MapView] Rendering ${clusters.length} clusters/markers at zoom ${zoom}`);

    clusters.forEach((cluster) => {
      if (cluster.properties.cluster) {
        // Render cluster marker
        const pointCount = cluster.properties.point_count;
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#00ff00';
        el.style.border = '3px solid #000';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '14px';
        el.style.color = '#000';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.6)';
        el.style.zIndex = '1000';
        el.textContent = pointCount.toString();

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]])
          .addTo(currentMap);

        el.addEventListener('click', () => {
          const expansionZoom = Math.min(
            clusterRef.current!.getClusterExpansionZoom(cluster.id as number),
            18
          );
          currentMap.easeTo({
            center: [cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]],
            zoom: expansionZoom,
          });
        });

        clusterMarkersRef.current.push(marker);
      } else {
        // Render individual place marker - all markers come from places data
        const place = cluster.properties.place as Place;
        if (!place || !place.latitude || !place.longitude || !place.id) {
          console.warn('[MapView] Invalid place in cluster (missing required fields):', place);
          return;
        }
        
        // Ensure this is a valid place from our places data
        if (!place.name || !place.slug) {
          console.warn('[MapView] Place missing name or slug:', place);
          return;
        }

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

        // Add click handler
        el.addEventListener('click', () => {
          onPlaceSelect(place);
        });
      }
    });
  };

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

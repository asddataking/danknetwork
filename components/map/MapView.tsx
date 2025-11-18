'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { type RequestTransformFunction, type RequestParameters, type ResourceType } from 'maplibre-gl';
import Supercluster from 'supercluster';
import { Place } from '@/types/place';

interface MapViewProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
}

export default function MapView({ places, selectedPlace, onPlaceSelect }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clusterMarkersRef = useRef<maplibregl.Marker[]>([]);
  const clusterRef = useRef<Supercluster | null>(null);
  const mapStyleRef = useRef<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN || '';

    // Debug: Log token info
    if (mapboxToken) {
      console.log('[MapView] Mapbox public token configured (length:', mapboxToken.length + ')');
      console.log('[MapView] Token starts with:', mapboxToken.substring(0, 10) + '...');
      // Decode token to verify which account it belongs to
      try {
        const tokenParts = mapboxToken.split('.');
        if (tokenParts.length >= 2) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const accountName = payload.u || 'unknown';
          console.log('[MapView] Token account:', accountName);
          if (accountName === 'dankndevour') {
            console.warn('[MapView] ⚠️ Still using dankndevour token - update NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN in Vercel');
          } else {
            console.log('[MapView] ✓ Using Dank Network token');
          }
        }
      } catch (e) {
        // Token decode failed, continue anyway
      }
    }

    // Initialize map with MapTiler or Mapbox (matching reference implementation exactly)
    // For Mapbox, the token is included in the style URL and also needs to be added to tile requests
    const mapStyle = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
      : mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/style.json?access_token=${mapboxToken}`
      : null;

    if (!mapStyle) {
      console.error('[MapView] No map provider configured. Please set NEXT_PUBLIC_MAPTILER_KEY or NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN');
      setLoading(false);
      return;
    }

    mapStyleRef.current = mapStyle;

    // For Mapbox styles with MapLibre GL, we need to add the token to all Mapbox requests
    // This includes tiles, sprites, glyphs, and other resources
    // MapLibre GL doesn't have mapboxgl.accessToken like Mapbox GL JS, so we use transformRequest
    // According to MapLibre GL JS docs: RequestTransformFunction = (url: string, resourceType?: ResourceType) => RequestParameters | undefined
    const transformRequest: RequestTransformFunction | undefined = mapboxToken && !maptilerKey
      ? (url: string, resourceType?: ResourceType): RequestParameters | undefined => {
          // Add token to all Mapbox API requests (tiles, sprites, glyphs, etc.)
          if (url.includes('api.mapbox.com') && !url.includes('access_token=')) {
            const separator = url.includes('?') ? '&' : '?';
            return {
              url: `${url}${separator}access_token=${mapboxToken}`,
            };
          }
          return { url };
        }
      : undefined;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle as any,
      center: [-84.5467, 44.3148],
      zoom: 6,
      transformRequest,
    });

    // Add navigation controls (matching reference exactly)
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add geolocate control (matching reference exactly)
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    );

    // Handle map load (matching reference exactly)
    map.current.on('load', () => {
      console.log('[MapView] Map loaded successfully');
      setLoading(false);
    });

    // Handle style loading errors
    map.current.on('style.loading', () => {
      console.log('[MapView] Style loading...');
    });

    // Handle errors - but don't block map rendering
    // The map may still work even if style.json returns 404 initially
    map.current.on('error', (e: any) => {
      console.error('[MapView] Map error:', e);
      if (e.error?.status === 404) {
        console.error('[MapView] 404 error - Mapbox style not accessible');
        console.error('[MapView] Solution: Create a NEW public token in Dank Network account');
        console.error('1. Go to Dank Network Mapbox account → Access Tokens');
        console.error('2. Create a NEW public token (don\'t refresh the existing one)');
        console.error('3. Set URL restrictions to include "*.vercel.app" and your production domain');
        console.error('4. Update NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN in Vercel with the new token');
        console.error('5. This keeps dankndevour working with its token, and Dank Network has its own');
        // Don't set loading to false - let map continue trying
        // MapLibre may retry or use cached style
      }
    });

    // Handle style errors separately
    map.current.on('style.error', (e: any) => {
      console.error('[MapView] Style error:', e);
      // Still don't block - map might render with default style
    });

    map.current.on('moveend', () => {
      if (map.current && map.current.loaded() && clusterRef.current) {
        updateMarkers();
      }
    });

    map.current.on('zoomend', () => {
      if (map.current && map.current.loaded() && clusterRef.current) {
        updateMarkers();
      }
    });

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

      console.log(`[MapView] Initializing markers for ${places.length} places`);
      
      const points = places
        .filter((p) => {
          const hasCoords = p.latitude && p.longitude;
          if (!hasCoords) {
            console.warn(`[MapView] Place ${p.id || p.name} missing coordinates`);
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

      console.log(`[MapView] Created ${points.length} points for clustering`);

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
      updateMarkers();
    };

    // Wait a bit for map to be ready, then initialize
    const timer = setTimeout(() => {
      initializeMarkers();
    }, 300);

    return () => clearTimeout(timer);
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

        const marker = new maplibregl.Marker({ element: el })
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
        // Render individual place marker
        const place = cluster.properties.place as Place;
        if (!place || !place.latitude || !place.longitude) {
          console.warn('[MapView] Invalid place in cluster:', place);
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
    if (map.current && map.current.loaded()) {
      updateMarkers();
      
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


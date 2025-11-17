'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN || '';

    // Only use Mapbox - require valid token
    if (!mapboxToken) {
      console.error('[MapView] NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN is not set');
      setLoading(false);
      return;
    }

    if (!mapboxToken.startsWith('pk.')) {
      console.error('[MapView] Invalid Mapbox token format. Token must start with "pk."');
      setLoading(false);
      return;
    }

    const mapStyle = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/style.json?access_token=${mapboxToken}`;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-84.5467, 44.3148],
      zoom: 6,
    });

    let mapFullyLoaded = false;

    const handleMapReady = () => {
      if (!mapFullyLoaded && map.current && map.current.loaded()) {
        mapFullyLoaded = true;
        setLoading(false);
        console.log('[MapView] Mapbox map fully loaded and ready');
        // Trigger marker initialization if places are available
        if (places.length > 0 && clusterRef.current) {
          setTimeout(() => {
            updateMarkers();
          }, 100);
        }
      }
    };

    // Handle initial map load
    map.current.on('load', () => {
      console.log('[MapView] Mapbox load event fired');
      handleMapReady();
    });

    // Handle style load
    map.current.on('style.load', () => {
      console.log('[MapView] Mapbox style loaded');
      handleMapReady();
    });

    // Handle map errors
    map.current.on('error', (e: any) => {
      console.error('[MapView] Mapbox error:', e);
      setLoading(false);
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    // Handle style loading
    map.current.on('style.loading', () => {
      console.log('[MapView] Mapbox style loading...');
      mapFullyLoaded = false;
    });

    map.current.on('style.error', (e: any) => {
      console.error('[MapView] Mapbox style loading error:', e);
      console.error('[MapView] Please check your NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN in Vercel environment variables');
      setLoading(false);
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
        
        const isSelected = selectedPlace?.id === place.id;

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = place.is_verified ? '24px' : '20px';
        el.style.height = place.is_verified ? '24px' : '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = isSelected
          ? '#00ff00'
          : place.is_verified
          ? '#00ff00'
          : '#00cc00';
        el.style.border = isSelected ? '4px solid #fff' : '3px solid #000';
        el.style.cursor = 'pointer';
        el.style.boxShadow = isSelected
          ? '0 0 15px rgba(0, 255, 0, 1)'
          : place.is_verified
          ? '0 0 10px rgba(0, 255, 0, 0.8)'
          : '0 0 5px rgba(0, 204, 0, 0.5)';
        el.style.transition = 'all 0.2s';
        el.style.zIndex = isSelected ? '1001' : '1000';
        el.style.position = 'relative';

        // Determine if this is a dispensary or restaurant
        const isDispensary = place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis');
        const placeType = isDispensary ? 'Dispensary' : 'Restaurant';

        // Create popup for click
        const clickPopup = new maplibregl.Popup({ 
          offset: 25, 
          className: 'map-popup',
          closeButton: true,
          closeOnClick: false,
        }).setHTML(`
          <div class="text-black p-3 min-w-[200px]">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <h3 class="font-bold text-lg">${place.name}</h3>
                <span class="text-xs text-gray-500 uppercase">${placeType}</span>
              </div>
              ${place.is_verified ? '<span class="text-xs bg-green-500 text-white px-2 py-1 rounded">✓ Verified</span>' : ''}
            </div>
            ${place.address ? `<p class="text-sm text-gray-600 mb-1">${place.address}</p>` : ''}
            ${place.city ? `<p class="text-sm text-gray-600 mb-1">${place.city}${place.state ? `, ${place.state}` : ''}</p>` : ''}
            ${place.rating ? `<p class="text-sm text-gray-600 mb-1">⭐ ${place.rating.toFixed(1)}</p>` : ''}
            ${place.cuisines && place.cuisines.length > 0 ? `<p class="text-xs text-gray-500 mt-2">${place.cuisines.filter((c: string) => c !== 'Cannabis').join(', ') || place.cuisines.join(', ')}</p>` : ''}
            ${place.tags && place.tags.length > 0 ? `<p class="text-xs text-gray-400 mt-1">${place.tags.filter((t: string) => !t.includes('Featured') && t !== 'Dispensary' && t !== 'Michigan Munchie Map').slice(0, 3).join(' • ')}</p>` : ''}
            <div class="mt-3 flex gap-2">
              ${place.slug ? `<a href="/place/${place.slug}" class="text-xs bg-neon-green text-black px-3 py-1 rounded font-bold hover:bg-neon-green-dark transition-colors">View Details</a>` : ''}
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

        // Create hover popup (simpler, just name and type)
        const hoverPopup = new maplibregl.Popup({ 
          offset: 25, 
          className: 'map-popup',
          closeButton: false,
          closeOnClick: false,
        }).setHTML(`
          <div class="text-black p-2 min-w-[150px]">
            <h3 class="font-bold text-base">${place.name}</h3>
            <span class="text-xs text-gray-500 uppercase">${placeType}</span>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(clickPopup)
          .addTo(currentMap);
        
        console.log(`[MapView] Added marker for ${place.name} at [${place.longitude}, ${place.latitude}]`);

        // Show hover popup on mouseenter, hide on mouseout
        let hoverPopupOpen = false;
        el.addEventListener('mouseenter', () => {
          if (!hoverPopupOpen) {
            hoverPopup.setLngLat([place.longitude, place.latitude]).addTo(currentMap);
            hoverPopupOpen = true;
          }
        });

        el.addEventListener('mouseleave', () => {
          if (hoverPopupOpen) {
            hoverPopup.remove();
            hoverPopupOpen = false;
          }
        });

        el.addEventListener('click', () => {
          onPlaceSelect(place);
          // Close hover popup if open
          if (hoverPopupOpen) {
            hoverPopup.remove();
            hoverPopupOpen = false;
          }
          // Open click popup
          marker.togglePopup();
        });

        markersRef.current.push(marker);
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


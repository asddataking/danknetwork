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

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN || '';

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
      center: [-84.5467, 44.3148],
      zoom: 6,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setLoading(false);
      updateMarkers();
    });

    map.current.on('moveend', () => {
      updateMarkers();
    });

    map.current.on('zoomend', () => {
      updateMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
      markersRef.current.forEach((m) => m.remove());
      clusterMarkersRef.current.forEach((m) => m.remove());
    };
  }, []);

  // Initialize clustering
  useEffect(() => {
    if (places.length > 0 && map.current && map.current.loaded()) {
      const points = places
        .filter((p) => p.latitude && p.longitude)
        .map((place) => ({
          type: 'Feature' as const,
          properties: { place },
          geometry: {
            type: 'Point' as const,
            coordinates: [place.longitude, place.latitude],
          },
        }));

      clusterRef.current = new Supercluster({
        radius: 50,
        maxZoom: 16,
        minZoom: 0,
      });

      clusterRef.current.load(points);
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  const updateMarkers = () => {
    const currentMap = map.current;
    if (!currentMap || !currentMap.loaded() || !clusterRef.current) return;

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
        el.textContent = pointCount.toString();

        const marker = new maplibregl.Marker(el)
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
        const isSelected = selectedPlace?.id === place.id;

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = place.is_verified ? '26px' : '22px';
        el.style.height = place.is_verified ? '26px' : '22px';
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

        el.addEventListener('click', () => {
          onPlaceSelect(place);
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


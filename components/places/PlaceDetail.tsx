'use client';

import { Place } from '@/types/place';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

interface PlaceDetailProps {
  place: Place;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  // Validate place data early
  if (!place || !place.id || !place.name) {
    console.error('[PlaceDetail] Invalid place data:', place);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-neon-green text-2xl mb-4">Invalid Place Data</h1>
          <p className="text-gray-400 mb-6">
            The place data is missing required information. Please try again.
          </p>
          <Link
            href="/munchie-map"
            className="bg-neon-green text-black px-6 py-3 rounded-lg font-bold uppercase hover:bg-neon-green-dark transition-colors inline-block"
          >
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Fetch nearby places
    const fetchNearbyPlaces = async () => {
      if (!place?.latitude || !place?.longitude || place.latitude === 0 || place.longitude === 0) {
        setLoadingNearby(false);
        return;
      }

      try {
        // Create a bounding box around the current place (roughly 10km radius)
        const radius = 0.1; // ~10km in degrees
        const minLng = place.longitude - radius;
        const maxLng = place.longitude + radius;
        const minLat = place.latitude - radius;
        const maxLat = place.latitude + radius;

        const response = await fetch(
          `/api/places?bbox=${minLng},${minLat},${maxLng},${maxLat}`
        );

        if (response.ok) {
          const data = await response.json();
          // Filter out the current place and limit to 6 nearby places
          const nearby = (data.places || [])
            .filter((p: Place) => p.id !== place.id && p.slug)
            .slice(0, 6);
          setNearbyPlaces(nearby);
        }
      } catch (error) {
        console.error('Error fetching nearby places:', error);
        // Don't show error to user for nearby places failure
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchNearbyPlaces();
  }, [place]);

  const isDispensary = place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis');
  const placeType = isDispensary ? 'Dispensary' : 'Restaurant';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Overlay Content */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px] bg-dark-surface overflow-hidden">
        {place.hero_image_url ? (
          <img
            src={place.hero_image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="text-center">
              <span className="text-gray-600 text-8xl block mb-4">📍</span>
              <p className="text-gray-500 text-sm uppercase tracking-wider">No Image Available</p>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 z-10">
          <Link
            href="/munchie-map"
            className="bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white px-4 py-2.5 rounded-lg font-bold uppercase transition-all flex items-center gap-2 text-sm shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Map</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${place.name || ''} ${place.address || ''} ${place.city || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white px-4 py-2.5 rounded-lg font-bold uppercase transition-all flex items-center gap-2 text-sm shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="hidden sm:inline">Directions</span>
            <span className="sm:hidden">Dir</span>
          </a>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              {place.is_featured && (
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                  Featured
                </span>
              )}
              {place.is_verified && (
                <span className="bg-neon-green text-black px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                  ✓ Verified
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                {placeType}
              </span>
            </div>
            <h1 className="text-white font-black text-4xl sm:text-5xl lg:text-6xl uppercase mb-4 drop-shadow-2xl">
              {place.name || 'Unnamed Place'}
            </h1>
            <div className="flex items-center gap-6 flex-wrap">
              {place.rating && (
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-yellow-400 text-xl">⭐</span>
                  <span className="text-white text-lg font-bold">{place.rating.toFixed(1)}</span>
                </div>
              )}
              {place.price_level && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-neon-green font-bold text-lg">
                    {'$'.repeat(place.price_level)}
                  </span>
                </div>
              )}
              {place.address && (
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white text-sm">
                    {place.city}{place.state && `, ${place.state}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Place Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Address Card */}
              {place.address && (
                <div className="bg-dark-surface rounded-xl border border-neon-green/20 p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-neon-green/20 p-2 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Address</h3>
                      <p className="text-white font-semibold">{place.address}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {place.city || ''}
                        {place.city && place.state && ', '}
                        {place.state || ''}
                        {place.county && `, ${place.county} County`}
                        {place.zip && ` ${place.zip}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Card */}
              {(place.phone || place.website) && (
                <div className="bg-dark-surface rounded-xl border border-neon-green/20 p-5 shadow-lg">
                  <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Contact</h3>
                  <div className="space-y-2">
                    {place.phone && (
                      <a
                        href={`tel:${place.phone}`}
                        className="flex items-center gap-2 text-neon-green hover:text-neon-green-dark transition-colors group"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm font-semibold group-hover:underline">{place.phone}</span>
                      </a>
                    )}
                    {place.website && (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-neon-green hover:text-neon-green-dark transition-colors group"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="text-sm font-semibold group-hover:underline">Visit Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cuisines & Tags */}
            {(place.cuisines?.length > 0 || place.tags?.length > 0) && (
              <div className="bg-dark-surface rounded-xl border border-neon-green/20 p-6 shadow-lg">
                <div className="grid sm:grid-cols-2 gap-6">
                  {place.cuisines && place.cuisines.length > 0 && (
                    <div>
                      <h3 className="text-neon-green font-bold text-lg uppercase mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Cuisines
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {place.cuisines.map((cuisine, idx) => (
                          <span
                            key={idx}
                            className="bg-neon-green/20 text-neon-green px-4 py-2 rounded-lg uppercase text-sm font-bold border border-neon-green/30"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {place.tags && place.tags.length > 0 && (
                    <div>
                      <h3 className="text-neon-green font-bold text-lg uppercase mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {place.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-800/50 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hours */}
            {place.hours && Object.keys(place.hours).length > 0 && (
              <div className="bg-dark-surface rounded-xl border border-neon-green/20 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-neon-green/20 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-neon-green font-bold text-lg uppercase">Hours</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(place.hours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                      <span className="font-semibold text-white capitalize">{day}</span>
                      <span className="text-gray-300">{hours || <span className="text-gray-500">Closed</span>}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="flex-1 sm:flex-none bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-all uppercase text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-neon-green/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none bg-dark-surface border-2 border-neon-green text-neon-green px-6 py-3 rounded-lg font-bold hover:bg-neon-green/10 transition-all uppercase text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Map, DankPass, Nearby Places */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Map */}
            {place.latitude && place.longitude && (
              <div className="bg-dark-surface rounded-xl border border-neon-green/20 p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-neon-green/20 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-neon-green font-bold text-lg uppercase">Location</h3>
                </div>
                <div className="h-64 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                  <MapView
                    places={[place]}
                    selectedPlace={place}
                    onPlaceSelect={() => {}}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${place.name || ''} ${place.address || ''} ${place.city || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full bg-neon-green text-black px-4 py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-all uppercase text-center text-sm shadow-lg hover:shadow-neon-green/50"
                >
                  Get Directions
                </a>
              </div>
            )}

            {/* DankPass Section */}
            <div className="bg-gradient-to-br from-neon-green/10 to-neon-green/5 rounded-xl border-2 border-neon-green/30 p-6 shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-neon-green/30">
                  <span className="text-4xl">🎟️</span>
                </div>
                <h3 className="text-neon-green font-black text-xl uppercase mb-2">
                  Earn Points. Unlock Perks.
                </h3>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Join DankPass and start earning rewards for every visit and interaction.
                </p>
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-all uppercase text-sm shadow-lg hover:shadow-neon-green/50"
                >
                  Join DankPass
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Nearby Places */}
            {nearbyPlaces.length > 0 && (
              <div className="bg-dark-surface rounded-xl border border-neon-green/20 p-5 shadow-lg">
                <h3 className="text-neon-green font-bold text-lg uppercase mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Nearby Places
                </h3>
                <div className="space-y-3">
                  {nearbyPlaces.map((nearbyPlace) => (
                    <Link
                      key={nearbyPlace.id}
                      href={`/place/${nearbyPlace.slug}`}
                      className="block bg-black/50 rounded-lg p-3 hover:bg-black/70 transition-all border border-gray-800 hover:border-neon-green/30 group"
                    >
                      <div className="flex items-start gap-3">
                        {nearbyPlace.hero_image_url ? (
                          <img
                            src={nearbyPlace.hero_image_url}
                            alt={nearbyPlace.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-700 group-hover:border-neon-green/50 transition-colors"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-700">
                            <span className="text-gray-600 text-xl">📍</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-white font-bold text-sm uppercase truncate group-hover:text-neon-green transition-colors">
                              {nearbyPlace.name}
                            </h4>
                            {nearbyPlace.is_verified && (
                              <span className="bg-neon-green text-black px-2 py-0.5 rounded text-xs font-bold uppercase flex-shrink-0">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs truncate mb-2">
                            {nearbyPlace.city || ''}
                            {nearbyPlace.city && nearbyPlace.state && ', '}
                            {nearbyPlace.state || ''}
                          </p>
                          <div className="flex items-center gap-3">
                            {nearbyPlace.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400 text-xs">⭐</span>
                                <span className="text-white text-xs font-bold">{nearbyPlace.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {nearbyPlace.price_level && (
                              <span className="text-neon-green text-xs font-bold">
                                {'$'.repeat(nearbyPlace.price_level)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

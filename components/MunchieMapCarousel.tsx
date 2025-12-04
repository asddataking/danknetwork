'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Place } from '@/types/place';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export default function MunchieMapCarousel() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch('/api/places');
        const data = await response.json();
        // Get places for carousel (prioritize featured)
        const allPlaces = data.places || [];
        const featuredPlaces = allPlaces.filter((p: Place) => p.is_featured);
        const otherPlaces = allPlaces.filter((p: Place) => !p.is_featured);
        const limitedPlaces = [...featuredPlaces, ...otherPlaces].slice(0, 12);
        setPlaces(limitedPlaces);
      } catch (error) {
        console.error('[MunchieMapCarousel] Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  // Calculate how many cards to show based on screen size
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1; // Mobile: 1 card
    if (window.innerWidth < 1024) return 2; // Tablet: 2 cards
    return 3; // Desktop: 3 cards
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
      // Reset to first slide on resize to avoid empty space
      setCurrentIndex(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, places.length - cardsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // Auto-advance carousel
  useEffect(() => {
    if (places.length <= cardsPerView) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [places.length, cardsPerView, maxIndex]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Munchie Map</h2>
        </div>
        <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-12 text-center">
          <div className="text-neon-green text-lg mb-4 font-bold uppercase">Loading Places...</div>
          <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Munchie Map</h2>
          <Link
            href="/munchie-map"
            className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            Explore Map
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-dark-surface rounded-lg border-2 border-neon-green/30 p-12 text-center">
          <p className="text-gray-400 text-lg">No places available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-neon-green" />
          <h2 className="text-neon-green font-bold text-2xl uppercase">Munchie Map</h2>
        </div>
        <Link
          href="/munchie-map"
          className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors group"
        >
          Explore Map
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Navigation Arrows */}
        {places.length > cardsPerView && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-neon-green/90 hover:bg-neon-green text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden lg:flex items-center justify-center"
              aria-label="Previous places"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-neon-green/90 hover:bg-neon-green text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden lg:flex items-center justify-center"
              aria-label="Next places"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Carousel */}
        <div 
          ref={carouselRef}
          className="overflow-hidden rounded-lg"
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
            }}
          >
            {places.map((place) => {
              const isFeatured = place.is_featured;
              return (
                <div
                  key={place.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div
                    className={`bg-dark-surface rounded-lg border-2 overflow-hidden transition-all duration-300 hover:border-neon-green/60 hover:shadow-lg hover:shadow-neon-green/20 h-full ${
                      isFeatured
                        ? 'border-orange-500/50 shadow-lg shadow-orange-500/20'
                        : 'border-neon-green/30'
                    }`}
                  >
                    {/* Hero Image */}
                    <div className="relative h-32 sm:h-40 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                      {place.hero_image_url ? (
                        <img
                          src={place.hero_image_url}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {place.is_verified && (
                          <span className="bg-neon-green text-black px-2 py-1 rounded text-xs font-bold shadow-lg">
                            ✓ Verified
                          </span>
                        )}
                        {place.is_featured && (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className={`font-bold text-lg line-clamp-1 mb-1 ${isFeatured ? 'text-orange-400' : 'text-white'}`}>
                          {place.name}
                        </h3>
                        {/* Show type */}
                        <div className="flex items-center gap-2 mb-2">
                          {(place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis')) ? (
                            <span className={`text-xs uppercase font-semibold ${isFeatured ? 'text-orange-300' : 'text-neon-green'}`}>
                              Dispensary
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 uppercase font-semibold">Restaurant</span>
                          )}
                          {place.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-neon-green text-sm">⭐</span>
                              <span className="text-white text-sm font-semibold">{place.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        {place.address && (
                          <p className="text-gray-400 text-xs line-clamp-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {place.address}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs">
                          {place.city}
                          {place.state && `, ${place.state}`}
                        </p>
                      </div>

                      {place.cuisines && place.cuisines.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mb-3">
                          {place.cuisines.slice(0, 2).map((cuisine, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                                isFeatured 
                                  ? 'bg-orange-500/20 text-orange-300' 
                                  : 'bg-neon-green/20 text-neon-green'
                              }`}
                            >
                              {cuisine}
                            </span>
                          ))}
                          {place.cuisines.length > 2 && (
                            <span className="text-gray-500 text-xs">+{place.cuisines.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        {place.slug && (
                          <Link
                            href={`/place/${place.slug}`}
                            className={`text-xs px-4 py-2 rounded font-bold hover:opacity-90 transition-opacity uppercase flex-1 text-center ${
                              isFeatured
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-neon-green text-black hover:bg-neon-green-dark'
                            }`}
                          >
                            View
                          </Link>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${place.name} ${place.address || ''} ${place.city || ''}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs border px-4 py-2 rounded font-bold hover:bg-opacity-10 transition-colors uppercase ${
                            isFeatured
                              ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
                              : 'border-neon-green/50 text-neon-green hover:bg-neon-green/10'
                          }`}
                        >
                          Directions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        {places.length > cardsPerView && (
          <div className="flex items-center justify-center gap-2 mt-4 lg:hidden">
            <button
              onClick={goToPrevious}
              className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green p-2 rounded-full transition-colors"
              aria-label="Previous places"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(places.length / cardsPerView) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * cardsPerView)}
                  className={`h-2 rounded-full transition-all ${
                    Math.floor(currentIndex / cardsPerView) === idx
                      ? 'bg-neon-green w-6'
                      : 'bg-neon-green/30 w-2'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goToNext}
              className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green p-2 rounded-full transition-colors"
              aria-label="Next places"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Desktop Dots Indicator */}
        {places.length > cardsPerView && (
          <div className="hidden lg:flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(places.length / cardsPerView) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(Math.min(idx * cardsPerView, maxIndex))}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / cardsPerView) === idx
                    ? 'bg-neon-green w-8'
                    : 'bg-neon-green/30 w-2 hover:bg-neon-green/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


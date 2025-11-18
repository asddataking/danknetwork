'use client';

import { useState, useEffect } from 'react';

interface CuisineFilterProps {
  selected: string[];
  onChange: (cuisines: string[]) => void;
}

// Fallback cuisines if API fails
const FALLBACK_CUISINES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'Mediterranean',
  'BBQ', 'Burgers', 'Pizza', 'Seafood', 'Vegetarian', 'Vegan', 'Breakfast', 'Dessert',
];

export default function CuisineFilter({ selected, onChange }: CuisineFilterProps) {
  const [cuisines, setCuisines] = useState<string[]>(FALLBACK_CUISINES);

  // Fetch cuisines from API
  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await fetch('/api/filter-options');
        if (response.ok) {
          const data = await response.json();
          if (data.cuisines && data.cuisines.length > 0) {
            setCuisines(data.cuisines);
          }
        }
      } catch (error) {
        console.error('Error fetching cuisines:', error);
        // Use fallback cuisines on error
      }
    };

    fetchCuisines();
  }, []);
  const toggleCuisine = (cuisine: string) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter((c) => c !== cuisine));
    } else {
      onChange([...selected, cuisine]);
    }
  };

  return (
    <div>
      <label className="block text-neon-green text-sm font-bold uppercase mb-2">
        Cuisines {selected.length > 0 && `(${selected.length})`}
      </label>
      <div className="flex flex-wrap gap-2">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => toggleCuisine(cuisine)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold uppercase transition-colors ${
              selected.includes(cuisine)
                ? 'bg-neon-green text-black'
                : 'bg-black border border-neon-green/30 text-white hover:border-neon-green'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>
    </div>
  );
}


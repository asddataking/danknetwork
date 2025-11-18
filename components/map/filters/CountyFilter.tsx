'use client';

import { useState, useEffect } from 'react';

interface CountyFilterProps {
  selected: string[];
  onChange: (counties: string[]) => void;
}

// Fallback counties if API fails
const FALLBACK_COUNTIES = [
  'Wayne', 'Oakland', 'Macomb', 'Kent', 'Genesee', 'Washtenaw', 'Ingham', 'Kalamazoo',
  'Saginaw', 'Muskegon', 'Livingston', 'St. Clair', 'Berrien', 'Calhoun', 'Jackson',
  'Ottawa', 'Monroe', 'Bay', 'Lenawee', 'Allegan', 'Eaton', 'Ionia', 'Van Buren',
];

export default function CountyFilter({ selected, onChange }: CountyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [counties, setCounties] = useState<string[]>(FALLBACK_COUNTIES);

  // Fetch counties from API
  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const response = await fetch('/api/filter-options');
        if (response.ok) {
          const data = await response.json();
          if (data.counties && data.counties.length > 0) {
            setCounties(data.counties);
          }
        }
      } catch (error) {
        console.error('Error fetching counties:', error);
        // Use fallback counties on error
      }
    };

    fetchCounties();
  }, []);

  const toggleCounty = (county: string) => {
    if (selected.includes(county)) {
      onChange(selected.filter((c) => c !== county));
    } else {
      onChange([...selected, county]);
    }
  };

  return (
    <div>
      <label className="block text-neon-green text-sm font-bold uppercase mb-2">
        Counties {selected.length > 0 && `(${selected.length})`}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black border-2 border-neon-green/30 rounded-lg px-4 py-2 text-white text-left flex items-center justify-between hover:border-neon-green transition-colors"
        >
          <span>{selected.length > 0 ? `${selected.length} selected` : 'Select counties'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-dark-surface border-2 border-neon-green/30 rounded-lg max-h-60 overflow-y-auto">
            <div className="p-2 space-y-1">
              {counties.map((county) => (
                <label
                  key={county}
                  className="flex items-center gap-2 p-2 hover:bg-neon-green/10 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(county)}
                    onChange={() => toggleCounty(county)}
                    className="w-4 h-4 text-neon-green bg-black border-neon-green rounded focus:ring-neon-green"
                  />
                  <span className="text-white text-sm">{county}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';

interface TagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

// Common tags - will be enhanced with API data
const DEFAULT_TAGS = [
  'Dispensary', 'Featured Restaurant', 'Featured Dispensary',
  'Outdoor Seating', 'Family Friendly', 'Pet Friendly', 'Late Night', 'Happy Hour',
  'Live Music', 'Sports Bar', 'Delivery', 'Takeout', 'Wheelchair Accessible',
  'Michigan Munchie Map', 'User Submission',
];

export default function TagFilter({ selected, onChange }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);

  // Fetch available tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Get a sample of places to extract unique tags
        const response = await fetch('/api/places?limit=100');
        if (response.ok) {
          const data = await response.json();
          const places = data.places || [];
          
          // Extract unique tags from all places
          const allTags = new Set<string>();
          places.forEach((place: any) => {
            if (place.tags && Array.isArray(place.tags)) {
              place.tags.forEach((tag: string) => allTags.add(tag));
            }
          });
          
          // Combine with default tags and sort
          const combinedTags = Array.from(new Set([...DEFAULT_TAGS, ...Array.from(allTags)]));
          setAvailableTags(combinedTags.sort());
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Use default tags on error
      }
    };

    fetchTags();
  }, []);
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div>
      <label className="block text-neon-green text-sm font-bold uppercase mb-2">
        Tags {selected.length > 0 && `(${selected.length})`}
      </label>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold uppercase transition-colors ${
              selected.includes(tag)
                ? 'bg-neon-green text-black'
                : 'bg-black border border-neon-green/30 text-white hover:border-neon-green'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}


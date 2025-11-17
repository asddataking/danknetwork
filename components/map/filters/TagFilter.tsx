'use client';

interface TagFilterProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

// Common tags - in production, fetch from API
const COMMON_TAGS = [
  'Outdoor Seating', 'Family Friendly', 'Pet Friendly', 'Late Night', 'Happy Hour',
  'Live Music', 'Sports Bar', 'Dispensary', 'Delivery', 'Takeout', 'Wheelchair Accessible',
];

export default function TagFilter({ selected, onChange }: TagFilterProps) {
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
      <div className="flex flex-wrap gap-2">
        {COMMON_TAGS.map((tag) => (
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


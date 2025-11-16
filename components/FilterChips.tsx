'use client';

interface FilterChipsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'danknddevour', label: "Dank'N'Devour" },
  { id: 'recipes', label: 'Dank Recipes' },
  { id: 'sports', label: 'Dank Sports' },
  { id: 'high & hungry', label: 'High & Hungry' },
  { id: 'road trip', label: 'Road Trip' },
  { id: 'game day', label: 'Game Day' },
];

export default function FilterChips({ selectedFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedFilter === filter.id
              ? 'bg-accent-turquoise text-dark-bg'
              : 'bg-dark-surface text-gray-300 hover:bg-gray-800 border border-gray-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}


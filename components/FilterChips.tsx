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
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
            selectedFilter === filter.id
              ? 'bg-gradient-turquoise text-dark-bg shadow-lg shadow-accent-turquoise/30 scale-105'
              : 'bg-dark-surface text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50 hover:border-accent-turquoise/30 hover:scale-105'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}


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
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
            selectedFilter === filter.id
              ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30 scale-105'
              : 'bg-dark-surface text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50 hover:border-neon-green/30 hover:scale-105'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}


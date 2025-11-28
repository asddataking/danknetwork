'use client';

type ViewMode = 'map' | 'list' | 'split';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="text-gray-400 text-xs sm:text-sm font-bold uppercase mr-1 sm:mr-2 hidden sm:inline">View:</span>
      <button
        onClick={() => onViewModeChange('map')}
        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm uppercase transition-colors ${
          viewMode === 'map'
            ? 'bg-neon-green text-black'
            : 'bg-dark-surface text-white border border-neon-green/30 hover:border-neon-green'
        }`}
        aria-label="Map view"
      >
        Map
      </button>
      <button
        onClick={() => onViewModeChange('split')}
        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm uppercase transition-colors hidden md:inline-flex ${
          viewMode === 'split'
            ? 'bg-neon-green text-black'
            : 'bg-dark-surface text-white border border-neon-green/30 hover:border-neon-green'
        }`}
        aria-label="Split view"
      >
        Split
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm uppercase transition-colors ${
          viewMode === 'list'
            ? 'bg-neon-green text-black'
            : 'bg-dark-surface text-white border border-neon-green/30 hover:border-neon-green'
        }`}
        aria-label="List view"
      >
        List
      </button>
    </div>
  );
}


'use client';

type ViewMode = 'map' | 'list' | 'split';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm font-bold uppercase mr-2">View:</span>
      <button
        onClick={() => onViewModeChange('map')}
        className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-colors ${
          viewMode === 'map'
            ? 'bg-neon-green text-black'
            : 'bg-dark-surface text-white border border-neon-green/30 hover:border-neon-green'
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onViewModeChange('split')}
        className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-colors ${
          viewMode === 'split'
            ? 'bg-neon-green text-black'
            : 'bg-dark-surface text-white border border-neon-green/30 hover:border-neon-green'
        }`}
      >
        Split
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-colors ${
          viewMode === 'list'
            ? 'bg-neon-green text-black'
            : 'bg-dark-surface text-white border border-neon-green/30 hover:border-neon-green'
        }`}
      >
        List
      </button>
    </div>
  );
}


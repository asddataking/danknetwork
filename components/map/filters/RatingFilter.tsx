'use client';

interface RatingFilterProps {
  value?: number;
  onChange: (rating: number | undefined) => void;
}

export default function RatingFilter({ value, onChange }: RatingFilterProps) {
  return (
    <div>
      <label className="block text-neon-green text-sm font-bold uppercase mb-2">
        Minimum Rating {value && `(${value}+)`}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={value || 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || undefined)}
          className="flex-1 h-2 bg-black border border-neon-green/30 rounded-lg appearance-none cursor-pointer accent-neon-green"
        />
        <span className="text-white font-bold min-w-[3rem] text-right">
          {value ? value.toFixed(1) : 'Any'}
        </span>
      </div>
    </div>
  );
}


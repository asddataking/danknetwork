'use client';

interface PriceFilterProps {
  min?: number;
  max?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export default function PriceFilter({ min, max, onChange }: PriceFilterProps) {
  return (
    <div>
      <label className="block text-neon-green text-sm font-bold uppercase mb-2">
        Price Range
      </label>
      <div className="flex items-center gap-2">
        <select
          value={min || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined, max)}
          className="flex-1 bg-black border-2 border-neon-green/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green"
        >
          <option value="">Min</option>
          <option value="1">$</option>
          <option value="2">$$</option>
          <option value="3">$$$</option>
          <option value="4">$$$$</option>
        </select>
        <span className="text-gray-400">-</span>
        <select
          value={max || ''}
          onChange={(e) => onChange(min, e.target.value ? parseInt(e.target.value) : undefined)}
          className="flex-1 bg-black border-2 border-neon-green/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green"
        >
          <option value="">Max</option>
          <option value="1">$</option>
          <option value="2">$$</option>
          <option value="3">$$$</option>
          <option value="4">$$$$</option>
        </select>
      </div>
    </div>
  );
}


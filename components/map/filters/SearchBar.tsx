'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div>
      <label className="block text-neon-green text-sm font-bold uppercase mb-2">
        Search Places
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, address, or city..."
        className="w-full bg-black border-2 border-neon-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green transition-colors"
      />
    </div>
  );
}


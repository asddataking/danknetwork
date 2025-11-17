'use client';

import { useState } from 'react';

interface MapFiltersProps {
  onFilterChange: (filters: any) => void;
}

export default function MapFilters({ onFilterChange }: MapFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showVerified, setShowVerified] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilterChange({
      search: value,
      verified: showVerified || undefined,
      featured: showFeatured || undefined,
    });
  };

  const handleVerifiedToggle = (checked: boolean) => {
    setShowVerified(checked);
    onFilterChange({
      search: searchTerm || undefined,
      verified: checked || undefined,
      featured: showFeatured || undefined,
    });
  };

  const handleFeaturedToggle = (checked: boolean) => {
    setShowFeatured(checked);
    onFilterChange({
      search: searchTerm || undefined,
      verified: showVerified || undefined,
      featured: checked || undefined,
    });
  };

  return (
    <div className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-4 mb-4">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-neon-green text-sm font-bold uppercase mb-2">
            Search Places
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, address, or city..."
            className="w-full bg-black border-2 border-neon-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showVerified}
              onChange={(e) => handleVerifiedToggle(e.target.checked)}
              className="w-4 h-4 text-neon-green bg-black border-neon-green rounded focus:ring-neon-green"
            />
            <span className="text-white text-sm font-bold uppercase">Verified Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => handleFeaturedToggle(e.target.checked)}
              className="w-4 h-4 text-neon-green bg-black border-neon-green rounded focus:ring-neon-green"
            />
            <span className="text-white text-sm font-bold uppercase">Featured Only</span>
          </label>
        </div>
      </div>
    </div>
  );
}


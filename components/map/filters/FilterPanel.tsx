'use client';

import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import CountyFilter from './CountyFilter';
import CuisineFilter from './CuisineFilter';
import TagFilter from './TagFilter';
import PriceFilter from './PriceFilter';
import RatingFilter from './RatingFilter';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<any>({
    search: '',
    verified: undefined,
    featured: undefined,
    counties: [],
    cuisines: [],
    tags: [],
    priceMin: undefined,
    priceMax: undefined,
    minRating: undefined,
  });

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      verified: undefined,
      featured: undefined,
      counties: [],
      cuisines: [],
      tags: [],
      priceMin: undefined,
      priceMax: undefined,
      minRating: undefined,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neon-green font-bold text-lg uppercase">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-gray-400 hover:text-neon-green text-sm font-semibold uppercase transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <SearchBar
        value={filters.search}
        onChange={(value) => updateFilter('search', value)}
      />

      {/* Quick Filters */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified === true}
            onChange={(e) => updateFilter('verified', e.target.checked ? true : undefined)}
            className="w-4 h-4 text-neon-green bg-black border-neon-green rounded focus:ring-neon-green"
          />
          <span className="text-white text-sm font-bold uppercase">Verified Only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.featured === true}
            onChange={(e) => updateFilter('featured', e.target.checked ? true : undefined)}
            className="w-4 h-4 text-neon-green bg-black border-neon-green rounded focus:ring-neon-green"
          />
          <span className="text-white text-sm font-bold uppercase">Featured Only</span>
        </label>
      </div>

      {/* County Filter */}
      <CountyFilter
        selected={filters.counties || []}
        onChange={(counties) => updateFilter('counties', counties)}
      />

      {/* Cuisine Filter */}
      <CuisineFilter
        selected={filters.cuisines || []}
        onChange={(cuisines) => updateFilter('cuisines', cuisines)}
      />

      {/* Tag Filter */}
      <TagFilter
        selected={filters.tags || []}
        onChange={(tags) => updateFilter('tags', tags)}
      />

      {/* Price Filter */}
      <PriceFilter
        min={filters.priceMin}
        max={filters.priceMax}
        onChange={(min, max) => {
          updateFilter('priceMin', min);
          updateFilter('priceMax', max);
        }}
      />

      {/* Rating Filter */}
      <RatingFilter
        value={filters.minRating}
        onChange={(rating) => updateFilter('minRating', rating)}
      />
    </div>
  );
}


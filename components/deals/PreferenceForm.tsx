'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PreferenceFormData {
  email: string;
  zip: string;
  preferredProductTypes: string[];
  preferredBrands: string[];
  minThcPercent: number | null;
  maxThcPercent: number | null;
  filterByBestQuantity: boolean;
}

const PRODUCT_TYPES = [
  { value: 'flower', label: 'Flower', emoji: '🌿' },
  { value: 'cart', label: 'Vape/Cart', emoji: '💨' },
  { value: 'preroll', label: 'Pre-rolls', emoji: '🚬' },
  { value: 'edible', label: 'Edibles', emoji: '🍪' },
  { value: 'concentrate', label: 'Concentrates', emoji: '💎' },
  { value: 'topical', label: 'Topicals', emoji: '🧴' },
];

const COMMON_BRANDS = [
  'Cookies', 'Cresco', 'Raw Garden', 'Jungle Boys', 'Connected', 
  'Alien Labs', 'Stiiizy', 'Pax', 'Select', 'Raw Garden',
  'Kiva', 'Wyld', 'Wana', 'Incredibles', 'Beboe',
];

export default function PreferenceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PreferenceFormData>({
    email: '',
    zip: '',
    preferredProductTypes: ['flower', 'cart'],
    preferredBrands: [],
    minThcPercent: null,
    maxThcPercent: null,
    filterByBestQuantity: true,
  });

  const [customBrand, setCustomBrand] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save preferences
      const response = await fetch('/api/subscribe/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Redirect to Substack
      const substackUrl = 'https://dailydispodeals.substack.com/subscribe';
      window.location.href = substackUrl;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving preferences:', error);
      }
      alert('Failed to save preferences. Please try again.');
      setLoading(false);
    }
  };

  const toggleProductType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferredProductTypes: prev.preferredProductTypes.includes(type)
        ? prev.preferredProductTypes.filter(t => t !== type)
        : [...prev.preferredProductTypes, type],
    }));
  };

  const toggleBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      preferredBrands: prev.preferredBrands.includes(brand)
        ? prev.preferredBrands.filter(b => b !== brand)
        : [...prev.preferredBrands, brand],
    }));
  };

  const addCustomBrand = () => {
    if (customBrand.trim() && !formData.preferredBrands.includes(customBrand.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredBrands: [...prev.preferredBrands, customBrand.trim()],
      }));
      setCustomBrand('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-white font-medium mb-2">
          Email Address <span className="text-red-400" aria-label="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2 bg-dark-surface border border-neon-green/20 rounded-lg text-white focus:outline-none focus:border-neon-green"
          placeholder="your@email.com"
          aria-required="true"
          aria-describedby="email-description"
        />
        <span id="email-description" className="sr-only">Your email address is required</span>
      </div>

      {/* ZIP Code */}
      <div>
        <label htmlFor="zip" className="block text-white font-medium mb-2">
          ZIP Code <span className="text-red-400" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="zip"
          required
          value={formData.zip}
          onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
          className="w-full px-4 py-2 bg-dark-surface border border-neon-green/20 rounded-lg text-white focus:outline-none focus:border-neon-green"
          placeholder="48060"
          maxLength={5}
          pattern="[0-9]{5}"
          aria-required="true"
          aria-describedby="zip-description"
        />
        <p id="zip-description" className="text-gray-400 text-sm mt-1">We'll show you deals near your area</p>
      </div>

      {/* Product Types */}
      <div>
        <label className="block text-white font-medium mb-3">
          Product Types (select all you want) *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleProductType(type.value)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.preferredProductTypes.includes(type.value)
                  ? 'bg-neon-green/20 border-neon-green text-neon-green'
                  : 'bg-dark-surface border-neon-green/20 text-white hover:border-neon-green/40'
              }`}
            >
              <span className="text-2xl block mb-1">{type.emoji}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
        {formData.preferredProductTypes.length === 0 && (
          <p className="text-red-400 text-sm mt-2" role="alert" aria-live="polite">Please select at least one product type</p>
        )}
      </div>

      {/* Brands */}
      <div>
        <label className="block text-white font-medium mb-3">
          Brand Preferences (optional)
        </label>
        <p className="text-gray-400 text-sm mb-3">
          Select specific brands or leave empty for any brand
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => toggleBrand(brand)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                formData.preferredBrands.includes(brand)
                  ? 'bg-neon-green text-black font-medium'
                  : 'bg-dark-surface border border-neon-green/20 text-white hover:border-neon-green/40'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customBrand}
            onChange={(e) => setCustomBrand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBrand())}
            className="flex-1 px-4 py-2 bg-dark-surface border border-neon-green/20 rounded-lg text-white focus:outline-none focus:border-neon-green"
            placeholder="Add custom brand..."
          />
          <button
            type="button"
            onClick={addCustomBrand}
            className="px-4 py-2 bg-neon-green text-black font-medium rounded-lg hover:bg-neon-green/90"
          >
            Add
          </button>
        </div>
        {formData.preferredBrands.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.preferredBrands.map((brand) => (
              <span
                key={brand}
                className="px-2 py-1 bg-neon-green/20 text-neon-green rounded text-sm"
              >
                {brand} ×
              </span>
            ))}
          </div>
        )}
      </div>

      {/* THC Range */}
      <div>
        <label className="block text-white font-medium mb-3">
          THC Range (optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minThc" className="block text-gray-400 text-sm mb-1">
              Min THC%
            </label>
            <input
              type="number"
              id="minThc"
              min="0"
              max="100"
              value={formData.minThcPercent || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, minThcPercent: e.target.value ? parseFloat(e.target.value) : null }))}
              className="w-full px-4 py-2 bg-dark-surface border border-neon-green/20 rounded-lg text-white focus:outline-none focus:border-neon-green"
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="maxThc" className="block text-gray-400 text-sm mb-1">
              Max THC%
            </label>
            <input
              type="number"
              id="maxThc"
              min="0"
              max="100"
              value={formData.maxThcPercent || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, maxThcPercent: e.target.value ? parseFloat(e.target.value) : null }))}
              className="w-full px-4 py-2 bg-dark-surface border border-neon-green/20 rounded-lg text-white focus:outline-none focus:border-neon-green"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Best Quantity Filter */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="bestQuantity"
          checked={formData.filterByBestQuantity}
          onChange={(e) => setFormData(prev => ({ ...prev, filterByBestQuantity: e.target.checked }))}
          className="w-5 h-5 rounded border-neon-green/20 bg-dark-surface text-neon-green focus:ring-neon-green"
        />
        <label htmlFor="bestQuantity" className="text-white cursor-pointer">
          Show only best quantity/value deals (high value scores)
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || formData.preferredProductTypes.length === 0}
        className="w-full px-6 py-4 bg-neon-green text-black font-bold rounded-lg hover:bg-neon-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Saving...' : 'Continue to Subscribe →'}
      </button>

      <p className="text-gray-400 text-sm text-center">
        After saving your preferences, you'll be redirected to complete your subscription
      </p>
    </form>
  );
}


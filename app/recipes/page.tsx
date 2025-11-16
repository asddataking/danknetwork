'use client';

import RecipeGrid from '@/components/RecipeGrid';

export default function RecipesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-accent-sky/20 to-accent-turquoise/20 border-b border-accent-sky/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Dank Recipes</h1>
          <p className="text-gray-300 text-lg mb-4">
            High & hungry home cooking from the Dank Network kitchen.
          </p>
          <button className="px-6 py-3 bg-accent-sky text-dark-bg font-semibold rounded-lg hover:bg-accent-sky/90 transition-colors">
            Get notified when new recipes drop
          </button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RecipeGrid />
      </div>
    </div>
  );
}


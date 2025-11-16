'use client';

import RecipeGrid from '@/components/RecipeGrid';

export default function RecipesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-accent-sky/20 via-accent-sky/10 to-dark-bg border-b border-accent-sky/30 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(135,206,235,0.5) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-sky flex items-center justify-center shadow-lg shadow-accent-sky/30">
              <span className="text-dark-bg font-black text-lg">DR</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white bg-gradient-to-r from-white via-accent-sky to-accent-turquoise bg-clip-text text-transparent">
              Dank Recipes
            </h1>
          </div>
          <p className="text-gray-300 text-xl mb-6 max-w-2xl">
            High & hungry home cooking from the Dank Network kitchen.
          </p>
          <button className="px-6 py-3 bg-gradient-sky text-dark-bg font-bold rounded-xl hover:shadow-xl hover:shadow-accent-sky/30 transition-all duration-200 hover:scale-105">
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


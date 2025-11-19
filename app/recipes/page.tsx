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
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-sky flex items-center justify-center shadow-lg shadow-accent-sky/30">
              <span className="text-dark-bg font-black text-base sm:text-lg">DR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white bg-gradient-to-r from-white via-accent-sky to-accent-turquoise bg-clip-text text-transparent">
              Dank Recipes
            </h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 max-w-2xl">
            High & hungry home cooking from the Dank Network kitchen.
          </p>
          <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-sky text-dark-bg font-bold rounded-xl hover:shadow-xl hover:shadow-accent-sky/30 transition-all duration-200 hover:scale-105 text-sm sm:text-base">
            Get notified when new recipes drop
          </button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <RecipeGrid />
      </div>
    </div>
  );
}


'use client';

import { recipes } from '@/data/recipes';
import RecipeCard from './RecipeCard';

export default function RecipeGrid() {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">
          Dank Recipes are coming soon. For now, check out videos on the Home feed.
        </p>
        <a
          href="/"
          className="text-accent-turquoise hover:text-accent-sky transition-colors"
        >
          Go to Home →
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}


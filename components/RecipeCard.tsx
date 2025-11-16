'use client';

import { Recipe } from '@/data/recipes';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
}

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <div className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 hover:border-accent-turquoise/50 transition-all">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          <img
            src={recipe.thumbnailUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          {recipe.isInfused && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                Infused
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2">{recipe.title}</h3>
          
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
            <span>{recipe.cookTime}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${difficultyColors[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
          </div>

          {/* Vibes */}
          <div className="flex flex-wrap gap-1">
            {recipe.vibes.map((vibe) => (
              <span
                key={vibe}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300"
              >
                {vibe}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}


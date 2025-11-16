export interface Recipe {
  id: string;
  title: string;
  thumbnailUrl: string;
  cookTime: string;      // e.g. "10 min"
  difficulty: 'easy' | 'medium' | 'hard';
  vibes: string[];       // e.g. ["high & hungry", "late night"]
  isInfused: boolean;    // cannabis-infused or not
}

export const recipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Infused Brownie Delight',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
    cookTime: '45 min',
    difficulty: 'medium',
    vibes: ['high & hungry', 'infused', 'dessert'],
    isInfused: true,
  },
  {
    id: 'r2',
    title: '5-Minute Stoner Quesadilla',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b0?w=800',
    cookTime: '5 min',
    difficulty: 'easy',
    vibes: ['high & hungry', 'late night', 'quick'],
    isInfused: false,
  },
  {
    id: 'r3',
    title: 'Cannabis-Infused Mac & Cheese',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba845?w=800',
    cookTime: '30 min',
    difficulty: 'medium',
    vibes: ['high & hungry', 'infused', 'comfort food'],
    isInfused: true,
  },
];


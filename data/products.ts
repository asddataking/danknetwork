export interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  originalPrice?: number; // for discounts
  affiliateLink: string; // Amazon affiliate link
  rating?: number; // 1-5 stars
  category: 'kitchen' | 'food' | 'gear' | 'apparel' | 'accessories';
  featuredIn?: string[]; // video/recipe IDs
}

export interface MerchItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: 'apparel' | 'accessories' | 'limited';
  sizes?: string[];
  colors?: string[];
  isLimitedEdition: boolean;
  stock: number;
}

// Placeholder affiliate products
export const affiliateProducts: AffiliateProduct[] = [
  {
    id: 'p1',
    name: 'Cast Iron Skillet 12 inch',
    brand: 'Lodge',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c81224a?w=400',
    price: 29.99,
    originalPrice: 39.99,
    affiliateLink: 'https://amazon.com/dp/example',
    rating: 4.5,
    category: 'kitchen',
    featuredIn: ['3', 'r1'],
  },
  {
    id: 'p2',
    name: 'Premium Rolling Papers',
    brand: 'RAW',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400',
    price: 4.99,
    affiliateLink: 'https://amazon.com/dp/example',
    rating: 4.8,
    category: 'accessories',
    featuredIn: ['1', '2'],
  },
  {
    id: 'p3',
    name: 'Game Day Snack Mix',
    brand: 'Various',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    price: 12.99,
    affiliateLink: 'https://amazon.com/dp/example',
    rating: 4.3,
    category: 'food',
    featuredIn: ['4', '10'],
  },
  {
    id: 'p4',
    name: 'Professional Chef Knife',
    brand: 'Wusthof',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c4f0c0b0b0?w=400',
    price: 89.99,
    originalPrice: 129.99,
    affiliateLink: 'https://amazon.com/dp/example',
    rating: 4.9,
    category: 'kitchen',
    featuredIn: ['r2', 'r3'],
  },
  {
    id: 'p5',
    name: 'Portable Grill',
    brand: 'Weber',
    imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400',
    price: 149.99,
    affiliateLink: 'https://amazon.com/dp/example',
    rating: 4.6,
    category: 'gear',
    featuredIn: ['7', '11'],
  },
];

// Placeholder merch items
export const merchItems: MerchItem[] = [
  {
    id: 'm1',
    name: 'Dank Network Hoodie',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    price: 59.99,
    category: 'apparel',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Neon Green'],
    isLimitedEdition: false,
    stock: 50,
  },
  {
    id: 'm2',
    name: 'Lightning Bolt Tee',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    price: 29.99,
    category: 'apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    isLimitedEdition: false,
    stock: 100,
  },
  {
    id: 'm3',
    name: 'Limited Edition DANK Cap',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    price: 34.99,
    category: 'accessories',
    sizes: ['One Size'],
    colors: ['Black'],
    isLimitedEdition: true,
    stock: 25,
  },
  {
    id: 'm4',
    name: 'Dank Recipes Apron',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    price: 24.99,
    category: 'apparel',
    sizes: ['One Size'],
    colors: ['Black'],
    isLimitedEdition: false,
    stock: 75,
  },
];


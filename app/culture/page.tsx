import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Culture',
  description: 'Explore cannabis lifestyle, stoner culture, and the intersection of food, creativity, and cannabis. Perspectives on being high in public, stoner economics, rituals, and more.',
  openGraph: {
    title: 'Culture | Dank Network',
    description: 'Explore cannabis lifestyle, stoner culture, and the intersection of food, creativity, and cannabis.',
  },
};

const cultureArticles = [
  {
    slug: 'food-while-high',
    title: 'Food While High: The Ultimate Guide',
    description: 'Why everything tastes better when you\'re elevated, and how to maximize your munchies experience.',
    preview: 'The science and art of eating while high. From flavor enhancement to meal planning for your next sesh.',
  },
  {
    slug: 'stoner-economics',
    title: 'Stoner Economics: Saving Money on Cannabis',
    description: 'How to stretch your dollar in the Michigan cannabis market without sacrificing quality.',
    preview: 'Smart shopping strategies, bulk buying tips, and how to find the best deals without compromising.',
  },
  {
    slug: 'being-high-in-public',
    title: 'Being High in Public: A Guide',
    description: 'Navigating public spaces while elevated. Etiquette, awareness, and enjoying your high responsibly.',
    preview: 'How to enjoy cannabis in public spaces while respecting others and staying within legal boundaries.',
  },
  {
    slug: 'cannabis-and-creativity',
    title: 'Cannabis and Creativity: The Connection',
    description: 'Exploring how cannabis influences creativity, from artists to entrepreneurs.',
    preview: 'The relationship between cannabis and creative thinking, with insights from creators and researchers.',
  },
  {
    slug: 'rituals-and-routines',
    title: 'Rituals and Routines: Building Your Sesh',
    description: 'Creating meaningful rituals around cannabis consumption for a more intentional experience.',
    preview: 'How to build personal rituals that enhance your cannabis experience and create lasting memories.',
  },
];

export default function CulturePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-neon-green font-black text-4xl md:text-5xl uppercase mb-4">
            Culture
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Perspectives on cannabis lifestyle, food, creativity, and the stoner experience.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {cultureArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/culture/${article.slug}`}
              className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-6 hover:border-neon-green transition-all duration-200 hover:scale-105"
            >
              <h2 className="text-white font-bold text-xl mb-2 hover:text-neon-green transition-colors">
                {article.title}
              </h2>
              <p className="text-gray-400 text-sm mb-3">{article.description}</p>
              <p className="text-gray-500 text-xs">{article.preview}</p>
              <div className="mt-4 text-neon-green text-sm font-semibold">
                Read More →
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-8 text-center">
          <h2 className="text-white font-bold text-2xl mb-4">Explore More</h2>
          <p className="text-gray-400 mb-6">
            Watch reviews, find deals, and earn rewards across the Dank Network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://dankndevour.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neon-green text-black px-6 py-3 font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase"
            >
              Watch DankNDevour
            </a>
            <a
              href="https://dailydispodeals.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neon-orange text-black px-6 py-3 font-bold rounded-lg hover:bg-neon-orange-dark transition-colors duration-200 uppercase"
            >
              Find Deals
            </a>
            <Link
              href="/dankpass"
              className="bg-purple-400 text-black px-6 py-3 font-bold rounded-lg hover:bg-purple-500 transition-colors duration-200 uppercase"
            >
              Join DankPass
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Food While High: The Ultimate Guide',
  description: 'Why everything tastes better when you\'re elevated, and how to maximize your munchies experience. Learn the science and art of eating while high.',
  openGraph: {
    title: 'Food While High: The Ultimate Guide | Dank Network Culture',
    description: 'Why everything tastes better when you\'re elevated, and how to maximize your munchies experience.',
  },
};

export default function FoodWhileHighPage() {
  return (
    <article className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/culture" className="text-neon-green hover:text-neon-green-dark mb-6 inline-block">
          ← Back to Culture
        </Link>
        
        <h1 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-6">
          Food While High: The Ultimate Guide
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6">
            There's something magical about food when you're elevated. Flavors explode, textures become more pronounced, 
            and even the simplest snack can feel like a gourmet experience. But why does this happen, and how can you 
            make the most of it?
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">The Science Behind It</h2>
          <p className="text-gray-400 mb-4">
            Cannabis interacts with your endocannabinoid system, which plays a role in regulating appetite and taste perception. 
            When THC binds to CB1 receptors, it can enhance your sense of taste and smell, making flavors more intense and 
            enjoyable. This is why even basic foods can taste incredible when you're high.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Maximizing Your Munchies</h2>
          <p className="text-gray-400 mb-4">
            To get the most out of your elevated eating experience, consider these tips:
          </p>
          <ul className="text-gray-400 list-disc list-inside mb-6 space-y-2">
            <li>Have snacks ready before you consume</li>
            <li>Experiment with different textures and flavors</li>
            <li>Stay hydrated—dry mouth can affect taste</li>
            <li>Try foods you normally enjoy, but expect them to taste even better</li>
          </ul>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">The DankNDevour Connection</h2>
          <p className="text-gray-400 mb-6">
            At DankNDevour, we understand the connection between cannabis and food. Our reviews explore restaurants and 
            dispensaries with this elevated perspective in mind, helping you find the perfect spots for your next sesh.
          </p>

          <div className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-6 mt-8">
            <h3 className="text-white font-bold text-xl mb-4">Explore More</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://dankndevour.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neon-green text-black px-6 py-3 font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase text-center"
              >
                Watch Reviews →
              </a>
              <Link
                href="/culture/stoner-economics"
                className="bg-dark-surface border-2 border-neon-green/30 text-neon-green px-6 py-3 font-bold rounded-lg hover:border-neon-green transition-colors duration-200 uppercase text-center"
              >
                Read: Stoner Economics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rituals and Routines: Building Your Sesh',
  description: 'Creating meaningful rituals around cannabis consumption for a more intentional experience. How to build personal rituals that enhance your cannabis experience.',
  openGraph: {
    title: 'Rituals and Routines: Building Your Sesh | Dank Network Culture',
    description: 'Creating meaningful rituals around cannabis consumption for a more intentional experience.',
  },
};

export default function RitualsAndRoutinesPage() {
  return (
    <article className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/culture" className="text-neon-green hover:text-neon-green-dark mb-6 inline-block">
          ← Back to Culture
        </Link>
        
        <h1 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-6">
          Rituals and Routines: Building Your Sesh
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6">
            For many cannabis enthusiasts, consumption isn't just about getting high—it's about creating a meaningful 
            ritual that enhances the experience. Building personal rituals around your sesh can make each session more 
            intentional, enjoyable, and memorable.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Setting the Scene</h2>
          <p className="text-gray-400 mb-4">
            Your environment matters. Create a comfortable space with good lighting, music, and comfortable seating. 
            Some people prefer dim lights and chill vibes, while others like bright spaces for creative work. Find what 
            works for you and make it consistent.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Pre-Sesh Preparation</h2>
          <p className="text-gray-400 mb-4">
            Prepare your snacks, drinks, and activities ahead of time. Having everything ready means you can fully 
            relax and enjoy your high without interruptions. Many people also use this prep time as part of their ritual— 
            grinding, rolling, or setting up their consumption method becomes a meditative act.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Mindful Consumption</h2>
          <p className="text-gray-400 mb-4">
            Take your time. Don't rush through your sesh. Pay attention to the flavors, the effects, and how you're 
            feeling. Some people like to journal their experiences, noting what strains work best for different activities 
            or moods.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Post-Sesh Reflection</h2>
          <p className="text-gray-400 mb-6">
            After your sesh, take a moment to reflect. What did you enjoy? What would you do differently? Building 
            this reflection into your routine helps you refine your rituals and get more out of each experience.
          </p>

          <div className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-6 mt-8">
            <h3 className="text-white font-bold text-xl mb-4">Explore More</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/culture/food-while-high"
                className="bg-dark-surface border-2 border-neon-green/30 text-neon-green px-6 py-3 font-bold rounded-lg hover:border-neon-green transition-colors duration-200 uppercase text-center"
              >
                Read: Food While High
              </Link>
              <Link
                href="/dankpass"
                className="bg-purple-400 text-black px-6 py-3 font-bold rounded-lg hover:bg-purple-500 transition-colors duration-200 uppercase text-center"
              >
                Join DankPass
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

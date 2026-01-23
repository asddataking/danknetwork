import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Being High in Public: A Guide',
  description: 'Navigating public spaces while elevated. Etiquette, awareness, and enjoying your high responsibly in Michigan.',
  openGraph: {
    title: 'Being High in Public: A Guide | Dank Network Culture',
    description: 'Navigating public spaces while elevated. Etiquette, awareness, and enjoying your high responsibly.',
  },
};

export default function BeingHighInPublicPage() {
  return (
    <article className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/culture" className="text-neon-green hover:text-neon-green-dark mb-6 inline-block">
          ← Back to Culture
        </Link>
        
        <h1 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-6">
          Being High in Public: A Guide
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6">
            Cannabis is legal in Michigan, but that doesn't mean you can consume it everywhere. Understanding where 
            you can and can't be high, and how to navigate public spaces while elevated, is key to a positive experience.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Where You Can't Consume</h2>
          <p className="text-gray-400 mb-4">
            In Michigan, you cannot consume cannabis in public places, including parks, sidewalks, restaurants, and 
            bars. You also can't consume in vehicles (even if parked), on federal land, or in places where smoking 
            is prohibited. Private residences are generally okay, as long as the property owner allows it.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Public Etiquette</h2>
          <p className="text-gray-400 mb-4">
            If you're high in public spaces (like walking through a park or shopping), be mindful of others. 
            Don't be disruptive, respect personal space, and remember that not everyone is comfortable with cannabis. 
            Keep your consumption private and your public behavior respectful.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Staying Safe</h2>
          <p className="text-gray-400 mb-4">
            Don't drive while high. Plan your transportation ahead of time—use rideshare services, public transit, 
            or have a designated driver. Keep water and snacks on hand, and know your limits. If you feel too high, 
            find a safe, comfortable place to wait it out.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Enjoying Public Spaces</h2>
          <p className="text-gray-400 mb-6">
            Many people enjoy being high while walking, shopping, or attending events. The key is to consume in a 
            legal, private space first, then enjoy public spaces while elevated. Always be aware of your surroundings 
            and respect the space and people around you.
          </p>

          <div className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-6 mt-8">
            <h3 className="text-white font-bold text-xl mb-4">Explore More</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/culture/cannabis-and-creativity"
                className="bg-dark-surface border-2 border-neon-green/30 text-neon-green px-6 py-3 font-bold rounded-lg hover:border-neon-green transition-colors duration-200 uppercase text-center"
              >
                Read: Cannabis & Creativity
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

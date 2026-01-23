import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cannabis and Creativity: The Connection',
  description: 'Exploring how cannabis influences creativity, from artists to entrepreneurs. The relationship between cannabis and creative thinking.',
  openGraph: {
    title: 'Cannabis and Creativity: The Connection | Dank Network Culture',
    description: 'Exploring how cannabis influences creativity, from artists to entrepreneurs.',
  },
};

export default function CannabisAndCreativityPage() {
  return (
    <article className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/culture" className="text-neon-green hover:text-neon-green-dark mb-6 inline-block">
          ← Back to Culture
        </Link>
        
        <h1 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-6">
          Cannabis and Creativity: The Connection
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6">
            Many artists, writers, musicians, and entrepreneurs credit cannabis with enhancing their creative process. 
            But what's the actual relationship between cannabis and creativity? Let's explore the science and stories 
            behind this connection.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">The Creative State</h2>
          <p className="text-gray-400 mb-4">
            Cannabis can alter your thought patterns, making connections between ideas that might not seem obvious 
            when sober. This "divergent thinking" can lead to creative breakthroughs, novel solutions, and artistic 
            inspiration. Many creators use cannabis to break out of creative ruts or explore new perspectives.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Finding Your Sweet Spot</h2>
          <p className="text-gray-400 mb-4">
            Not all strains or consumption methods work the same for everyone. Some people find that sativas enhance 
            focus and energy for creative work, while others prefer indicas for deep, meditative creative sessions. 
            Experimentation is key—find what works for your creative process.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">The Balance</h2>
          <p className="text-gray-400 mb-4">
            While cannabis can enhance creativity, too much can impair focus and execution. Many successful creators 
            use cannabis for brainstorming and ideation, but switch to sober work for detailed execution and refinement. 
            Finding your balance is essential.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Creativity in the Dank Network</h2>
          <p className="text-gray-400 mb-6">
            At Dank Network, we celebrate the creative side of cannabis culture. From food reviews to content creation, 
            cannabis enhances our creative process and helps us connect with our audience in authentic ways.
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
                Watch Creative Content →
              </a>
              <Link
                href="/culture/rituals-and-routines"
                className="bg-dark-surface border-2 border-neon-green/30 text-neon-green px-6 py-3 font-bold rounded-lg hover:border-neon-green transition-colors duration-200 uppercase text-center"
              >
                Read: Rituals & Routines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

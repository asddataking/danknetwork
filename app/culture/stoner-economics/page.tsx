import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Stoner Economics: Saving Money on Cannabis',
  description: 'How to stretch your dollar in the Michigan cannabis market without sacrificing quality. Smart shopping strategies and deal-finding tips.',
  openGraph: {
    title: 'Stoner Economics: Saving Money on Cannabis | Dank Network Culture',
    description: 'How to stretch your dollar in the Michigan cannabis market without sacrificing quality.',
  },
};

export default function StonerEconomicsPage() {
  return (
    <article className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/culture" className="text-neon-green hover:text-neon-green-dark mb-6 inline-block">
          ← Back to Culture
        </Link>
        
        <h1 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-6">
          Stoner Economics: Saving Money on Cannabis
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6">
            Cannabis can be expensive, especially in Michigan's competitive market. But with the right strategies, 
            you can maximize your dollar without compromising on quality. Here's how smart shoppers navigate the 
            dispensary landscape.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Bulk Buying Strategies</h2>
          <p className="text-gray-400 mb-4">
            Many dispensaries offer discounts for larger purchases. Buying an ounce instead of an eighth can save 
            you 20-30% per gram. If you consume regularly, bulk buying is one of the most effective ways to reduce 
            your per-gram cost.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Deal Days and Promotions</h2>
          <p className="text-gray-400 mb-4">
            Most dispensaries have weekly deal days. Some offer "flash sales" or "happy hour" discounts. Sign up 
            for dispensary newsletters and follow them on social media to stay informed about promotions. Many 
            places offer first-time customer discounts too.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Loyalty Programs</h2>
          <p className="text-gray-400 mb-4">
            Join dispensary loyalty programs. Many offer points for purchases that can be redeemed for discounts 
            or free products. Some programs offer birthday discounts, referral bonuses, and tiered rewards based 
            on spending levels.
          </p>

          <h2 className="text-white font-bold text-2xl mt-8 mb-4">Finding the Best Deals</h2>
          <p className="text-gray-400 mb-6">
            Daily Dispo Deals aggregates the best dispensary deals across Michigan, sorted by AI to find the cheapest 
            weed. Premium subscribers get 10+ deals daily, early access, and custom brand filtering.
          </p>

          <div className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-6 mt-8">
            <h3 className="text-white font-bold text-xl mb-4">Find Deals Now</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://dailydispodeals.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neon-orange text-black px-6 py-3 font-bold rounded-lg hover:bg-neon-orange-dark transition-colors duration-200 uppercase text-center"
              >
                Find Deals →
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

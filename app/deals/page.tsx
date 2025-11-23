'use client';

import PreferenceForm from '@/components/deals/PreferenceForm';

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-neon-green font-black text-5xl mb-4">
          Stop Searching. Start Saving.
        </h1>
        <p className="text-white text-xl mb-8">
          Get the best dispensary deals in your area delivered to your inbox every morning.
        </p>
        <p className="text-gray-400 mb-12">
          No more scrolling through Weedmaps. We do the work. You get the deals.
        </p>

        {/* Preference Form */}
        <div className="max-w-2xl mx-auto">
          <PreferenceForm />
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-neon-green font-bold text-3xl mb-8 text-center">
          Tired of this?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Scrolling through Weedmaps for hours</p>
            <p className="text-gray-400">Trying to find the best deals across dozens of dispensaries</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Manually comparing prices</p>
            <p className="text-gray-400">Opening 10+ tabs just to compare THC% and prices</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Missing the best deals</p>
            <p className="text-gray-400">By the time you check, the deal is gone</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white text-lg mb-2">❌ Wasting time</p>
            <p className="text-gray-400">When you just want the best value, fast</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-neon-green font-bold text-3xl mb-8 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-white font-bold mb-2">Sign Up</h3>
            <p className="text-gray-400 text-sm">Enter your email (30 seconds)</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-white font-bold mb-2">We Scan</h3>
            <p className="text-gray-400 text-sm">Daily scans of all dispensaries</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white font-bold mb-2">We Rank</h3>
            <p className="text-gray-400 text-sm">By THC-per-dollar value</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="text-white font-bold mb-2">You Get Deals</h3>
            <p className="text-gray-400 text-sm">Daily email with top deals</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-neon-green font-bold text-3xl mb-8 text-center">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-8">
            <h3 className="text-neon-green font-bold text-2xl mb-4">FREE</h3>
            <p className="text-white text-4xl font-black mb-2">$0</p>
            <p className="text-gray-400 mb-6">Weekly newsletter</p>
            <ul className="space-y-3 mb-8">
              <li className="text-white">✅ Deals of the Week summary</li>
              <li className="text-white">✅ Top deals across Michigan</li>
              <li className="text-white">✅ Value scores & rankings</li>
            </ul>
          </div>
          <div className="bg-dark-surface rounded-lg border-2 border-neon-green p-8">
            <div className="bg-neon-green text-black px-3 py-1 rounded text-sm font-bold inline-block mb-4">
              POPULAR
            </div>
            <h3 className="text-neon-green font-bold text-2xl mb-4">PREMIUM</h3>
            <p className="text-white text-4xl font-black mb-2">$7<span className="text-lg">/mo</span></p>
            <p className="text-gray-400 mb-6">Daily newsletter</p>
            <ul className="space-y-3 mb-8">
              <li className="text-white">✅ Daily ZIP group-specific deals</li>
              <li className="text-white">✅ Top 10 deals daily</li>
              <li className="text-white">✅ Proximity filtering (15 miles)</li>
              <li className="text-white">✅ Deal alerts & price drops</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-neon-green font-bold text-3xl mb-8">
          Join 500+ Smart Shoppers
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white mb-2">"Saved me $50 last week!"</p>
            <p className="text-gray-400 text-sm">- Sarah, Metro Detroit</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white mb-2">"Finally, no more Weedmaps rabbit holes"</p>
            <p className="text-gray-400 text-sm">- Mike, Ann Arbor</p>
          </div>
          <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
            <p className="text-white mb-2">"Best $7 I spend every month"</p>
            <p className="text-gray-400 text-sm">- Alex, Grand Rapids</p>
          </div>
        </div>
      </section>
    </div>
  );
}


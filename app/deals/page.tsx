'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DealsPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    zip: '',
    tier: 'free' as 'free' | 'premium',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check for Stripe success/cancel params
  useEffect(() => {
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');

    if (successParam === 'true') {
      setSuccess(true);
    } else if (canceledParam === 'true') {
      setError('Payment was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // For Premium tier, redirect to Stripe Checkout
      if (formData.tier === 'premium') {
        const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            zip: formData.zip,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
          return; // Keep loading state during redirect
        }
      } else {
        // For Free tier, use simple subscribe endpoint
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to subscribe');
        }

        setSuccess(true);
        setFormData({ email: '', zip: '', tier: 'free' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const handlePlanSelect = (tier: 'free' | 'premium') => {
    setFormData((prev) => ({ ...prev, tier }));
    // Scroll to form
    document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero + Form Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content + Form */}
          <div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-neon-green">Daily Dispo</span>
              <br />
              <span className="text-neon-orange">Deals</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-6">
              Michigan's cheapest weed, sorted by AI and sent to your inbox.
            </p>

            <ul className="space-y-3 mb-8 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-neon-green text-xl">✓</span>
                <span>Sorted by value, not brand hype</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-green text-xl">✓</span>
                <span>Only licensed Michigan dispensaries</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-green text-xl">✓</span>
                <span>Free tier + Premium for $4.20/mo</span>
              </li>
            </ul>

            {/* Form */}
            <div id="signup-form" className="bg-dark-surface border-2 border-neon-green/30 rounded-lg p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-2xl font-bold text-neon-green mb-2">
                    {searchParams.get('success') ? "Payment Successful!" : "You're in!"}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {searchParams.get('success') 
                      ? "Welcome to Premium! Check your email for a welcome message and your first premium deals."
                      : "Check your email for a welcome message. Your first deals are on the way!"}
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      window.history.replaceState({}, '', '/deals');
                    }}
                    className="text-neon-green hover:underline text-sm"
                  >
                    Subscribe another email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-neon-green/30 rounded-lg text-white focus:outline-none focus:border-neon-green transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-300 mb-1">
                      Michigan ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      required
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          zip: e.target.value.replace(/\D/g, '').slice(0, 5),
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-neon-green/30 rounded-lg text-white focus:outline-none focus:border-neon-green transition-colors"
                      placeholder="48060"
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Choose Your Plan
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tier: 'free' })}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          formData.tier === 'free'
                            ? 'bg-neon-green/20 border-neon-green text-neon-green'
                            : 'bg-black border-neon-green/30 text-gray-300 hover:border-neon-green/50'
                        }`}
                      >
                        <div className="text-lg font-bold">Free</div>
                        <div className="text-xs">Weekly</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tier: 'premium' })}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          formData.tier === 'premium'
                            ? 'bg-neon-orange/20 border-neon-orange text-neon-orange'
                            : 'bg-black border-neon-orange/30 text-gray-300 hover:border-neon-orange/50'
                        }`}
                      >
                        <div className="text-lg font-bold">Premium</div>
                        <div className="text-xs">$4.20/mo</div>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-neon-green text-black font-bold text-lg rounded-lg hover:bg-neon-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading 
                      ? (formData.tier === 'premium' ? 'Redirecting to checkout...' : 'Subscribing...') 
                      : (formData.tier === 'premium' ? 'Continue to Payment 🔥' : "Get today's deals 🔥")}
                  </button>

                  <p className="text-gray-500 text-xs text-center">
                    21+ only. Not a dispensary. For informational purposes only.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right: Phone Preview */}
          <div className="hidden md:block">
            <div className="relative mx-auto max-w-sm">
              {/* Phone Frame */}
              <div className="bg-dark-surface border-2 border-neon-green/30 rounded-3xl p-4 shadow-2xl">
                {/* Phone Header */}
                <div className="bg-black rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-neon-green/20">
                    <div className="text-xs text-gray-500 mb-1">From: Daily Dispo Deals</div>
                    <div className="text-sm font-bold text-neon-green">🔥 Today's Top Deals</div>
                  </div>

                  {/* Email Content */}
                  <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                    <div className="text-xs text-gray-400">
                      Good morning! Here are the best deals in your area:
                    </div>

                    {/* Deal 1 */}
                    <div className="bg-dark-surface border border-neon-green/20 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-bold text-white">Wedding Cake - 3.5g</div>
                        <div className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs font-bold rounded">
                          STEAL
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">Green Tree Remedy • Ann Arbor</div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-neon-orange">$25</div>
                        <div className="text-xs text-gray-400">28% THC</div>
                      </div>
                      <div className="text-xs text-neon-green mt-1">Value Score: 39.2</div>
                    </div>

                    {/* Deal 2 */}
                    <div className="bg-dark-surface border border-neon-green/20 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-bold text-white">Blue Dream Cart - 1g</div>
                        <div className="px-2 py-1 bg-neon-orange/20 text-neon-orange text-xs font-bold rounded">
                          SOLID
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">Herbology • Detroit</div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-neon-orange">$18</div>
                        <div className="text-xs text-gray-400">85% THC</div>
                      </div>
                      <div className="text-xs text-neon-green mt-1">Value Score: 47.2</div>
                    </div>

                    {/* Deal 3 */}
                    <div className="bg-dark-surface border border-neon-green/20 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-bold text-white">Sour Diesel - 7g</div>
                        <div className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs font-bold rounded">
                          STEAL
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">Skymint • Ypsilanti</div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-neon-orange">$45</div>
                        <div className="text-xs text-gray-400">24% THC</div>
                      </div>
                      <div className="text-xs text-neon-green mt-1">Value Score: 37.3</div>
                    </div>

                    <div className="text-center pt-2">
                      <div className="text-xs text-gray-500">
                        Sample preview. Deals shown are examples only.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-dark-surface py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="text-neon-green">How It</span> <span className="text-neon-orange">Works</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            We do the heavy lifting so you don't have to scroll through endless menus
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center">
                <span className="text-3xl font-black text-neon-green">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Tell us your ZIP</h3>
              <p className="text-gray-400">
                We'll target deals within your area to keep your drives short and your savings high.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-orange/20 border-2 border-neon-orange flex items-center justify-center">
                <span className="text-3xl font-black text-neon-orange">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI scans Michigan menus</h3>
              <p className="text-gray-400">
                Our AI crawls dispensary menus daily, analyzing thousands of products for THC content and pricing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center">
                <span className="text-3xl font-black text-neon-green">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">You get a clean daily email</h3>
              <p className="text-gray-400">
                Wake up to the best deals in your inbox. No spam, no fluff, just pure value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free vs Premium Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="text-neon-green">Choose Your</span> <span className="text-neon-orange">Plan</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Start free and upgrade anytime. No contracts, cancel whenever.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-dark-surface border-2 border-neon-green/30 rounded-2xl p-8 hover:border-neon-green/60 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neon-green mb-2">Free</h3>
                <div className="text-5xl font-black text-white mb-2">$0</div>
                <div className="text-gray-400">Perfect for casual shoppers</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">Top 3–5 deals per week</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">ZIP-based targeting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">Basic deal alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">Weekly newsletter</span>
                </li>
              </ul>

              <button
                onClick={() => handlePlanSelect('free')}
                className="w-full px-6 py-3 bg-neon-green/20 border-2 border-neon-green text-neon-green font-bold rounded-lg hover:bg-neon-green/30 transition-all"
              >
                Start Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-dark-surface border-2 border-neon-orange rounded-2xl p-8 relative hover:border-neon-orange/80 transition-colors">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-neon-orange text-black text-sm font-bold rounded-full">
                  MOST POPULAR
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neon-orange mb-2">Premium</h3>
                <div className="text-5xl font-black text-white mb-2">
                  $4.20<span className="text-xl text-gray-400">/mo</span>
                </div>
                <div className="text-gray-400">For serious savers</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-neon-orange text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300"><strong>Full daily list</strong> of top deals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-orange text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300"><strong>10+ deals per day</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-orange text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300"><strong>Earlier sends</strong> (7am vs 9am)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-orange text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">Custom brand filtering</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-orange text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">Price drop alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-orange text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">Proximity filtering (15 miles)</span>
                </li>
              </ul>

              <button
                onClick={() => handlePlanSelect('premium')}
                className="w-full px-6 py-3 bg-neon-orange text-black font-bold rounded-lg hover:bg-neon-orange/90 transition-all"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Strip */}
      <section className="bg-dark-surface py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-center text-gray-400 text-sm font-medium mb-6">
            FEATURED PARTNERS
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="px-6 py-3 bg-black/50 border border-neon-green/20 rounded-lg text-gray-400 font-medium">
              Green Tree Remedy
            </div>
            <div className="px-6 py-3 bg-black/50 border border-neon-green/20 rounded-lg text-gray-400 font-medium">
              Herbology
            </div>
            <div className="px-6 py-3 bg-black/50 border border-neon-green/20 rounded-lg text-gray-400 font-medium">
              Skymint
            </div>
            <div className="px-6 py-3 bg-black/50 border border-neon-green/20 rounded-lg text-gray-400 font-medium">
              Your Dispo Here
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-neon-green/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="text-2xl font-black mb-2">
              <span className="text-neon-green">Daily Dispo Deals</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Dank Network • Daily Dispo Deals
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs max-w-2xl mx-auto">
            <p>
              Not a dispensary. For informational purposes only. Please follow Michigan laws and
              consume responsibly. You must be 21+ to use this service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function DailyDispoDeals() {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-neon-orange/5 to-neon-green/5 rounded-2xl" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-orange/10 rounded-full blur-3xl" />
      
      <div className="relative border-2 border-neon-green/30 rounded-2xl overflow-hidden hover:border-neon-green/60 transition-all duration-300">
        <div className="bg-dark-surface/80 backdrop-blur-sm p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-neon-green/20 border border-neon-green/40 rounded-full px-4 py-2 mb-4">
                <span className="text-2xl">🔥</span>
                <span className="text-neon-green font-bold text-sm uppercase tracking-wide">
                  New Feature
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                <span className="text-neon-green">Daily Dispo</span>
                <br />
                <span className="text-neon-orange">Deals</span>
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Michigan's cheapest weed, sorted by AI and delivered to your inbox.{' '}
                <span className="text-white font-semibold">Stop overpaying.</span>
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">
                    AI-sorted by <span className="text-white font-semibold">best value</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">
                    Daily emails with <span className="text-white font-semibold">top 10 deals</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon-green text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-300">
                    <span className="text-white font-semibold">Free</span> or <span className="text-neon-orange font-bold">Premium ($4.20/mo)</span>
                  </span>
                </div>
              </div>

              {/* Premium CTA */}
              <div className="bg-gradient-to-r from-neon-orange/10 to-neon-green/10 border border-neon-orange/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👑</span>
                  <div className="flex-1">
                    <h3 className="text-neon-orange font-bold text-lg mb-1">Unlock Premium for $4.20/mo</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Get <span className="text-white font-semibold">Daily Dispo Deals Premium</span> + <span className="text-white font-semibold">DankPass Rewards Premium</span> - all in one!
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-neon-orange">🔥</span>
                        <span><strong>Earn & Burn:</strong> 1.5x points multiplier on every purchase</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-neon-orange">🔥</span>
                        <span><strong>Unlimited uploads:</strong> No monthly receipt limits</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-neon-orange">🔥</span>
                        <span><strong>10+ daily deals:</strong> Full list vs 3-5 for free</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-neon-orange">🔥</span>
                        <span><strong>Early access:</strong> Deals at 7am instead of 9am</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/deals"
                className="inline-flex items-center gap-3 bg-neon-green text-black font-bold px-8 py-4 rounded-lg hover:bg-neon-green/90 transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-neon-green/50"
              >
                <span className="text-lg">Get Started Free</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              {/* Phone mockup */}
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green/20 to-neon-orange/20 rounded-3xl blur-xl" />
                
                <div className="relative bg-black border-4 border-gray-800 rounded-3xl p-3 shadow-2xl">
                  {/* Phone notch */}
                  <div className="flex justify-center mb-2">
                    <div className="w-24 h-1 bg-gray-700 rounded-full" />
                  </div>

                  {/* Email preview */}
                  <div className="bg-dark-surface rounded-2xl overflow-hidden border border-neon-green/20">
                    {/* Email header */}
                    <div className="px-4 py-3 border-b border-neon-green/20 bg-gradient-to-r from-neon-green/5 to-transparent">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-lg">🔥</span>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Daily Dispo Deals</div>
                          <div className="text-sm font-bold text-neon-green">Today's Top Deals</div>
                        </div>
                      </div>
                    </div>

                    {/* Deals preview */}
                    <div className="p-3 space-y-3 max-h-64 overflow-hidden">
                      {/* Deal 1 */}
                      <div className="bg-black/40 border border-neon-green/20 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs font-bold text-white">Blue Dream - 3.5g</div>
                          <div className="px-2 py-0.5 bg-neon-green/20 text-neon-green text-[10px] font-bold rounded">
                            STEAL
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 mb-2">Green Tree • Ann Arbor</div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-neon-orange">$35</div>
                          <div className="text-[10px] text-gray-400">28% THC</div>
                        </div>
                      </div>

                      {/* Deal 2 */}
                      <div className="bg-black/40 border border-neon-green/20 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs font-bold text-white">Cart - 1g</div>
                          <div className="px-2 py-0.5 bg-neon-orange/20 text-neon-orange text-[10px] font-bold rounded">
                            SOLID
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 mb-2">Herbology • Detroit</div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-neon-orange">$18</div>
                          <div className="text-[10px] text-gray-400">85% THC</div>
                        </div>
                      </div>

                      {/* Deal 3 */}
                      <div className="bg-black/40 border border-neon-green/20 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs font-bold text-white">Wedding Cake - 7g</div>
                          <div className="px-2 py-0.5 bg-neon-green/20 text-neon-green text-[10px] font-bold rounded">
                            STEAL
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-400 mb-2">Skymint • Ypsilanti</div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-neon-orange">$45</div>
                          <div className="text-[10px] text-gray-400">24% THC</div>
                        </div>
                      </div>
                    </div>

                    {/* Gradient fade at bottom */}
                    <div className="h-12 bg-gradient-to-t from-dark-surface to-transparent relative -mt-12" />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-neon-orange text-black font-black px-4 py-2 rounded-full text-sm transform rotate-12 shadow-lg">
                FREE!
              </div>
            </div>
          </div>

          {/* Bottom stats bar */}
          <div className="mt-8 pt-6 border-t border-gray-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-black text-neon-green mb-1">500+</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Subscribers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-neon-orange mb-1">30+</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Dispensaries</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-neon-green mb-1">97%</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Love It</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


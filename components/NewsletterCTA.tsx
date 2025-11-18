'use client';

import { useState, useEffect } from 'react';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shopUrl, setShopUrl] = useState('');

  // Fetch shop URL from API
  useEffect(() => {
    const fetchShopUrl = async () => {
      try {
        const response = await fetch('/api/fourthwall/shop-url');
        if (response.ok) {
          const data = await response.json();
          if (data.shopUrl) {
            setShopUrl(data.shopUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching shop URL:', error);
      }
    };

    fetchShopUrl();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      if (shopUrl) {
        // Fourthwall newsletter signup - redirect to shop newsletter page
        // Fourthwall typically has newsletter at /newsletter or /pages/newsletter
        // We'll try the most common pattern and let Fourthwall handle the email prefill if supported
        const newsletterUrl = `${shopUrl}/newsletter${email ? `?email=${encodeURIComponent(email)}` : ''}`;
        window.open(newsletterUrl, '_blank');
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        // Fallback: Show message that newsletter signup is available on shop
        alert('Please visit our shop to sign up for the newsletter!');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-black via-dark-surface to-black border-2 border-neon-green/30 rounded-lg p-8 md:p-12 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-neon-green/5 opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-3">
            Stay in the Loop
          </h2>
          <p className="text-white text-lg md:text-xl max-w-2xl mx-auto">
            Get the latest drops, exclusive deals, and updates delivered straight to your inbox.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-neon-green/20 border border-neon-green rounded-lg px-6 py-3">
              <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-neon-green font-bold uppercase">Check your email to confirm!</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-black border-2 border-neon-green/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-neon-green text-black font-bold px-8 py-3 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            <p className="text-gray-400 text-xs text-center mt-3">
              By subscribing, you agree to receive marketing emails from us.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';

export default function FeedTheCrew() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donor, setDonor] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopUrl, setShopUrl] = useState('');

  const presetAmounts = [1, 5, 20];

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

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      alert('Please select or enter a valid amount');
      return;
    }

    if (!shopUrl) {
      alert('Shop URL not configured. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      // Build the Fourthwall donation URL with all parameters
      const params = new URLSearchParams();
      
      // Donor name (optional)
      if (donor.trim()) {
        params.append('donor', donor.trim());
      } else {
        params.append('donor', '');
      }
      
      // Message (optional)
      if (message.trim()) {
        params.append('message', message.trim());
      } else {
        params.append('message', '');
      }
      
      // Preset donation options (always include all presets)
      presetAmounts.forEach((preset) => {
        params.append('donationOpts[]', preset.toFixed(2));
      });
      
      // Amount selection
      if (selectedAmount) {
        // Using preset amount
        params.append('amount-radio', selectedAmount.toFixed(2));
        params.append('amount-custom', '');
      } else if (customAmount) {
        // Using custom amount
        params.append('amount-radio', '');
        params.append('amount-custom', parseFloat(customAmount).toFixed(2));
      }
      
      // Actual amount
      params.append('amount', amount.toString());
      
      // Currency
      params.append('currency', 'USD');
      
      // Build the full donation URL
      const donationUrl = `${shopUrl}/donation/?${params.toString()}`;
      
      // Redirect to Fourthwall donation checkout
      window.location.href = donationUrl;
    } catch (error) {
      console.error('Donation error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-dark-surface rounded-lg border-2 border-neon-green/30 p-8 md:p-10">
      <h2 className="text-neon-green font-black text-3xl md:text-4xl mb-4 uppercase">
        Feed the Crew
      </h2>
      <p className="text-white text-lg mb-8 max-w-2xl">
        You&apos;re directly fueling more food & weed reviews. You&apos;re a real one.
      </p>

      {/* Preset Amount Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setSelectedAmount(amount);
              setCustomAmount('');
            }}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
              selectedAmount === amount
                ? 'bg-neon-green text-black'
                : 'bg-gray-800 text-white hover:bg-gray-700 border-2 border-gray-700'
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-2">Custom Amount</label>
        <div className="flex items-center gap-2">
          <span className="text-neon-green font-bold text-xl">$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder="Enter amount"
            className="flex-1 bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white font-semibold focus:outline-none focus:border-neon-green transition-colors"
          />
        </div>
      </div>

      {/* Donor Name Input (Optional) */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-2">Your Name (Optional)</label>
        <input
          type="text"
          value={donor}
          onChange={(e) => setDonor(e.target.value)}
          placeholder="Enter your name"
          maxLength={100}
          className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
        />
      </div>

      {/* Message Input */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-2">Message (Optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message to the crew..."
          rows={3}
          maxLength={200}
          className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors resize-none"
        />
        <p className="text-gray-400 text-sm mt-1">{message.length}/200</p>
      </div>

      {/* Donate Button */}
      <button
        onClick={handleDonate}
        disabled={loading || (!selectedAmount && !customAmount)}
        className="w-full bg-neon-green text-black font-black py-4 px-8 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Donate & Send Message'}
      </button>
    </div>
  );
}


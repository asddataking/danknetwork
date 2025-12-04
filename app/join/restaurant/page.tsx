'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RestaurantOnboardingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    description: '',
    pointsMultiplier: '1.0',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessType: 'restaurant',
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Application failed');
      }

      setStep(3); // Success step
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/join"
              className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-brand-subtle" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-brand-ink">Restaurant Application</h1>
              <p className="text-brand-subtle">Join Dank Network as a restaurant partner</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full ${
                    step >= s ? 'bg-brand-primary' : 'bg-brand-subtle/20'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-brand-subtle text-center">
              Step {step} of 3
            </div>
          </div>

          {/* Step 1: Business Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-brand-ink mb-6">Business Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Restaurant Name *</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-ink mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-ink mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-ink mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-ink mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-ink mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary resize-none"
                    placeholder="Tell us about your restaurant..."
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 btn-primary"
                disabled={!formData.businessName || !formData.email || !formData.phone || !formData.address}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2: Rewards Configuration */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-brand-ink mb-6">Rewards Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Points Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="3.0"
                    value={formData.pointsMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointsMultiplier: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                  />
                  <p className="text-xs text-brand-subtle mt-1">
                    How many points customers earn per dollar (default: 1.0)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                    placeholder="DANK-XXXX"
                  />
                  <p className="text-xs text-brand-subtle mt-1">
                    If someone referred you, enter their code here
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card text-center py-12"
            >
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-brand-ink mb-4">Application Submitted!</h2>
              <p className="text-brand-subtle mb-6">
                We've received your application and will review it within 2-3 business days.
                You'll receive an email confirmation shortly.
              </p>
              <Link href="/" className="btn-primary">
                Return Home
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}




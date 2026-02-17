'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';
import { submitLead } from '@/app/actions/submitLead';

interface ApplyFormProps {
  preselectedTier?: string;
  compact?: boolean;
}

export default function ApplyForm({ preselectedTier, compact = false }: ApplyFormProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    tier: preselectedTier || '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    mailto?: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    if (preselectedTier) {
      setFormData(prev => ({ ...prev, tier: preselectedTier }));
    }

    // Listen for tier selection events from pricing cards
    const handleTierSelect = (e: CustomEvent) => {
      setFormData(prev => ({ ...prev, tier: e.detail }));
    };

    window.addEventListener('tierSelected' as any, handleTierSelect as EventListener);
    return () => {
      window.removeEventListener('tierSelected' as any, handleTierSelect as EventListener);
    };
  }, [preselectedTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const result = await submitLead(formData);
      
      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Application submitted successfully!',
        });
        // Reset form
        setFormData({
          businessName: '',
          contactName: '',
          email: '',
          phone: '',
          businessType: '',
          tier: preselectedTier || '',
          website: '',
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to submit application. Please try again.',
          mailto: result.mailto,
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (submitStatus.type === 'success') {
    return (
      <div className="bg-dark-surface border border-neon-green/30 rounded-xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-neon-green mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-gray-400">{submitStatus.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitStatus.type === 'error' && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm">{submitStatus.message}</p>
            {submitStatus.mailto && (
              <a
                href={submitStatus.mailto}
                className="text-neon-green hover:underline text-sm mt-2 inline-block"
              >
                Click here to email us directly
              </a>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-2">
          Business Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          required
          value={formData.businessName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
          placeholder="Your business name"
        />
      </div>

      <div>
        <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-2">
          Contact Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="contactName"
          name="contactName"
          required
          value={formData.contactName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          Phone <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-300 mb-2">
          Business Type <span className="text-red-400">*</span>
        </label>
        <select
          id="businessType"
          name="businessType"
          required
          value={formData.businessType}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
        >
          <option value="">Select business type</option>
          <option value="Dispensary">Dispensary</option>
          <option value="Brand">Brand</option>
          <option value="Smoke Shop">Smoke Shop</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="tier" className="block text-sm font-medium text-gray-300 mb-2">
          Tier Interested In <span className="text-red-400">*</span>
        </label>
        <select
          id="tier"
          name="tier"
          required
          value={formData.tier}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
        >
          <option value="">Select tier</option>
          <option value="Founding">Founding Partner</option>
          <option value="Growth">Growth Amplifier</option>
          <option value="Authority">Market Authority</option>
          <option value="Not sure">Not sure</option>
        </select>
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
          Website or Instagram <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
          placeholder="https://..."
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        Submit Application
      </Button>

      {!compact && (
        <p className="text-center text-sm text-gray-400">
          Or{' '}
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, tier: 'Not sure' }));
            }}
            className="text-neon-green hover:underline"
          >
            request a custom quote
          </button>
        </p>
      )}
    </form>
  );
}

'use client';

import { Check } from 'lucide-react';
import Button from './Button';
import { useRouter } from 'next/navigation';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  tierValue: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Founding Partner',
    price: '$4,000',
    description: 'Limited availability for early adopters',
    features: [
      'Featured placement on Daily Dispo Deals',
      'Chrome extension visibility',
      'Social media mentions',
      'Early access to new features',
      'Dedicated support contact',
    ],
    tierValue: 'Founding',
  },
  {
    name: 'Growth Amplifier',
    price: '$6,000',
    description: 'Maximum reach across all channels',
    features: [
      'Everything in Founding Partner',
      'Video feature on DankNDevour',
      'Priority placement in search results',
      'Event sponsorship opportunities',
      'Custom content creation',
      'Analytics dashboard access',
    ],
    tierValue: 'Growth',
  },
  {
    name: 'Market Authority',
    price: '$12,000',
    description: 'Complete ecosystem dominance',
    features: [
      'Everything in Growth Amplifier',
      'Exclusive Ann Arbor Hash Bash presence',
      'Premium video production package',
      'Multi-channel campaign management',
      'White-glove account management',
      'Custom partnership terms',
    ],
    tierValue: 'Authority',
  },
];

export default function PricingCards() {
  const router = useRouter();

  const handleSelectTier = (tierValue: string) => {
    // Check if we're on the landing page
    const formElement = document.getElementById('apply-form');
    if (formElement) {
      // On landing page - scroll to form and set hash
      window.location.hash = `tier=${tierValue}`;
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Dispatch custom event to update form tier
      window.dispatchEvent(new CustomEvent('tierSelected', { detail: tierValue }));
    } else {
      // On other pages - navigate to apply page
      router.push(`/apply?tier=${tierValue.toLowerCase()}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className="bg-dark-surface/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8 flex flex-col hover:border-neon-green/50 transition-all duration-300"
        >
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-neon-green">{tier.price}</span>
              <span className="text-gray-400 ml-2">One-Time</span>
            </div>
            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="primary"
            onClick={() => handleSelectTier(tier.tierValue)}
            className="w-full"
          >
            Select {tier.name}
          </Button>
        </div>
      ))}
    </div>
  );
}

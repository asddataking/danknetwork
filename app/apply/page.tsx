'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import ApplyForm from '@/components/ApplyForm';
import { Check } from 'lucide-react';

const valueBullets = [
  'High-intent traffic from deal hunters',
  'Chrome extension puts you front and center',
  'Video content builds authentic trust',
  'Event presence during peak search times',
  'No recurring fees or contracts',
  'Dedicated support from our team',
];

const nextSteps = [
  {
    step: '1',
    title: 'Submit Application',
    description: 'Fill out the form with your business details. Takes less than a minute.',
  },
  {
    step: '2',
    title: 'Quick Review',
    description: 'We review applications within 24-48 hours and reach out via email.',
  },
  {
    step: '3',
    title: 'Onboarding Call',
    description: 'We schedule a call to discuss your goals and customize your partnership.',
  },
  {
    step: '4',
    title: 'Launch',
    description: 'Your partnership goes live across all ecosystem channels.',
  },
];

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<string>('');

  useEffect(() => {
    const tierParam = searchParams.get('tier');
    if (tierParam) {
      // Map URL param to form value
      const tierMap: Record<string, string> = {
        founding: 'Founding',
        growth: 'Growth',
        authority: 'Authority',
      };
      setTier(tierMap[tierParam.toLowerCase()] || '');
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen pt-20 pb-16">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Partner with The Dank Network
            </h1>
            <p className="text-xl text-gray-400">
              Join Michigan&apos;s premier cannabis media ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Value Props */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Why Partner With Us?
                </h2>
                <ul className="space-y-4">
                  {valueBullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-neon-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  What Happens Next?
                </h3>
                <div className="space-y-6">
                  {nextSteps.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center">
                        <span className="text-neon-green font-bold text-sm">
                          {step.step}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          {step.title}
                        </h4>
                        <p className="text-gray-400 text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              <div className="glass-card rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Apply Now
                </h2>
                <ApplyForm preselectedTier={tier} compact={false} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

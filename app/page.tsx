'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/Container';
import Button from '@/components/Button';
import PricingCards from '@/components/PricingCards';
import EcosystemGrid from '@/components/EcosystemGrid';
import SocialRow from '@/components/SocialRow';
import ApplyForm from '@/components/ApplyForm';
import StickyHeader from '@/components/StickyHeader';
import Link from 'next/link';

export default function HomePage() {
  const [preselectedTier, setPreselectedTier] = useState<string>('');

  useEffect(() => {
    // Check for tier in URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#tier=')) {
      const tier = hash.replace('#tier=', '');
      const tierMap: Record<string, string> = {
        Founding: 'Founding',
        Growth: 'Growth',
        Authority: 'Authority',
      };
      if (tierMap[tier]) {
        setPreselectedTier(tierMap[tier]);
      }
    }

    // Listen for tier selection events
    const handleTierSelect = (e: CustomEvent) => {
      setPreselectedTier(e.detail);
    };

    window.addEventListener('tierSelected' as any, handleTierSelect as EventListener);
    return () => {
      window.removeEventListener('tierSelected' as any, handleTierSelect as EventListener);
    };
  }, []);

  const scrollToForm = () => {
    const formElement = document.getElementById('apply-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <StickyHeader />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Own the Attention of Michigan&apos;s Cannabis Consumers.
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
                Daily deal traffic. Chrome extension visibility. Video credibility. Event spikes. All in one ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/apply">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Apply for Partner Access
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  onClick={scrollToForm}
                  className="w-full sm:w-auto"
                >
                  View Packages
                </Button>
              </div>
              <SocialRow />
            </div>
          </Container>
        </section>

        {/* Problem Section */}
        <section className="py-16 lg:py-24">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">
                The Problem with Traditional Marketing
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  'Social reach is restricted',
                  'Boosted posts disappear',
                  'Loyalty apps don\'t build culture',
                  'Paid ads lack trust',
                ].map((problem, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs">×</span>
                    </div>
                    <p className="text-gray-300 text-lg">{problem}</p>
                  </div>
                ))}
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-neon-green text-center">
                You don&apos;t need impressions. You need positioning.
              </p>
            </div>
          </Container>
        </section>

        {/* Ecosystem Section */}
        <section className="py-16 lg:py-24 bg-dark-surface/30">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                The Dank Network Ecosystem
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Four powerful channels working together to position your brand where Michigan&apos;s cannabis consumers are already looking.
              </p>
            </div>
            <EcosystemGrid />
          </Container>
        </section>

        {/* Packages Section */}
        <section className="py-16 lg:py-24">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Choose Your Partnership Tier
              </h2>
              <p className="text-gray-400 text-lg">
                One-time investment. No recurring fees. No contracts.
              </p>
            </div>
            <PricingCards />
          </Container>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 lg:py-24 bg-dark-surface/30">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Early Traction, Real Results
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                We&apos;re building something different. A media ecosystem that actually moves the needle for Michigan&apos;s cannabis businesses. Not impressions. Positioning.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-neon-green mb-2">4</div>
                  <p className="text-gray-400">Ecosystem Channels</p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-neon-green mb-2">1</div>
                  <p className="text-gray-400">Unified Platform</p>
                </div>
                <div className="glass-card rounded-xl p-6">
                  <div className="text-3xl font-bold text-neon-green mb-2">∞</div>
                  <p className="text-gray-400">Growth Potential</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Apply Section */}
        <section id="apply-form" className="py-16 lg:py-24">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Apply in 60 Seconds
                </h2>
                <p className="text-gray-400 text-lg mb-2">
                  No contracts. No recurring fees.
                </p>
                <p className="text-gray-400 text-lg">
                  We review applications fast.
                </p>
              </div>
              <div className="glass-card rounded-xl p-8 lg:p-12">
                <ApplyForm compact={false} preselectedTier={preselectedTier} />
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

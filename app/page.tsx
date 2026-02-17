'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Container from '@/components/Container';
import Button from '@/components/Button';
import PricingCards from '@/components/PricingCards';
import EcosystemGrid from '@/components/EcosystemGrid';
import SocialRow from '@/components/SocialRow';
import ApplyForm from '@/components/ApplyForm';
import StickyHeader from '@/components/StickyHeader';
import { ParallaxLayer } from '@/components/ParallaxSection';
import Link from 'next/link';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
};

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

  const mainRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ['start start', 'end end'],
  });
  const heroBgY = useTransform(scrollYProgress, [0, 0.3], ['0%', '25%']);
  const heroContentY = useTransform(scrollYProgress, [0, 0.15], ['0%', '8%']);

  return (
    <>
      <StickyHeader />
      <main ref={mainRef} className="min-h-screen overflow-hidden">
        {/* Hero Section with Parallax */}
        <motion.section 
          className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          {/* Parallax background orbs */}
          <motion.div 
            style={{ y: heroBgY }}
            className="absolute inset-0 pointer-events-none"
            aria-hidden
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-green/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-green/5 blur-3xl" />
          </motion.div>
          <Container className="relative z-10">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              style={{ y: heroContentY }}
              variants={staggerContainer}
            >
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                variants={fadeInUp}
              >
                Own the Attention of Michigan&apos;s Cannabis Consumers.
              </motion.h1>
              <motion.p 
                className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed"
                variants={fadeInUp}
              >
                Daily deal traffic. Chrome extension visibility. Video credibility. Event spikes. All in one ecosystem.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                variants={fadeInUp}
              >
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
              </motion.div>
              <motion.div variants={fadeInUp}>
                <SocialRow />
              </motion.div>
            </motion.div>
          </Container>
        </motion.section>

        {/* Problem Section */}
        <motion.section 
          className="relative py-16 lg:py-24 overflow-hidden"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <ParallaxLayer speed={-0.3} className="absolute -right-32 top-1/2 w-64 h-64 rounded-full bg-neon-green/5 blur-3xl pointer-events-none" />
          <ParallaxLayer speed={0.2} className="absolute -left-24 bottom-1/4 w-48 h-48 rounded-full bg-neon-green/5 blur-3xl pointer-events-none" />
          <Container>
            <motion.div 
              className="max-w-3xl mx-auto"
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center"
                variants={fadeInUp}
              >
                The Problem with Traditional Marketing
              </motion.h2>
              <motion.div 
                className="space-y-4 mb-8"
                variants={staggerContainer}
              >
                {[
                  'Social reach is restricted',
                  'Boosted posts disappear',
                  'Loyalty apps don\'t build culture',
                  'Paid ads lack trust',
                ].map((problem, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-4"
                    variants={fadeInUp}
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs">×</span>
                    </div>
                    <p className="text-gray-300 text-lg">{problem}</p>
                  </motion.div>
                ))}
              </motion.div>
              <motion.p 
                className="text-2xl lg:text-3xl font-bold text-neon-green text-center"
                variants={fadeInUp}
              >
                You don&apos;t need impressions. You need positioning.
              </motion.p>
            </motion.div>
          </Container>
        </motion.section>

        {/* Ecosystem Section */}
        <motion.section 
          className="relative py-16 lg:py-24 bg-dark-surface/30 overflow-hidden"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <ParallaxLayer speed={0.4} className="absolute left-1/2 -translate-x-1/2 top-0 w-[600px] h-32 bg-neon-green/5 blur-3xl pointer-events-none" />
          <Container>
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                The Dank Network Cannabis Ecosystem
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Four channels that position your dispensary where Michigan cannabis consumers are already looking: deals, extensions, video, events.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <EcosystemGrid />
            </motion.div>
          </Container>
        </motion.section>

        {/* Packages Section */}
        <motion.section 
          className="relative py-16 lg:py-24 overflow-hidden"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <ParallaxLayer speed={-0.25} className="absolute right-0 top-1/3 w-72 h-72 rounded-full bg-neon-green/5 blur-3xl pointer-events-none" />
          <Container>
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Choose Your Partnership Tier
              </h2>
              <p className="text-gray-400 text-lg">
                One-time investment. No recurring fees. No contracts.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <PricingCards />
            </motion.div>
          </Container>
        </motion.section>

        {/* Social Proof Section */}
        <motion.section 
          className="py-16 lg:py-24 bg-dark-surface/30"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <Container>
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold text-white mb-6"
                variants={fadeInUp}
              >
                Early Traction, Real Results
              </motion.h2>
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed mb-8"
                variants={fadeInUp}
              >
                We&apos;re building something different. A media ecosystem that actually moves the needle for Michigan&apos;s cannabis businesses. Not impressions. Positioning.
              </motion.p>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
                variants={staggerContainer}
              >
                {[
                  { number: '4', label: 'Ecosystem Channels' },
                  { number: '1', label: 'Unified Platform' },
                  { number: '∞', label: 'Growth Potential' },
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="glass-card rounded-xl p-6"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <div className="text-3xl font-bold text-neon-green mb-2">{stat.number}</div>
                    <p className="text-gray-400">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </Container>
        </motion.section>

        {/* Apply Section */}
        <motion.section 
          id="apply-form" 
          className="py-16 lg:py-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <Container>
            <motion.div 
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
            >
              <motion.div 
                className="text-center mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Apply in 60 Seconds
                </h2>
                <p className="text-gray-400 text-lg mb-2">
                  No contracts. No recurring fees.
                </p>
                <p className="text-gray-400 text-lg">
                  We review applications fast.
                </p>
              </motion.div>
              <motion.div 
                className="glass-card rounded-xl p-8 lg:p-12"
                variants={fadeInUp}
              >
                <ApplyForm compact={false} preselectedTier={preselectedTier} />
              </motion.div>
            </motion.div>
          </Container>
        </motion.section>
      </main>
    </>
  );
}

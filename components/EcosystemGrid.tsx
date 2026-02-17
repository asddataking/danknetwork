'use client';

import { ShoppingBag, Chrome, Video, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4 }
};

interface EcosystemCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ecosystemCards: EcosystemCard[] = [
  {
    icon: <ShoppingBag className="w-8 h-8" />,
    title: 'Daily Dispo Deals',
    description: 'High-intent deal hunters actively searching for cannabis deals',
  },
  {
    icon: <Chrome className="w-8 h-8" />,
    title: 'Chrome Extension',
    description: 'Front-of-screen visibility when users browse dispensary websites',
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: 'DankNDevour',
    description: 'Video content + social boost with authentic reviews and culture',
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Ann Arbor Hash Bash',
    description: 'Event + seasonal search spikes during Michigan\'s biggest cannabis event',
  },
];

export default function EcosystemGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {ecosystemCards.map((card, index) => (
        <motion.div
          key={index}
          className="bg-dark-surface/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300"
          variants={cardVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          custom={index}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          <div className="text-neon-green mb-4">{card.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
          <p className="text-gray-400 text-sm">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

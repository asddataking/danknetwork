'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { videos } from '@/data/videos';

interface ChannelsModalProps {
  onClose: () => void;
}

interface Channel {
  id: string;
  name: string;
  label: string;
  href: string;
  icon: string;
  episodeCount: number;
  hasNewContent: boolean;
  isActive: boolean;
  comingSoon: boolean;
  description?: string;
}

export default function ChannelsModal({ onClose }: ChannelsModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  function isNew(createdAt: string): boolean {
    const episodeDate = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return episodeDate > sevenDaysAgo;
  }

  const channels: Channel[] = [
    {
      id: 'danknddevour',
      name: "Dank'N'Devour",
      label: "DANK'N'DEVOUR",
      href: '/danknddevour',
      icon: 'DN',
      episodeCount: videos.filter(v => v.brand === 'danknddevour').length,
      hasNewContent: videos.some(v => v.brand === 'danknddevour' && isNew(v.createdAt)),
      isActive: true,
      comingSoon: false,
      description: 'Michigan food & weed review episodes',
    },
    {
      id: 'recipes',
      name: 'Dank Recipes',
      label: 'DANK RECIPES',
      href: '/recipes',
      icon: 'DR',
      episodeCount: videos.filter(v => v.brand === 'recipes').length,
      hasNewContent: videos.some(v => v.brand === 'recipes' && isNew(v.createdAt)),
      isActive: false,
      comingSoon: true,
      description: 'High & hungry home cooking',
    },
    {
      id: 'sports',
      name: 'Dank Sports',
      label: 'DANK SPORTS',
      href: '/sports',
      icon: 'DS',
      episodeCount: videos.filter(v => v.brand === 'sports').length,
      hasNewContent: videos.some(v => v.brand === 'sports' && isNew(v.createdAt)),
      isActive: false,
      comingSoon: true,
      description: 'Sports & game-day content',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-neon-green/50 shadow-2xl shadow-neon-green/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:text-neon-green hover:bg-neon-green/20 transition-all duration-200 flex items-center justify-center shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-neon-green/20">
          <h2 className="text-neon-green font-black text-3xl uppercase">Channels</h2>
          <p className="text-gray-400 text-sm mt-2">Browse all Dank Network channels</p>
        </div>

        {/* Channels Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`relative bg-dark-surface rounded-lg border-2 p-6 transition-all duration-200 ${
                  channel.isActive
                    ? 'border-neon-green/50 hover:border-neon-green hover:shadow-lg hover:shadow-neon-green/20 cursor-pointer'
                    : 'border-gray-800 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Channel Icon & Badges */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    channel.isActive ? 'bg-neon-green' : 'bg-gray-700'
                  }`}>
                    <span className={`font-black text-lg ${channel.isActive ? 'text-black' : 'text-gray-400'}`}>
                      {channel.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${channel.isActive ? 'text-white' : 'text-gray-500'}`}>
                      {channel.name}
                    </h3>
                    {channel.hasNewContent && channel.isActive && (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold uppercase mt-1 inline-block">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {channel.description && (
                  <p className={`text-sm mb-4 ${channel.isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                    {channel.description}
                  </p>
                )}

                {/* Episode Count */}
                <div className="mb-4">
                  <p className={`text-sm ${channel.isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                    {channel.episodeCount} {channel.episodeCount === 1 ? 'Episode' : 'Episodes'}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  {channel.isActive ? (
                    <span className="bg-neon-green/20 text-neon-green px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-700 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Coming Soon
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                {channel.isActive ? (
                  <Link
                    href={channel.href}
                    onClick={onClose}
                    className="block w-full bg-neon-green text-black font-bold py-2 px-4 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 text-center text-sm uppercase"
                  >
                    View Channel
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-800 text-gray-500 font-bold py-2 px-4 rounded-lg cursor-not-allowed text-center text-sm uppercase"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


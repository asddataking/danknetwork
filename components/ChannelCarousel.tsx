'use client';

import Link from 'next/link';
import { videos } from '@/data/videos';

interface Channel {
  id: string;
  name: string;
  label: string;
  href: string;
  icon: string;
  episodeCount: number;
  hasNewContent: boolean;
}

export default function ChannelCarousel() {
  // Calculate episode counts and new content status
  const channels: Channel[] = [
    {
      id: 'danknddevour',
      name: "Dank'N'Devour",
      label: "DANK'N'DEVOUR",
      href: '/danknddevour',
      icon: 'DN',
      episodeCount: videos.filter(v => v.brand === 'danknddevour').length,
      hasNewContent: videos.some(v => v.brand === 'danknddevour' && isNew(v.createdAt)),
    },
    {
      id: 'recipes',
      name: 'Dank Recipes',
      label: 'DANK RECIPES',
      href: '/recipes',
      icon: 'DR',
      episodeCount: videos.filter(v => v.brand === 'recipes').length,
      hasNewContent: videos.some(v => v.brand === 'recipes' && isNew(v.createdAt)),
    },
    {
      id: 'sports',
      name: 'Dank Sports',
      label: 'DANK SPORTS',
      href: '/sports',
      icon: 'DS',
      episodeCount: videos.filter(v => v.brand === 'sports').length,
      hasNewContent: videos.some(v => v.brand === 'sports' && isNew(v.createdAt)),
    },
  ];

  function isNew(createdAt: string): boolean {
    const episodeDate = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return episodeDate > sevenDaysAgo;
  }

  return (
    <div className="w-full">
      <h2 className="text-white font-bold text-xl mb-6 uppercase">Channels</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={channel.href}
            className="flex-shrink-0 w-64 bg-dark-surface rounded-lg border border-gray-800 hover:border-neon-green/50 transition-all duration-200 p-6 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-neon-green flex items-center justify-center">
                <span className="text-black font-black text-lg">{channel.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{channel.name}</h3>
                <p className="text-gray-400 text-sm">{channel.episodeCount} Episodes</p>
              </div>
              {channel.hasNewContent && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                  NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-neon-green text-sm font-semibold group-hover:translate-x-1 transition-transform">
              <span>View Channel</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


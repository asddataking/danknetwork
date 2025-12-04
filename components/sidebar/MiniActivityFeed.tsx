'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/auth/supabase';

interface Activity {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export function MiniActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time updates
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('activity_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: 'is_public=eq.true',
        },
        (payload) => {
          // Add new activity to the beginning of the list
          setActivities((prev) => [payload.new as Activity, ...prev].slice(0, 10));
          // Reset to show the newest activity
          setCurrentIndex(0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000); // Change activity every 5 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activity-feed?limit=10');
      const data = await response.json();
      
      if (data.activities) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-4 bg-dark-bg/50 border border-neon-green/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-xs">Loading activity...</span>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  const currentActivity = activities[currentIndex];
  const timeAgo = getTimeAgo(currentActivity.created_at);

  const content = (
    <div className="flex items-start space-x-3">
      {currentActivity.icon && (
        <span className="text-lg flex-shrink-0">{currentActivity.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold leading-tight mb-1">
          {currentActivity.title}
        </p>
        <p className="text-gray-400 text-xs leading-tight line-clamp-2">
          {currentActivity.message}
        </p>
        <span className="text-gray-500 text-[10px] mt-1 block">{timeAgo}</span>
      </div>
    </div>
  );

  return (
    <div className="mb-6 p-4 bg-dark-bg/50 border border-neon-green/20 rounded-lg hover:border-neon-green/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-neon-green text-xs font-bold uppercase">Live Activity</h3>
        {activities.length > 1 && (
          <div className="flex space-x-1">
            {activities.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-neon-green'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to activity ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {currentActivity.action_url ? (
        <Link
          href={currentActivity.action_url}
          className="block hover:text-neon-green transition-colors"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}


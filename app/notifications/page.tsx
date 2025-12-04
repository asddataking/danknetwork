'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/notifications/create';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

export default function NotificationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadNotifications();
    }
  }, [authLoading, isAuthenticated, user, filter]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    if (!user) return;

    const success = await markNotificationRead(notificationId, user.id);
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    const success = await markAllNotificationsRead(user.id);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'receipt_approved':
        return '✅';
      case 'receipt_rejected':
        return '⚠️';
      case 'points_awarded':
        return '🎉';
      case 'deal_alert':
        return '🔥';
      case 'referral_reward':
        return '🎁';
      case 'perk_available':
        return '🎫';
      case 'collection_updated':
        return '📚';
      default:
        return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-primary">
        <div className="px-6 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-brand-subtle" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-brand-ink">Notifications</h1>
                  <p className="text-brand-subtle">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="btn-secondary flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-brand-primary text-black'
                    : 'bg-brand-card text-brand-subtle hover:bg-brand-card/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-brand-primary text-black'
                    : 'bg-brand-card text-brand-subtle hover:bg-brand-card/80'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="card text-center py-12">
                <Bell className="w-16 h-16 text-brand-subtle mx-auto mb-4 opacity-50" />
                <p className="text-brand-subtle">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card ${!notification.is_read ? 'bg-brand-primary/5 border-brand-primary/20' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className={`font-semibold ${!notification.is_read ? 'text-brand-ink' : 'text-brand-subtle'}`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="flex-shrink-0 w-6 h-6 rounded-full border border-brand-subtle/20 hover:bg-brand-primary/10 flex items-center justify-center transition-colors"
                              aria-label="Mark as read"
                            >
                              <CheckCheck className="w-4 h-4 text-brand-subtle" />
                            </button>
                          )}
                        </div>
                        <p className="text-brand-subtle mb-3">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-subtle">
                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                          {notification.action_url && (
                            <Link
                              href={notification.action_url}
                              className="text-sm text-brand-primary hover:underline"
                            >
                              View Details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}




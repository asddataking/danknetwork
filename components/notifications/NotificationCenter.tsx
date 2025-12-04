'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/notifications/create';
import Link from 'next/link';

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

interface NotificationCenterProps {
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationCenter({ onClose, onUnreadCountChange }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);

      // Update unread count
      const unreadCount = (data || []).filter(n => !n.is_read).length;
      onUnreadCountChange?.(unreadCount);
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
      const unreadCount = notifications.filter(n => !n.is_read && n.id !== notificationId).length;
      onUnreadCountChange?.(unreadCount);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    const success = await markAllNotificationsRead(user.id);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onUnreadCountChange?.(0);
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
      default:
        return '📢';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-brand-card border border-brand-subtle/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-subtle/20">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-brand-ink">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-brand-primary hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-brand-bg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-brand-subtle" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-brand-subtle">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-subtle/10">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 hover:bg-brand-bg/50 transition-colors ${
                    !notification.is_read ? 'bg-brand-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-medium ${!notification.is_read ? 'text-brand-ink' : 'text-brand-subtle'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkRead(notification.id)}
                            className="flex-shrink-0 w-5 h-5 rounded-full border border-brand-subtle/20 hover:bg-brand-primary/10 flex items-center justify-center transition-colors"
                            aria-label="Mark as read"
                          >
                            <Check className="w-3 h-3 text-brand-subtle" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-brand-subtle mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brand-subtle">
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            onClick={onClose}
                            className="text-xs text-brand-primary hover:underline flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-subtle/20">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-sm text-brand-primary hover:underline"
          >
            View All Notifications
          </Link>
        </div>
      </motion.div>
    </div>
  );
}




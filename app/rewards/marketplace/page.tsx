'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, Gift, Users, ArrowLeft, Send, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface PointsTransfer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  transfer_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

export default function PointsMarketplacePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [transfers, setTransfers] = useState<PointsTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    recipientEmail: '',
    amount: '',
    message: '',
    type: 'transfer' as 'transfer' | 'gift',
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadMarketplaceData();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadMarketplaceData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get user points
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserPoints(profile.points);
      }

      // Get transfers (sent and received)
      const { data: transfersData, error } = await supabase
        .from('points_transfers')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransfers(transfersData || []);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!user || !transferForm.recipientEmail || !transferForm.amount) return;

    const amount = parseInt(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > userPoints) {
      alert('Insufficient points');
      return;
    }

    try {
      const response = await fetch('/api/points/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await getSupabaseClient().auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          recipientEmail: transferForm.recipientEmail,
          amount,
          message: transferForm.message || null,
          transferType: transferForm.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      // Reload data
      await loadMarketplaceData();
      setShowTransferModal(false);
      setTransferForm({
        recipientEmail: '',
        amount: '',
        message: '',
        type: 'transfer',
      });
      alert('Transfer initiated successfully!');
    } catch (error: any) {
      console.error('Error transferring points:', error);
      alert(error.message || 'Failed to transfer points');
    }
  };

  const getTransferLabel = (transfer: PointsTransfer) => {
    if (transfer.from_user_id === user?.id) {
      return transfer.transfer_type === 'gift' ? 'Gift Sent' : 'Transfer Sent';
    }
    return transfer.transfer_type === 'gift' ? 'Gift Received' : 'Transfer Received';
  };

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
                  href="/rewards"
                  className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-brand-subtle" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-brand-ink">Points Marketplace</h1>
                  <p className="text-brand-subtle">Transfer and gift points to friends</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Transfer Points
              </button>
            </div>

            {/* Balance Card */}
            <div className="card mb-6">
              <div className="text-sm text-brand-subtle mb-2">Available Balance</div>
              <div className="text-4xl font-bold text-brand-ink mb-4">{userPoints.toLocaleString()}</div>
              <div className="text-sm text-brand-subtle">
                Transfer limits: 1,000 points/day, 5,000 points/month
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setTransferForm({ ...transferForm, type: 'transfer' });
                  setShowTransferModal(true);
                }}
                className="card hover:bg-brand-card/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="font-semibold text-brand-ink">Transfer</div>
                </div>
                <p className="text-sm text-brand-subtle">Send points to another user</p>
              </button>
              <button
                onClick={() => {
                  setTransferForm({ ...transferForm, type: 'gift' });
                  setShowTransferModal(true);
                }}
                className="card hover:bg-brand-card/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="font-semibold text-brand-ink">Gift</div>
                </div>
                <p className="text-sm text-brand-subtle">Gift points with a message</p>
              </button>
            </div>

            {/* Transfer History */}
            <div className="card">
              <h3 className="font-semibold text-brand-ink mb-4">Recent Transfers</h3>
              {transfers.length === 0 ? (
                <div className="text-center py-8 text-brand-subtle">
                  <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No transfers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-3 bg-brand-bg rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {transfer.from_user_id === user?.id ? (
                          <ArrowUp className="w-5 h-5 text-orange-500" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <div className="font-medium text-brand-ink">
                            {getTransferLabel(transfer)}
                          </div>
                          {transfer.message && (
                            <div className="text-sm text-brand-subtle">{transfer.message}</div>
                          )}
                          <div className="text-xs text-brand-subtle">
                            {new Date(transfer.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right font-bold ${
                        transfer.from_user_id === user?.id ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {transfer.from_user_id === user?.id ? '-' : '+'}
                        {transfer.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTransferModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-card border border-brand-subtle/20 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-brand-ink mb-4">
                {transferForm.type === 'gift' ? 'Gift Points' : 'Transfer Points'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={transferForm.recipientEmail}
                    onChange={(e) => setTransferForm({ ...transferForm, recipientEmail: e.target.value })}
                    placeholder="friend@example.com"
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Amount</label>
                  <input
                    type="number"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    placeholder="100"
                    min="1"
                    max={userPoints}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                  />
                  <div className="text-xs text-brand-subtle mt-1">
                    Available: {userPoints.toLocaleString()} points
                  </div>
                </div>
                {transferForm.type === 'gift' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-ink mb-2">Message (Optional)</label>
                    <textarea
                      value={transferForm.message}
                      onChange={(e) => setTransferForm({ ...transferForm, message: e.target.value })}
                      placeholder="Add a personal message..."
                      rows={3}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 bg-brand-card border border-brand-subtle/20 rounded-xl text-brand-ink hover:bg-brand-card/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={!transferForm.recipientEmail || !transferForm.amount || parseInt(transferForm.amount) > userPoints}
                  className="flex-1 px-4 py-2 bg-brand-primary text-black rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transferForm.type === 'gift' ? 'Send Gift' : 'Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}




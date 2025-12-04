'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Gift, Receipt, 
  UserPlus, Crown, Filter, Calendar, Download,
  ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface PointsTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  reference_type: string | null;
  description: string | null;
  created_at: string;
  metadata: any;
}

export default function PointsHistoryPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all' as 'all' | 'earn' | 'burn' | 'bonus' | 'transfer_sent' | 'transfer_received',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'year'
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadTransactions();
    }
  }, [authLoading, isAuthenticated, user, filter]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      let query = supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply type filter
      if (filter.type !== 'all') {
        if (filter.type === 'earn') {
          query = query.in('transaction_type', ['earn', 'bonus']);
        } else if (filter.type === 'burn') {
          query = query.eq('transaction_type', 'burn');
        } else {
          query = query.eq('transaction_type', filter.type);
        }
      }

      // Apply date range filter
      if (filter.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filter.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, referenceType: string | null) => {
    switch (type) {
      case 'earn':
      case 'bonus':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'burn':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'transfer_sent':
        return <ArrowUp className="w-5 h-5 text-orange-500" />;
      case 'transfer_received':
        return <ArrowDown className="w-5 h-5 text-blue-500" />;
      default:
        if (referenceType === 'receipt') return <Receipt className="w-5 h-5 text-brand-primary" />;
        if (referenceType === 'perk') return <Gift className="w-5 h-5 text-brand-primary" />;
        if (referenceType === 'promotion') return <Sparkles className="w-5 h-5 text-brand-primary" />;
        return <TrendingUp className="w-5 h-5 text-brand-primary" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
      case 'bonus':
      case 'transfer_received':
        return 'text-green-500';
      case 'burn':
      case 'transfer_sent':
        return 'text-red-500';
      default:
        return 'text-brand-subtle';
    }
  };

  const calculateStats = () => {
    const earned = transactions
      .filter(t => t.transaction_type === 'earn' || t.transaction_type === 'bonus' || t.transaction_type === 'transfer_received')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const burned = transactions
      .filter(t => t.transaction_type === 'burn' || t.transaction_type === 'transfer_sent')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { earned, burned, net: earned - burned };
  };

  const stats = calculateStats();

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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-brand-ink mb-2">Points History</h1>
              <p className="text-brand-subtle">Complete breakdown of all your points activity</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="card">
                <div className="text-sm text-brand-subtle mb-1">Total Earned</div>
                <div className="text-2xl font-bold text-green-500">{stats.earned.toLocaleString()}</div>
              </div>
              <div className="card">
                <div className="text-sm text-brand-subtle mb-1">Total Spent</div>
                <div className="text-2xl font-bold text-red-500">{stats.burned.toLocaleString()}</div>
              </div>
              <div className="card">
                <div className="text-sm text-brand-subtle mb-1">Net Points</div>
                <div className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.net >= 0 ? '+' : ''}{stats.net.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-brand-subtle" />
                <h3 className="font-semibold text-brand-ink">Filters</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Type</label>
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="earn">Earned</option>
                    <option value="burn">Spent</option>
                    <option value="bonus">Bonuses</option>
                    <option value="transfer_sent">Sent</option>
                    <option value="transfer_received">Received</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">Date Range</label>
                  <select
                    value={filter.dateRange}
                    onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as any })}
                    className="w-full px-4 py-2 bg-brand-bg border border-subtle/20 rounded-xl text-brand-ink focus:outline-none focus:border-brand-primary"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            {transactions.length === 0 ? (
              <div className="card text-center py-12">
                <TrendingUp className="w-16 h-16 text-brand-subtle mx-auto mb-4 opacity-50" />
                <p className="text-brand-subtle">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.transaction_type, transaction.reference_type)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-brand-ink mb-1">
                          {transaction.description || 
                            `${transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)} Points`}
                        </div>
                        <div className="text-sm text-brand-subtle">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                          {transaction.reference_type && (
                            <span className="ml-2 capitalize">• {transaction.reference_type}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`text-right font-bold text-lg ${getTransactionColor(transaction.transaction_type)}`}>
                        {transaction.transaction_type === 'burn' || transaction.transaction_type === 'transfer_sent' 
                          ? '-' 
                          : '+'}
                        {Math.abs(transaction.amount).toLocaleString()}
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




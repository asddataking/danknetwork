'use client';

import { motion } from 'framer-motion';
import { Upload, Crown, TrendingUp, Gift, Camera, FileImage, CheckCircle, Clock, Sparkles, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import CountUp from '@/components/rewards/CountUp';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { getUserProfileWithPremium, getUserReceipts, getActivePerks } from '@/lib/rewards/supabase';

export default function RewardsDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const RECEIPTS_LIMIT_FREE = 15;
  const [userStats, setUserStats] = useState({
    points: 0,
    tier: 'Bronze',
    premium: false,
    totalSaved: 0,
    receiptsUploaded: 0,
    perksRedeemed: 0,
    receiptsThisMonth: 0
  });
  const [recentOffers, setRecentOffers] = useState<any[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load user data from database
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || authLoading || !user) return;
      
      setLoadingStats(true);
      try {

        // Load user profile
        const profile = await getUserProfileWithPremium(user.id);
        if (profile) {
          // Calculate receipts this month
          const receipts = await getUserReceipts(user.id, 100);
          const now = new Date();
          const thisMonthReceipts = receipts.filter(r => {
            const receiptDate = new Date(r.created_at);
            return receiptDate.getMonth() === now.getMonth() && 
                   receiptDate.getFullYear() === now.getFullYear();
          });

          // Calculate total saved (approximate: points / 2 = dollars)
          const totalSaved = profile.points / 2;

          setUserStats({
            points: profile.points || 0,
            tier: profile.tier || 'Bronze',
            premium: profile.isPremium,
            totalSaved,
            receiptsUploaded: receipts.length,
            perksRedeemed: 0, // TODO: Load from perk_redemptions
            receiptsThisMonth: thisMonthReceipts.length
          });

          // Load recent receipts
          const recent = receipts.slice(0, 5).map(r => ({
            id: r.id,
            partner: r.merchant_name || r.partner?.business_name || 'Unknown',
            amount: r.total || 0,
            points: r.points_awarded || 0,
            status: r.status,
            date: r.created_at
          }));
          setRecentReceipts(recent);
        }

        // Load active perks (top 3)
        const perks = await getActivePerks(true);
        const topPerks = perks.slice(0, 3).map(p => ({
          id: p.id,
          partner: p.partner?.business_name || 'DankPass',
          title: p.title,
          pointsCost: p.points_cost,
          expiresAt: p.expires_at || null
        }));
        setRecentOffers(topPerks);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, authLoading, user, refreshKey]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    if (!user) {
      alert('Please sign in to upload receipts');
      return;
    }

    // Check upload limit for free tier
    if (!userStats.premium && userStats.receiptsThisMonth >= RECEIPTS_LIMIT_FREE) {
      alert(`You've reached your monthly limit of ${RECEIPTS_LIMIT_FREE} receipts. Upgrade to Premium for unlimited uploads!`);
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload each file
      const results = [];
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        
        const response = await fetch('/api/receipts/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to upload receipt');
        }
        
        results.push(data.receipt);
      }
      
      setUploadedFiles([]);
      
      // Show summary
      const totalPoints = results.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
      const approvedCount = results.filter(r => r.status === 'approved').length;
      const pendingCount = results.filter(r => r.status === 'pending').length;
      
      let message = 'Receipts uploaded successfully!\n\n';
      if (approvedCount > 0) {
        message += `✓ ${approvedCount} automatically approved (${totalPoints} points)\n`;
      }
      if (pendingCount > 0) {
        message += `⏳ ${pendingCount} pending manual review\n`;
      }
      message += '\nPoints will be added to your account once approved!';
      
      alert(message);
      
      // Refresh data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload receipts. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-brand-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-brand-warn" />;
      case 'rejected':
        return <FileImage className="w-5 h-5 text-brand-error" />;
      default:
        return <FileImage className="w-5 h-5 text-brand-subtle" />;
    }
  };

  // Show auth prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Crown className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Sign In to Access DankPass Rewards
          </h2>
          <p className="text-brand-subtle mb-6">
            Create an account to start earning points, redeeming perks, and getting exclusive deals!
          </p>
          <div className="space-y-3">
            <p className="text-sm text-brand-subtle">
              🔥 For now, head to{' '}
              <a href="https://dailydispodeals.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-primary">
                Daily Dispo Deals
              </a>{' '}
              to subscribe and get premium access across the entire network!
            </p>
            <a href="https://dailydispodeals.com" target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">
              Get Started with Premium
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" key={refreshKey}>
      {/* Header */}
      <div className="px-6 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-ink">
                Welcome to DankPass Rewards!
              </h1>
              <p className="muted">Earn points, redeem perks, unlock exclusive deals</p>
            </div>
            {!isPremium && !premiumLoading && (
              <Link href="/rewards/premium" className="btn-ghost flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Go Premium</span>
              </Link>
            )}
          </div>

          {/* Premium Upgrade CTA */}
          {!isPremium && !premiumLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-brand-primary/10 border border-brand-primary/30 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-brand-ink mb-2">Unlock DankPass Premium</h3>
                  <p className="text-sm text-brand-subtle mb-4">
                    Get 1.5x points on every purchase, unlimited receipt uploads, exclusive perks, and full access to{' '}
                    <a href="https://dailydispodeals.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-primary">
                      Daily Dispo Deals Premium
                    </a>.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-brand-subtle">
                      <Zap className="w-4 h-4 text-brand-primary" />
                      <span>1.5x Points Multiplier</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-subtle">
                      <Upload className="w-4 h-4 text-brand-primary" />
                      <span>Unlimited Uploads</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-subtle">
                      <Gift className="w-4 h-4 text-brand-primary" />
                      <span>Exclusive Perks</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-subtle">
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      <span>Daily Deals Premium</span>
                    </div>
                  </div>
                  <Link href="/rewards/premium" className="btn-primary inline-flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium - $4.20/mo
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* What is DankPass Info */}
          <div className="mb-6 p-6 bg-brand-card rounded-2xl border border-brand-subtle/10">
            <h3 className="text-lg font-bold text-brand-ink mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-primary" />
              What is DankPass?
            </h3>
            <p className="text-sm text-brand-subtle mb-4">
              DankPass is your all-in-one rewards program for the cannabis community. Earn points by uploading receipts from partner businesses, then redeem those points for exclusive perks, discounts, and deals.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-brand-ink mb-1 text-sm">📸 Upload Receipts</h4>
                <p className="text-xs text-brand-subtle">Snap a photo of your receipt and earn points automatically</p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-ink mb-1 text-sm">🎁 Redeem Perks</h4>
                <p className="text-xs text-brand-subtle">Use your points to unlock exclusive rewards and discounts</p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-ink mb-1 text-sm">🔥 Premium Benefits</h4>
                <p className="text-xs text-brand-subtle">Get 1.5x points, unlimited uploads, and exclusive access</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,255,136,0.12)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-ink">
                    {loadingStats ? (
                      <div className="h-8 w-16 bg-brand-subtle/20 rounded animate-pulse" />
                    ) : (
                      <CountUp value={userStats.points} />
                    )}
                  </div>
                  <div className="muted">Points</div>
                </div>
              </div>
            </div>

            <div className="card hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,255,136,0.12)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-success/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-brand-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-ink">
                    {loadingStats ? (
                      <div className="h-8 w-20 bg-brand-subtle/20 rounded animate-pulse" />
                    ) : (
                      userStats.tier
                    )}
                  </div>
                  <div className="muted">Tier</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Ring */}
          <div className="card mb-6 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,255,136,0.12)] transition-all">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">Today&apos;s Progress</h3>
            <div className="flex items-center justify-center">
              <div className="activity-ring">
                <svg viewBox="0 0 100 100">
                  <circle
                    className="background"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className="progress"
                    cx="50"
                    cy="50"
                    r="45"
                    strokeDashoffset={283 - (283 * 0.75)} // 75% progress
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-ink">75%</div>
                    <div className="muted">Goal</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center muted mt-4">
              Earn {userStats.points} more points to reach your daily goal!
            </p>
          </div>

          {/* Upload Limit Info */}
          {!userStats.premium && (
            <div className="mb-6 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-ink">
                  {userStats.receiptsThisMonth} / {RECEIPTS_LIMIT_FREE} receipts this month
                </span>
                <Link href="/rewards/premium" className="text-sm text-brand-primary font-medium hover:underline">
                  Upgrade
                </Link>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="mb-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-brand-primary bg-brand-primary/10' 
                  : 'border-brand-ink/20 bg-brand-bg'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: dragActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Camera className="w-12 h-12 text-brand-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-brand-ink mb-2">
                  Drop your receipt here
                </h3>
                <p className="muted mb-4">
                  Or click to browse files
                </p>
                <p className="text-sm text-brand-subtle">
                  Supports JPG, PNG, and PDF files
                </p>
              </motion.div>
            </div>

            {/* Upload Tips */}
            <div className="mt-4 p-4 bg-brand-card rounded-xl">
              <h4 className="font-medium text-brand-ink mb-2">Tips for best results:</h4>
              <ul className="muted space-y-1">
                <li>• Make sure the receipt is clearly visible</li>
                <li>• Include the total amount and business name</li>
                <li>• Avoid blurry or dark photos</li>
                <li>• Receipts must be from partner businesses</li>
              </ul>
            </div>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-brand-ink mb-4">Ready to Upload</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    className="card flex items-center gap-3 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,255,136,0.12)] transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <FileImage className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-brand-ink">{file.name}</p>
                      <p className="muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-brand-subtle hover:text-brand-ink"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} Receipt${uploadedFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Recent Offers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-ink">Available Offers</h3>
              <Link href="/rewards/perks" className="text-sm text-brand-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentOffers.map((offer) => (
                <motion.div
                  key={offer.id}
                  className="card hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,255,136,0.12)] transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-brand-ink">{offer.title}</h4>
                      <p className="muted">{offer.partner}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-brand-primary">{offer.pointsCost} pts</div>
                      <div className="muted text-xs">Expires {offer.expiresAt}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Receipts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">Recent Receipts</h3>
            <div className="space-y-3">
              {recentReceipts.map((receipt) => (
                <motion.div
                  key={receipt.id}
                  className="card hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,255,136,0.12)] transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-bg rounded-xl flex items-center justify-center">
                      <FileImage className="w-6 h-6 text-brand-subtle" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-brand-ink">{receipt.partner}</h4>
                      <p className="muted">${receipt.amount} • {receipt.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(receipt.status)}
                      <div className="text-right">
                        <div className="text-sm font-medium text-brand-success">
                          {receipt.status === 'approved' ? `+${receipt.points} pts` : ''}
                        </div>
                        <div className={`text-xs capitalize ${
                          receipt.status === 'approved' ? 'text-brand-success' : 
                          receipt.status === 'pending' ? 'text-brand-warn' : 'text-brand-error'
                        }`}>
                          {receipt.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


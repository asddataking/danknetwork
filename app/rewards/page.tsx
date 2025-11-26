'use client';

import { motion } from 'framer-motion';
import { Upload, Crown, TrendingUp, Gift, Camera, FileImage, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import CountUp from '@/components/rewards/CountUp';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';

export default function RewardsDashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const RECEIPTS_LIMIT_FREE = 15;

  // TODO: Load actual user data from Supabase
  // For now, show mock data but use real premium status
  const userStats = {
    points: 1250,
    tier: 'Gold',
    premium: isPremium,
    totalSaved: 89.50,
    receiptsUploaded: 12,
    perksRedeemed: 3,
    receiptsThisMonth: 8
  };

  const recentOffers = [
    {
      id: 1,
      partner: 'Green Valley Dispensary',
      title: '20% off edibles',
      pointsCost: 500,
      expiresAt: '2024-01-15'
    },
    {
      id: 2,
      partner: 'Pizza Palace',
      title: 'Free appetizer',
      pointsCost: 300,
      expiresAt: '2024-01-20'
    }
  ];

  const [recentReceipts] = useState([
    {
      id: 1,
      partner: 'Green Valley Dispensary',
      amount: 45.00,
      points: 90,
      status: 'approved',
      date: '2024-01-10'
    },
    {
      id: 2,
      partner: 'Pizza Palace',
      amount: 28.50,
      points: 57,
      status: 'pending',
      date: '2024-01-12'
    }
  ]);

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
    
    // TODO: Check upload limit for free tier from Supabase
    if (!userStats.premium && userStats.receiptsThisMonth >= RECEIPTS_LIMIT_FREE) {
      alert(`You've reached your monthly limit of ${RECEIPTS_LIMIT_FREE} receipts. Upgrade to Premium for unlimited uploads!`);
      return;
    }
    
    setIsUploading(true);
    
    try {
      // TODO: Implement Supabase upload logic
      console.log('Uploading files:', uploadedFiles);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadedFiles([]);
      alert('Receipt uploaded successfully! Points will be added once verified.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload receipts. Please try again.');
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
              🔥 For now, head to Daily Dispo Deals to subscribe and get premium access across the entire network!
            </p>
            <Link href="/deals" className="btn-primary inline-block">
              Get Started with Premium
            </Link>
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
              <p className="muted">Ready to earn some points?</p>
            </div>
            {!isPremium && !premiumLoading && (
              <Link href="/rewards/premium" className="btn-ghost flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Go Premium</span>
              </Link>
            )}
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
                    <CountUp value={userStats.points} />
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
                  <div className="text-2xl font-bold text-brand-ink">{userStats.tier}</div>
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


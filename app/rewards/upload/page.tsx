'use client';

import { motion } from 'framer-motion';
import { Camera, FileImage, Upload as UploadIcon, CheckCircle, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';

export default function UploadPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const loading = authLoading || premiumLoading;
  const RECEIPTS_LIMIT_FREE = 15;

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
    
    // TODO: Check actual upload count from database when rewards tables exist
    // For now, just check premium status for limit enforcement
    if (!isPremium) {
      alert(`Free tier: ${RECEIPTS_LIMIT_FREE} receipts/month. Upgrade to Premium for unlimited uploads!`);
      // In production, check actual count before allowing upload
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
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload receipts. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <User className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Sign In Required
          </h2>
          <p className="text-brand-subtle mb-6">
            Please sign in to upload receipts and earn points
          </p>
          <Link href="/deals" className="btn-primary inline-block">
            Sign In / Sign Up
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="px-6 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-ink mb-2">📸 Upload Receipt</h1>
            <p className="muted">Snap a photo and earn points instantly</p>
            {!isPremium && (
              <p className="text-sm text-brand-primary mt-2">
                Free tier: {RECEIPTS_LIMIT_FREE} uploads/month • <Link href="/rewards/premium" className="underline">Upgrade for unlimited</Link>
              </p>
            )}
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-brand-primary bg-brand-primary/10' 
                  : 'border-brand-ink/20 bg-brand-card'
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
                <Camera className="w-16 h-16 text-brand-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brand-ink mb-2">
                  Drop your receipt here
                </h3>
                <p className="muted mb-4">
                  Or tap to take a photo or browse files
                </p>
                <p className="text-sm text-brand-subtle">
                  Supports JPG, PNG, and PDF files
                </p>
              </motion.div>
            </div>

            {/* Upload Tips */}
            <div className="mt-6 card">
              <h4 className="font-semibold text-brand-ink mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-success" />
                Tips for best results
              </h4>
              <ul className="muted space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary">•</span>
                  <span>Make sure the receipt is clearly visible and well-lit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary">•</span>
                  <span>Include the total amount and business name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary">•</span>
                  <span>Avoid blurry or dark photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-primary">•</span>
                  <span>Receipts must be from partner businesses</span>
                </li>
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
                    className="card flex items-center gap-3"
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
                      className="text-brand-subtle hover:text-brand-ink text-2xl"
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
                <UploadIcon className="w-5 h-5" />
                {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} Receipt${uploadedFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* How it Works */}
          <div className="card bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 border-brand-primary/20">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">How it works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-brand-ink">Upload Receipt</h4>
                  <p className="muted">Take a photo or upload your receipt from a partner business</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-brand-ink">Automatic Verification</h4>
                  <p className="muted">Our system automatically verifies and processes your receipt</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-brand-ink">Earn Points</h4>
                  <p className="muted">Get points added to your account (typically $1 = 2 points)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Link to Partners */}
          <div className="mt-6 text-center">
            <Link href="/rewards" className="text-brand-primary hover:underline">
              View Partner Businesses →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


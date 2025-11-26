/**
 * AuthModal Component
 * 
 * Simple modal for sign in and sign up
 * Uses Supabase Auth with email/password
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { signIn, signUp, resetPassword } from '@/lib/auth/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'reset';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Signed in successfully!');
          setTimeout(() => {
            onClose();
            window.location.reload(); // Refresh to update auth state
          }, 1000);
        }
      } else if (mode === 'signup') {
        const result = await signUp(email, password, { full_name: fullName });
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Account created! Check your email to verify.');
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else if (mode === 'reset') {
        const result = await resetPassword(email);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Password reset link sent! Check your email.');
          setTimeout(() => {
            setMode('signin');
            setSuccess('');
          }, 2000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-brand-card border border-brand-subtle/20 rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-brand-subtle hover:text-brand-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-ink mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-brand-subtle">
              {mode === 'signin' && 'Sign in to access your account'}
              {mode === 'signup' && 'Join Dank Network to get started'}
              {mode === 'reset' && 'Enter your email to reset your password'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-brand-ink mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-subtle" />
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-subtle/20 rounded-lg text-brand-ink focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-ink mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-subtle" />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-subtle/20 rounded-lg text-brand-ink focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-ink mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-subtle" />
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-subtle/20 rounded-lg text-brand-ink focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Send Reset Link'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => setMode('reset')}
                  className="text-brand-primary hover:underline mr-4"
                >
                  Forgot password?
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className="text-brand-primary hover:underline"
                >
                  Create account
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => setMode('signin')}
                className="text-brand-primary hover:underline"
              >
                Already have an account? Sign in
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => setMode('signin')}
                className="text-brand-primary hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


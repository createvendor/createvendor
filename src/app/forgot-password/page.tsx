'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/auth';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset error:", err);
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50/50">
      <div className="w-full max-w-[380px] bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-gray-900" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Reset password</h2>
          <p className="mt-2 text-sm text-gray-500">
            We'll send a recovery link to your email.
          </p>
        </div>

        {!success ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-gray-700">Email address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Check your inbox</h3>
              <p className="text-xs text-gray-500">A reset link has been sent to your email.</p>
            </div>
            <button 
              onClick={() => setSuccess(false)}
              className="text-xs text-blue-600 hover:underline"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

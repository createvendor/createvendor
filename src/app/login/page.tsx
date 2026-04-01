'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle } from '@/lib/auth';
import Link from 'next/link';
import { 
  Loader2, 
  Mail, 
  Lock, 
  Chrome,
  X
} from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signIn(email, password);
      router.push('/dashboard'); 
    } catch (err: any) {
      console.error("Login error:", err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[450px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-8 md:p-10 relative overflow-hidden">
        {/* Close Button */}
        <Link href="/" className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400">
          <X size={24} />
        </Link>

        {/* Logo Section */}
        <div className="mb-8 flex justify-center">
          <Logo className="scale-110" />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold text-[#1A1A1A] leading-tight">
            Welcome back
          </h1>
          <p className="text-[#A0A0A0] text-[15px] mt-2 font-medium">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-[#444] ml-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-5 py-3.5 rounded-[16px] border border-[#EBEBEB] focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[#333] placeholder:text-[#C5C5C5] bg-white text-[15px]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[13px] font-bold text-[#444]">Password</label>
              <Link href="/forgot-password" title="Recover Access" className="text-[12px] font-bold text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-5 py-3.5 rounded-[16px] border border-[#EBEBEB] focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[#333] placeholder:text-[#C5C5C5] bg-white text-[15px]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-[18px] text-[16px] font-extrabold text-white bg-gray-900 hover:bg-black transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-[12px] font-bold uppercase text-gray-400">
            <span className="bg-white px-4">Social login</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 rounded-[18px] text-[15px] font-bold text-[#333] border-2 border-[#EBEBEB] hover:bg-gray-50 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Chrome className="h-5 w-5 text-[#4285F4]" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-[14px] text-[#A0A0A0] font-medium">
          New here? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

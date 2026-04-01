'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { Loader2, X } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    fullName: user?.displayName || '',
    phoneNumber: '',
    category: 'General',
    address: ''
  });

  React.useEffect(() => {
    if (!authLoading && user?.email === 'bishalmishra9000@gmail.com') {
      router.push('/admin');
    }
    if (user?.displayName && !formData.fullName) {
        setFormData(prev => ({ ...prev, fullName: user.displayName || '' }));
    }
  }, [user, authLoading, router]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const storeId = formData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Demo Mode Simulation
    if (!db) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Demo Store Created:", { ...formData, storeId });
      router.push(`/dashboard/${storeId}`);
      return;
    }

    try {
      const storeRef = doc(db, 'stores', storeId);
      
      await setDoc(storeRef, {
        name: formData.storeName,
        category: formData.category,
        ownerId: user.uid,
        ownerName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        createdAt: new Date(),
        status: 'ACTIVE'
      });

      // Update user profile with storeId and role
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        storeId: storeId,
        role: 'STORE_OWNER',
        phoneNumber: formData.phoneNumber,
        displayName: formData.fullName
      });

      router.push(`/dashboard/${storeId}`);
    } catch (error) {
      console.error("Error creating store:", error);
      alert("Failed to create store. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-8 md:p-10 relative overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X size={24} />
        </button>

        {/* Logo Section */}
        <div className="mb-10">
          <Logo className="scale-110 origin-left" />
        </div>

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-[26px] font-extrabold text-[#1A1A1A] leading-tight">
            Little more about you and your store
          </h1>
          <p className="text-[#A0A0A0] text-[15px] mt-2 font-medium">
            You can always change this anytime afterwards
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleCreateStore} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#333333] flex items-center gap-1">
              Store Name <span className="text-red-500 font-normal">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
              className="w-full px-5 py-4 rounded-[16px] border border-[#EBEBEB] focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[#333333] placeholder:text-[#C5C5C5] bg-white text-[15px]"
              placeholder="eg: Samaya Electronics"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#333333] flex items-center gap-1">
              Your Full Name <span className="text-red-500 font-normal">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-5 py-4 rounded-[16px] border border-[#EBEBEB] focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[#333333] placeholder:text-[#C5C5C5] bg-white text-[15px]"
              placeholder="eg: Shyam Shrestha"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-[#333333] flex items-center gap-1">
              Phone Number <span className="text-red-500 font-normal">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-5 py-4 rounded-[16px] border border-[#EBEBEB] focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-[#333333] placeholder:text-[#C5C5C5] bg-white text-[15px]"
              placeholder="eg: 9800000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.storeName || !formData.fullName || !formData.phoneNumber}
            className={`w-full py-5 rounded-[18px] text-[17px] font-extrabold text-white transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 mt-6 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#FF9494] hover:bg-[#FF7A7A] shadow-[#FF9494]/30'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Setting up your store...
              </>
            ) : (
              'Signup and Create Store'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-[13px] text-[#A0A0A0] font-medium">
          By continuing, you agree to our <span className="text-blue-500 hover:underline cursor-pointer">Terms & Conditions</span>
        </div>
      </div>
    </div>
  );
}

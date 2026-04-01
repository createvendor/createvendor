'use client';

import React from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { StoreDashboardSidebar } from '@/components/StoreDashboardSidebar';
import { ToastProvider } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, profile, storeId: userStoreId, loading } = useAuth();
  
  const storeIdFromUrl = params?.storeId as string;
  const isEditor = pathname?.includes('visual-editor') || pathname?.includes('code-editor');

  // ✧ Security Guard for 1000+ Vendors
  const isAuthorized = React.useMemo(() => {
    if (loading) return null;
    if (!user) return false;
    
    // Developer bypass for bishal
    if (user.email === 'bishalmishra9000@gmail.com') return true;
    
    // Vendor must match the store ID in the URL
    return userStoreId === storeIdFromUrl;
  }, [user, userStoreId, storeIdFromUrl, loading]);

  // Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Unauthorized State
  if (isAuthorized === false) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            You do not have permission to access this store's dashboard. Please log in with the correct account or contact support.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row relative">
        {!isEditor && <StoreDashboardSidebar />}
        <div className={`flex-1 overflow-y-auto h-screen custom-scrollbar ${!isEditor ? 'pt-16 lg:pt-0' : ''}`}>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}

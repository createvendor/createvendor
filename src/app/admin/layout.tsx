'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { ToastProvider } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.email !== 'bishalmishra9000@gmail.com')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.email !== 'bishalmishra9000@gmail.com') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row relative">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto h-screen custom-scrollbar pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}

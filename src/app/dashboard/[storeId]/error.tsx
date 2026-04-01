'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Standard practice is to ignore AbortErrors (they are expected on navigation/aborted fetches)
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.warn('Caught and suppressed AbortError');
        return;
    }
    console.error('Dashboard Error:', error);
  }, [error]);

  // If it's an AbortError, we might want to just reset automatically or ignore the overlay
  // But Next.js already shows the overlay. We can try to render a clean fallback.
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center mb-8">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 mb-10 text-[14px] max-w-sm leading-relaxed">
        We encountered an error while loading this page. This might be a temporary connection issue.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white py-3 px-8 rounded-2xl text-[14px] font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <Link
          href="/"
          className="bg-white border border-gray-200 text-gray-700 py-3 px-8 rounded-2xl text-[14px] font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Home className="h-4 w-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}

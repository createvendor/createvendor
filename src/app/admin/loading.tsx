'use client';

import React from 'react';

export default function AdminLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="loading-bar"></div>
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
        <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-14 w-14 bg-slate-100 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-50 rounded"></div>
              <div className="h-6 w-12 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-8">
        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-6"></div>
        <div className="flex gap-4">
          <div className="h-12 w-40 bg-slate-100 rounded-xl"></div>
          <div className="h-12 w-40 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

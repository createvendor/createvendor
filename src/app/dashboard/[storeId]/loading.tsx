'use client';

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row relative">
      <div className="loading-bar"></div>
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-white h-screen sticky top-0">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-full bg-gray-50 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-8 w-full bg-gray-50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </aside>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-8 space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>

          {/* Large Card Skeleton */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 h-[400px] animate-pulse">
            <div className="h-6 w-32 bg-gray-100 rounded-lg mb-6"></div>
            <div className="h-full w-full bg-gray-50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

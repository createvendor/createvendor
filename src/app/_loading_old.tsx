'use client';

import React from 'react';
import { Logo } from '@/components/Logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="loading-bar"></div>
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Inner Pulsing Core */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-4">
        <Logo showText={false} className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
            Optimal Speed Initializing
        </p>
        <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

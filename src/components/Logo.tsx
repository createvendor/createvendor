'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Colorful Dots/Splats */}
        <div className="absolute -top-1 -left-1 flex space-x-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          <div className="w-1 h-1 rounded-full bg-pink-500 mt-1"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
        </div>
        <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-orange-500"></div>
        
        {/* Shopping Cart Icon (Blue) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-blue-600"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {/* Location Pin with 'B' */}
        <div className="absolute -top-1 right-0 transform translate-x-1/4 -translate-y-1/4">
          <div className="relative">
            <div className="w-5 h-5 bg-[#7ED321] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-[10px] font-bold text-white leading-none">B</span>
            </div>
            {/* Tail of the pin */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#7ED321]"></div>
          </div>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex font-bold text-2xl tracking-tight">
          <span className="text-blue-600">Create</span>
          <span className="text-[#FF8C00]">Vendor</span>
        </div>
      )}
    </div>
  );
};

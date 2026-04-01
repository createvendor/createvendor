'use client';

import React from 'react';
import { Star } from 'lucide-react';

export const ReviewSection: React.FC<{ productId: string }> = ({ productId }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-500">
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 text-gray-300" />
        </div>
        <span className="ml-2 text-sm text-gray-600">4.0 out of 5 stars</span>
      </div>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              JD
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">John Doe</h3>
              <div className="flex text-yellow-500 text-xs">
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Great product! Highly recommended.</p>
        </div>
      </div>
    </div>
  );
};

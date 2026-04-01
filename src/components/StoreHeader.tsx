'use client';

import React from 'react';
import { Store } from '../types';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export const StoreHeader: React.FC<{ store: Store }> = ({ store }) => {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/store/${store.id}`} className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight">{store.name}</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Cart
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LayoutDashboard, User, LogOut, Search } from 'lucide-react';
import { logout } from '../lib/auth';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { user, profile, storeId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
            <form onSubmit={handleSearch} className="w-full max-w-lg relative" suppressHydrationWarning>
              <div className="relative flex items-center w-full h-10 rounded-full focus-within:shadow-sm bg-muted overflow-hidden">
                <div className="grid place-items-center h-full w-12 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent"
                  type="text"
                  id="search"
                  placeholder="Search products across all stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/track-order" className="text-sm font-medium text-muted-foreground hover:text-primary hidden md:block">
              Track Order
            </Link>
            {user ? (
              <>
                {profile?.role === 'STORE_OWNER' && storeId && (
                  <Link href={`/dashboard/${storeId}`} className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                {profile?.role === 'SUPER_ADMIN' && (
                  <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Link>
                )}
                  <Link href="/account/orders" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    <span className="hidden sm:inline">My Orders</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium hidden sm:inline">{profile?.displayName}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-destructive hover:text-destructive/80 flex items-center"
                >
                  <LogOut className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

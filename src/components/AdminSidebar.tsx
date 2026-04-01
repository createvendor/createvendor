'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/auth';
import {
  LayoutDashboard,
  Store,
  Users,
  Settings,
  ShieldAlert,
  Menu,
  X,
  ChevronsUpDown,
  LogOut,
  Package,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // If not super admin, don't render (safety check, though route should protect too)
  if (user?.email !== 'bishalmishra9000@gmail.com') return null;

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: `/admin` },
    { label: 'All Stores', icon: Store, href: `/admin/stores` },
    { label: 'All Users', icon: Users, href: `/admin/users` },
    { label: 'System Settings', icon: Settings, href: `/admin/settings` },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-red-600 text-white border-b z-50 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6" />
          <span className="font-bold tracking-wide">Super Admin</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-white">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:h-screen lg:shadow-xl
      `}>
        <div className="p-5 border-b border-slate-800 hidden lg:block bg-slate-950">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-lg tracking-wide">Main Admin</h2>
              <p className="text-[10px] text-red-400 truncate uppercase tracking-widest font-bold">System Control</p>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-4 mt-16 lg:mt-0">
          <nav className="space-y-2 px-3">
            {navItems.map((item, idx) => {
              const Icon = item.icon as any;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                    ${isActive ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 mt-auto">
          <div className="flex items-center space-x-3 w-full p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 border-2 border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-400">
                A
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-sm font-bold text-white truncate">Main Admin</h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
            <button 
              onClick={() => {
                logout().then(() => {
                  window.location.href = '/login';
                })
              }}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

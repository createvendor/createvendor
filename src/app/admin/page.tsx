'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store, Users, ShoppingCart, Activity, ShieldCheck, Globe, Server, Database, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStores: 0,
    totalUsers: 0,
    totalOrders: 0,
    systemHealth: '99.9%',
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [storesSnap, usersSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, 'stores')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders'))
        ]);

        setStats({
          totalStores: storesSnap.size,
          totalUsers: usersSnap.size,
          totalOrders: ordersSnap.size,
          systemHealth: 'Optimal',
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  if (stats.loading) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Master Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Security Active</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">SYSTEM NERVE CENTER</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time global oversight of the Create Vendor network.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">System Status</p>
                    <p className="text-white font-bold text-sm">All Nodes Online</p>
                </div>
            </div>
          </div>
        </div>

        {/* Global KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Global Stores', value: stats.totalStores, icon: Globe, color: 'text-blue-400', sub: 'Active Merchants' },
            { label: 'Total Accounts', value: stats.totalUsers, icon: Users, color: 'text-emerald-400', sub: 'Verified across system' },
            { label: 'Bridge Revenue', value: stats.totalOrders, icon: Activity, color: 'text-purple-400', sub: 'Total transaction nodes' },
            { label: 'Database Health', value: '100%', icon: Database, color: 'text-amber-400', sub: 'Real-time sync active' },
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:bg-slate-800/50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-slate-800 ${kpi.color} group-hover:scale-110 transition-transform`}>
                    <kpi.icon className="h-6 w-6" />
                </div>
                <Bell className="h-4 w-4 text-slate-700" />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-3xl font-black text-white mt-1">{kpi.value}</p>
              <p className="text-[10px] text-slate-600 mt-2 font-medium">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Core Management Nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Merchant Infrastructure</h2>
                    <Server className="h-5 w-5 text-slate-600" />
                </div>
                <div className="space-y-4">
                    <Link href="/admin/stores" className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl hover:bg-slate-850 transition-all border border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                <Store className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Store Registry</p>
                                <p className="text-[10px] text-slate-500">Monitor and modify all vendor sites</p>
                            </div>
                        </div>
                        <Activity className="h-4 w-4 text-slate-700" />
                    </Link>
                    <Link href="/admin/users" className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl hover:bg-slate-850 transition-all border border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">User Authentication</p>
                                <p className="text-[10px] text-slate-500">Manage global permissions</p>
                            </div>
                        </div>
                        <Activity className="h-4 w-4 text-slate-700" />
                    </Link>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center">
                <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-red-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Master Override Protocol</h3>
                <p className="text-sm text-slate-500 max-w-sm">Every action taken within this dashboard is logged and verified at the system level for security.</p>
                <div className="mt-8 flex gap-4 w-full px-4">
                    <Link href="/admin/settings" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition">System Settings</Link>
                    <button className="flex-1 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-bold uppercase tracking-widest">Emergency Shutdown</button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}

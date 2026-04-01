'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package,
  Calendar,
  Filter,
  Download,
  Activity,
  Zap,
  MousePointer2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { db } from '@/firebase/config';
import { Order, Product } from '@/types';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    const params = useParams();
    const storeId = params?.storeId as string;
    
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [orderData, setOrderData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        uniqueCustomers: 0,
        revenueChange: '+14.2%',
        ordersChange: '+5.1%',
        customersChange: '+8.4%',
        aovChange: '+2.3%'
    });

    useEffect(() => {
        if (!storeId) return;

        const ordersQuery = query(collection(db, 'orders'), where('storeId', '==', storeId));
        
        const unsubscribe = onSnapshot(ordersQuery, (snap) => {
            const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            
            // Calculate Stats
            const totalRev = orders.reduce((acc, order) => acc + (order.total || 0), 0);
            const uniqueCust = new Set(orders.map(o => o.shippingAddress?.email || o.id)).size;
            
            setStats(prev => ({
                ...prev,
                totalRevenue: totalRev,
                totalOrders: orders.length,
                avgOrderValue: orders.length > 0 ? totalRev / orders.length : 0,
                uniqueCustomers: uniqueCust
            }));

            // Process Chart Data (Last 14 Days)
            const daysArr = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                daysArr.push({
                    date: d.toISOString().split('T')[0],
                    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: 0,
                    orders: 0
                });
            }

            orders.forEach(order => {
                const orderDate = (order.createdAt as any)?.toDate?.() || new Date(order.createdAt as any);
                const dateKey = orderDate.toISOString().split('T')[0];
                const day = daysArr.find(d => d.date === dateKey);
                if (day) {
                    day.revenue += order.total || 0;
                    day.orders += 1;
                }
            });

            setRevenueData(daysArr);
            setOrderData(daysArr);

            // Process Category Distribution (Mocking category analysis from products in orders)
            const catMap: Record<string, number> = {};
            orders.forEach(o => {
                o.items?.forEach(item => {
                    const cat = 'General'; // In real app we'd fetch product category
                    catMap[cat] = (catMap[cat] || 0) + (item.price * item.quantity);
                });
            });
            const catArr = Object.entries(catMap).map(([name, value]) => ({ name, value }));
            setCategoryData(catArr.length > 0 ? catArr : [{ name: 'Stable', value: 100 }]);

            setLoading(false);
        });

        return () => unsubscribe();
    }, [storeId]);

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );

    return (
        <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32">
            <div className="max-w-[1440px] mx-auto">
                
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in slide-in-from-left duration-500">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Intelligence & Insights</h1>
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">Advanced</div>
                        </div>
                        <p className="text-[14px] text-gray-500 font-medium">Predictive modeling and deep-dive performance metrics</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-white border border-gray-100 px-6 py-3.5 rounded-2xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Custom Range
                        </button>
                        <button className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2 text-[14px]">
                            <Download className="h-4 w-4" /> Export Report
                        </button>
                    </div>
                </div>

                {/* Core KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                   {/* Revenue Card */}
                   <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform" />
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <DollarSign className="h-6 w-6" />
                         </div>
                         <div className="flex items-center gap-1 text-emerald-500 text-[12px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" /> {stats.revenueChange}
                         </div>
                      </div>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Revenue</p>
                      <h2 className="text-[28px] font-black text-gray-900 tracking-tighter">Rs {stats.totalRevenue.toLocaleString()}</h2>
                   </div>

                   {/* Volume Card */}
                   <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform" />
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6" />
                         </div>
                         <div className="flex items-center gap-1 text-emerald-500 text-[12px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" /> {stats.ordersChange}
                         </div>
                      </div>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Volume</p>
                      <h2 className="text-[28px] font-black text-gray-900 tracking-tighter">{stats.totalOrders}</h2>
                   </div>

                   {/* Customers Card */}
                   <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform" />
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="h-6 w-6" />
                         </div>
                         <div className="flex items-center gap-1 text-emerald-500 text-[12px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" /> {stats.customersChange}
                         </div>
                      </div>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Growth Index</p>
                      <h2 className="text-[28px] font-black text-gray-900 tracking-tighter">{stats.uniqueCustomers}</h2>
                   </div>

                   {/* AOV Card */}
                   <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform" />
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Activity className="h-6 w-6" />
                         </div>
                         <div className="flex items-center gap-1 text-emerald-500 text-[12px] font-black bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp className="h-3 w-3" /> {stats.aovChange}
                         </div>
                      </div>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">AOV Average</p>
                      <h2 className="text-[28px] font-black text-gray-900 tracking-tighter">Rs {stats.avgOrderValue.toFixed(0)}</h2>
                   </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Revenue Area Chart */}
                    <div className="lg:col-span-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
                        <div className="flex items-center justify-between mb-12">
                           <div>
                              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Revenue Dynamics</h3>
                              <p className="text-[13px] text-gray-500 mt-1">Daily gross revenue trajectory across 14-day window</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Projection:</span>
                              <span className="text-[11px] font-black text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">Linear</span>
                           </div>
                        </div>

                        <div className="h-[400px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={revenueData}>
                                 <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid vertical={false} stroke="#f8fafc" strokeDasharray="3 3" />
                                 <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                    dy={15}
                                 />
                                 <YAxis hide />
                                 <Tooltip 
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                                    labelStyle={{ fontWeight: 800, color: '#111827', marginBottom: '10px', fontSize: '14px' }}
                                    itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                                 />
                                 <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    name="Revenue (Rs)"
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)"
                                    animationDuration={1500}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                 />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Insights */}
                    <div className="lg:col-span-4 space-y-8">
                       {/* Allocation Pie */}
                       <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 h-full flex flex-col items-center text-center">
                          <h3 className="text-[17px] font-bold text-gray-900 mb-2">Category Spread</h3>
                          <p className="text-[13px] text-gray-400 mb-8">Revenue distribution by category</p>
                          
                          <div className="h-[200px] w-full relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                   <Pie
                                      data={categoryData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={90}
                                      paddingAngle={8}
                                      dataKey="value"
                                      cornerRadius={12}
                                   >
                                      {categoryData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                   </Pie>
                                </PieChart>
                             </ResponsiveContainer>
                          </div>

                          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                             {categoryData.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                   <span className="text-[11px] font-bold text-gray-600 truncate">{c.name}</span>
                                </div>
                             ))}
                          </div>

                          <div className="mt-auto pt-8 border-t border-gray-50 w-full">
                             <div className="flex items-center justify-between">
                                <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                                <span className="text-[12px] font-black text-blue-600">Stable</span>
                             </div>
                          </div>
                       </div>
                    </div>

                </div>

                {/* Bottom Row - Bar Chart & Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 animate-in slide-in-from-bottom-8 duration-1000">
                   
                   {/* Order Volume Bar Chart */}
                   <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
                      <div className="flex items-center justify-between mb-12">
                         <div>
                            <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Daily Fulfilment</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Transaction counts per 24-hour cycle</p>
                         </div>
                         <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5" />
                         </div>
                      </div>

                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={orderData}>
                              <CartesianGrid vertical={false} stroke="#f8fafc" strokeDasharray="3 3" />
                              <XAxis 
                                 dataKey="label" 
                                 axisLine={false} 
                                 tickLine={false} 
                                 tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                 dy={10}
                              />
                              <YAxis hide />
                              <Tooltip 
                                 cursor={{ fill: '#f8fafc' }}
                                 contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                              />
                              <Bar 
                                 dataKey="orders" 
                                 name="Total Orders"
                                 fill="#10b981" 
                                 radius={[12, 12, 4, 4]} 
                                 barSize={32}
                                 animationDuration={2000}
                              />
                           </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   {/* Activity Feed / System Pulse */}
                   <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10">
                      <div className="flex items-center justify-between mb-10">
                         <div>
                            <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Storefront Pulse</h3>
                            <p className="text-[13px] text-gray-500 mt-1">Recent conversion activity and events</p>
                         </div>
                         <button className="text-[12px] font-black text-blue-600 hover:underline">View All Records</button>
                      </div>

                      <div className="space-y-6">
                         {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="flex items-center gap-6 p-5 rounded-[1.8rem] bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                               <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                  <Zap className="h-5 w-5" />
                               </div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                     <p className="text-[14px] font-bold text-gray-900 mb-0.5">Automated Event #{1000 + item}</p>
                                     <span className="text-[11px] font-black text-gray-400">2h ago</span>
                                  </div>
                                  <p className="text-[12px] text-gray-500 font-medium">Conversion optimization triggered for visitor segment Alpha</p>
                               </div>
                               <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                            </div>
                         ))}
                      </div>
                   </div>

                </div>

            </div>
        </div>
    );
}

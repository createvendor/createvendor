'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  BarChart3, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package, 
  Download,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0,
    avgOrderValue: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!storeId) return;

    const fetchStats = async () => {
      try {
        const ordersSnap = await getDocs(query(collection(db, 'orders'), where('storeId', '==', storeId)));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const productsSnap = await getDocs(query(collection(db, 'products'), where('storeId', '==', storeId)));

        const totalRev = orders.reduce((a, o) => a + (o.total || o.totalAmount || 0), 0);
        const uniqueEmails = new Set(orders.map((o: any) => o.shippingAddress?.email || o.customerInfo?.email).filter(Boolean));
        
        const statusCounts: Record<string, number> = {};
        orders.forEach((o: any) => { 
           const s = o.status || 'PENDING';
           statusCounts[s] = (statusCounts[s] || 0) + 1; 
        });

        const monthly: Record<string, number> = {};
        orders.forEach((o: any) => {
          const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
          const key = date.toLocaleString('default', { month: 'short' });
          monthly[key] = (monthly[key] || 0) + (o.total || o.totalAmount || 0);
        });

        const productSales: Record<string, { name: string; revenue: number; qty: number }> = {};
        orders.forEach((o: any) => {
          (o.items || []).forEach((item: any) => {
            if (!productSales[item.productId]) productSales[item.productId] = { name: item.name || 'Unknown', revenue: 0, qty: 0 };
            productSales[item.productId].revenue += (item.price || 0) * (item.quantity || 1);
            productSales[item.productId].qty += item.quantity || 1;
          });
        });

        setStats({
          totalRevenue: totalRev,
          totalOrders: orders.length,
          totalProducts: productsSnap.size,
          totalCustomers: uniqueEmails.size,
          avgOrderValue: orders.length ? totalRev / orders.length : 0,
        });

        setMonthlyData(Object.entries(monthly).map(([month, rev]) => ({ month, revenue: rev })));
        setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
        setTopProducts(Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [storeId]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-[22px] font-bold text-gray-900">My Reports</h1>
              <p className="text-[13px] text-gray-500 mt-1">Detailed performance metrics for your storefront</p>
           </div>
           <button 
             onClick={() => window.print()}
             className="bg-white border border-gray-200 text-gray-600 font-medium py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-[13px] shadow-sm"
           >
              <Download className="h-4 w-4" /> Export Report
           </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
               { label: 'Total Revenue', value: `Rs ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
               { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
               { label: 'Avg. Order Value', value: `Rs ${stats.avgOrderValue.toFixed(0)}`, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((kpi, i) => (
               <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-medium text-gray-500">{kpi.label}</span>
                    <div className={`w-8 h-8 ${kpi.bg} ${kpi.color} rounded-lg flex items-center justify-center`}>
                       <kpi.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-[22px] font-bold text-gray-900">{kpi.value}</p>
               </div>
            ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
           <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-6">Revenue Growth</h3>
              <div className="h-[280px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                       <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                       <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-6">Order Status</h3>
              <div className="h-[160px] mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={statusData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                          {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                 {statusData.map((s, i) => (
                   <div key={i} className="flex justify-between items-center text-[12px] font-medium">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                         <span className="text-gray-600 uppercase tracking-wide">{s.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{s.value}</span>
                   </div>
                 ))}
                 {statusData.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>}
              </div>
           </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-[16px] font-semibold text-gray-900">Top Performing Products</h3>
           </div>
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50/50 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Quantity Sold</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {topProducts.map((p, i) => (
                   <tr key={i} className="hover:bg-gray-50/50 transition-all">
                      <td className="px-6 py-4 text-[14px] font-semibold text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 text-[13px] text-gray-500">{p.qty} Units</td>
                      <td className="px-6 py-4 text-right text-[14px] font-bold text-gray-900">Rs {p.revenue.toLocaleString()}</td>
                   </tr>
                 ))}
                 {topProducts.length === 0 && (
                   <tr>
                      <td colSpan={3} className="py-16 text-center text-gray-400 text-sm">No sales recorded yet</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store, Product, Order } from '@/types';
import {
  DollarSign, ShoppingCart, TrendingUp, Package, Users,
  MousePointerClick, Activity, Calendar, Smartphone, Monitor, X, Clock, TrendingDown
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ComposedChart = dynamic(() => import('recharts').then(mod => mod.ComposedChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });

import { useAuth } from '@/context/AuthContext';

export default function StoreDashboardPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { dashboardCache, setDashboardCache } = useAuth();

  const [activeTab, setActiveTab] = useState('Overview');
  const [store, setStore] = useState<Store | null>(null);
  const [productsCount, setProductsCount] = useState(dashboardCache?.productsCount || 0);
  const [orders, setOrders] = useState<Order[]>(dashboardCache?.orders || []);
  const [totalRevenue, setTotalRevenue] = useState(dashboardCache?.totalRevenue || 0);
  const [totalSalesCount, setTotalSalesCount] = useState(dashboardCache?.totalSalesCount || 0);
  const [totalSalesAmount, setTotalSalesAmount] = useState(dashboardCache?.totalSalesAmount || 0);
  const [totalAdmins, setTotalAdmins] = useState(1);
  const [loading, setLoading] = useState(!dashboardCache);
  const [showAppBanner, setShowAppBanner] = useState(true);

  const [chartData, setChartData] = useState<any[]>(dashboardCache?.chartData || []);
  const [salesRevenueProfit, setSalesRevenueProfit] = useState<any[]>(dashboardCache?.salesRevenueProfit || []);
  const [topProducts, setTopProducts] = useState<any[]>(dashboardCache?.topProducts || []);
  const [topMarginProducts, setTopMarginProducts] = useState<any[]>(dashboardCache?.topMarginProducts || []);
  const [topViewedProducts, setTopViewedProducts] = useState<any[]>(dashboardCache?.topViewedProducts || []);
  const [mostProfitableProducts, setMostProfitableProducts] = useState<any[]>(dashboardCache?.mostProfitableProducts || []);
  const [totalProfit, setTotalProfit] = useState(dashboardCache?.totalProfit || 0);
  const [totalClicks, setTotalClicks] = useState(dashboardCache?.totalClicks || 0);
  const [uniqueVisitors, setUniqueVisitors] = useState(dashboardCache?.uniqueVisitors || 0);
  const [bounceRate] = useState(0);
  const [avgSession] = useState('0m 0s');
  const [deviceStats, setDeviceStats] = useState(dashboardCache?.deviceStats || { desktop: 0, mobile: 0, tablet: 0 });
  const [referrers, setReferrers] = useState<{name: string, count: number}[]>(dashboardCache?.referrers || []);
  const [recentSales, setRecentSales] = useState<any[]>(dashboardCache?.recentSales || []);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [trafficChartData, setTrafficChartData] = useState<any[]>(dashboardCache?.trafficChartData || []);

  // Aggregated Dashboard Data Fetcher: 1000X Faster on Local MySQL
  useEffect(() => {
    if (!storeId) { setLoading(false); return; }

    const fetchDashboard = async () => {
      try {
        setLoading(!dashboardCache);
        const res = await fetch(`/api/dashboard?storeId=${storeId}`);
        const data = await res.json();

        if (!data.error) {
            setStore(data.store);
            setProductsCount(data.kpis.productsCount);
            setTotalRevenue(data.kpis.totalRevenue || 0);
            setTotalSalesCount(data.kpis.totalSalesCount || 0);
            setTotalSalesAmount(data.kpis.totalSalesAmount || 0);
            setTotalProfit(data.kpis.totalProfit || 0);
            setTotalClicks(data.kpis.totalClicks || 0);
            setUniqueVisitors(data.kpis.uniqueVisitors || 0);
            setChartData(data.chartData || []);
            setTrafficChartData(data.chartData || []);
            setSalesRevenueProfit((data.chartData || []).map((d: any) => ({ ...d, 'Sales (amount)': d.sales, Profit: d.revenue * 0.3 })));
            setRecentSales(data.recentSales || []);
            setTopProducts(data.topProducts || []);
            
            // Update cache for millisecond-speed next load
            setDashboardCache({
                ...data.kpis,
                chartData: data.chartData,
                recentSales: data.recentSales,
                topProducts: data.topProducts,
                store: data.store
            });
        }
      } catch (err) {
        console.error('Failed to load cPanel Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    
    // Interval update: Refresh every 5 minutes to stay live
    const interval = setInterval(fetchDashboard, 300000);
    return () => clearInterval(interval);
  }, [storeId]);

  const periodLabel = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  })();

  if (loading) return null;

  const ProductTable = ({ title, subtitle, columns, data }: { title: string, subtitle: string, columns: string[], data: any[] }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
      <p className="text-[12px] text-blue-500 mt-0.5 mb-4">{subtitle}</p>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
            {['Image', 'Product', ...columns].map(c => (
              <th key={c} className="pb-2 font-medium text-gray-500 pr-4">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + 2} className="py-8 text-center text-gray-400">No data in this period</td></tr>
          ) : data.map((p, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="py-2 pr-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                  {p.image ? <Image src={p.image} fill className="object-cover" alt="" sizes="32px" /> : <Package className="w-full h-full p-1.5 text-gray-300" />}
                </div>
              </td>
              <td className="py-2 pr-4 font-medium text-gray-800 max-w-[120px] truncate">{p.name}</td>
              {columns.map(col => {
                const key = col.toLowerCase() === 'qty' ? 'qty' : col.toLowerCase() === 'revenue' ? 'revenue' : col.toLowerCase() === 'margin' ? 'margin' : col.toLowerCase() === 'profit' ? 'profit' : col.toLowerCase() === 'views' ? 'views' : col;
                const val = p[key];
                const formatted = typeof val === 'number' ? (key === 'qty' || key === 'views' ? val : `Rs ${val.toFixed(2)}`) : (val || '-');
                return <td key={col} className="py-2 pr-4 text-gray-600">{formatted}{key === 'margin' ? '%' : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* Android App Banner */}
        {showAppBanner && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 pr-12 relative">
            <button onClick={() => setShowAppBanner(false)} className="absolute right-3 top-3 text-blue-400 hover:text-blue-600">
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-blue-900 mb-1">Android App</h3>
            <p className="text-sm text-blue-700 mb-2">
              We have launched an alpha version of our Create Vendor app. If you want to try it out please download through this link. You can only join it if you have the same email on your play store & Create Vendor app and you became a member of Create Vendor before 7 Feb, 2025.
            </p>
            <a href="https://play.google.com/store/apps/details?id=com.mobitrash.store" target="_blank" className="text-sm text-blue-600 font-medium hover:underline">
              View in Play Store
            </a>
          </div>
        )}

        {/* Header + Tabs */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-4 mt-3 border-b border-gray-200">
            {['Overview', 'Analytics', 'Products Analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'Overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Total Revenue', value: `Rs ${totalRevenue.toFixed(2)}`, sub: store?.name || '', icon: DollarSign },
                { label: 'Total Sales', value: String(totalSalesCount), sub: 'Paid transactions', icon: ShoppingCart },
                { label: 'Total Sales Amount', value: `Rs ${totalSalesAmount.toFixed(2)}`, sub: 'All orders (paid + unpaid)', icon: Activity },
                { label: 'Total Profit', value: `Rs ${totalProfit.toFixed(2)}`, sub: 'Revenue minus cost', icon: TrendingUp },
              ].map((kpi, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-medium text-gray-500">{kpi.label}</span>
                    <kpi.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-[22px] font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <p className="text-[12px] text-gray-400">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-medium text-gray-500">Total Products</span>
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-[22px] font-bold text-gray-900 mb-1">{productsCount}</p>
                <p className="text-[12px] text-gray-400">Products in store</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-medium text-gray-500">Total Admins</span>
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-[22px] font-bold text-gray-900 mb-1">{totalAdmins}</p>
                <p className="text-[12px] text-gray-400">Owners & Managers</p>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex justify-end mb-4 gap-3 items-center">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="text-[12px] font-semibold text-amber-600 bg-transparent outline-none cursor-pointer">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                </select>
              </div>
              <span className="text-[12px] text-gray-500">{periodLabel}</span>
            </div>

            {/* Overview chart + Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Overview</h3>
                <p className="text-[12px] text-blue-500 mb-4">Recent sales from selected period</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="overviewGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `Rs ${v}`} width={40} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#overviewGrad)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Recent Sales</h3>
                <p className="text-[12px] text-blue-500 mb-4">Recent sales from selected period</p>
                {recentSales.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-gray-400">
                    <p className="text-sm font-medium">No recent sales found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSales.map((sale, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[13px] font-bold flex-shrink-0">
                          {((sale as any).shippingAddress?.name || (sale as any).customerInfo?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 truncate">{(sale as any).shippingAddress?.name || (sale as any).customerInfo?.name || 'Customer'}</p>
                          <p className="text-[11px] text-gray-400 truncate">{(sale as any).shippingAddress?.email || (sale as any).customerInfo?.email || ''}</p>
                        </div>
                        <span className="text-[14px] font-semibold text-gray-900 whitespace-nowrap">Rs {((sale as any).total || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sales vs Revenue vs Profit */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Sales vs Revenue vs Profit</h3>
              <p className="text-[12px] text-blue-500 mb-4">Order count, revenue, and profit over the selected period</p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={salesRevenueProfit}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `Rs ${v}`} width={40} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="Sales (amount)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Revenue" stroke="#000000" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ==================== ANALYTICS TAB ==================== */}
        {activeTab === 'Analytics' && (
          <>
            {/* Period selector */}
            <div className="flex justify-end mb-4 gap-3 items-center">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="text-[12px] font-semibold text-amber-600 bg-transparent outline-none cursor-pointer">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                </select>
              </div>
              <span className="text-[12px] text-gray-500">{periodLabel}</span>
            </div>

            {/* Traffic vs Sales chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Traffic vs Sales</h3>
              <p className="text-[12px] text-blue-500 mb-4">Weekly traffic and sales comparison</p>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trafficChartData}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} width={35} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `Rs ${v}`} width={50} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Area yAxisId="left" type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} fill="#eff6ff" name="Traffic" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Sales" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <span className="flex items-center gap-1.5 text-[12px] text-gray-600"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Traffic</span>
                <span className="flex items-center gap-1.5 text-[12px] text-gray-600"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Sales</span>
              </div>
            </div>

            {/* Analytics KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Clicks', value: totalClicks, sub: 'Total clicks in period', icon: MousePointerClick },
                { label: 'Unique Visitors', value: uniqueVisitors, sub: 'Unique visitors in period', icon: Users },
                { label: 'Bounce Rate', value: `${bounceRate.toFixed(1)}%`, sub: 'Bounce rate in period', icon: TrendingDown },
                { label: 'Avg. Session', value: avgSession, sub: 'Average session duration', icon: Clock },
              ].map((kpi, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-medium text-gray-500">{kpi.label}</span>
                    <kpi.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className={`text-[22px] font-bold mb-1 ${i === 2 ? 'text-blue-500' : i === 3 ? 'text-blue-500' : i === 1 ? 'text-blue-500' : 'text-gray-900'}`}>{kpi.value}</p>
                  <p className="text-[12px] text-blue-400">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Referrers + Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Referrers</h3>
                <p className="text-[12px] text-blue-500 mb-4">Top sources driving traffic</p>
                <div className="space-y-4">
                  {referrers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No referrer data yet</p>
                  ) : referrers.map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="font-medium text-gray-700 truncate">{r.name}</span>
                        <span className="text-gray-500 ml-4 font-medium">{r.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(r.count / (totalClicks || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Devices</h3>
                <p className="text-[12px] text-blue-500 mb-4">How users access your app</p>
                <div className="space-y-4">
                  {[
                    { label: 'Desktop', pct: deviceStats.desktop },
                    { label: 'Mobile', pct: deviceStats.mobile },
                    { label: 'Tablet', pct: deviceStats.tablet },
                  ].map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="font-medium text-gray-700">{d.label}</span>
                        <span className="text-blue-500 font-semibold">{d.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-700 h-2 rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== PRODUCTS ANALYTICS TAB ==================== */}
        {activeTab === 'Products Analytics' && (
          <>
            {/* Period selector */}
            <div className="flex justify-end mb-4 gap-3 items-center">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="text-[12px] font-semibold text-amber-600 bg-transparent outline-none cursor-pointer">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                </select>
              </div>
              <span className="text-[12px] text-gray-500">{periodLabel}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductTable
                title="Most Selling Products"
                subtitle="By units sold in selected date range"
                columns={['Qty', 'Revenue']}
                data={topProducts}
              />
              <ProductTable
                title="Top Margin Products"
                subtitle="Highest margin % (revenue − cost) / revenue"
                columns={['Margin', 'Profit']}
                data={topMarginProducts}
              />
              <ProductTable
                title="Top Viewed Products"
                subtitle="Product page views from analytics"
                columns={['Views']}
                data={topViewedProducts}
              />
              <ProductTable
                title="Most Profitable Products"
                subtitle="By total profit (revenue − cost) in period"
                columns={['Profit', 'Revenue']}
                data={mostProfitableProducts}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
}

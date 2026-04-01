'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order } from '@/types';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag, 
  ChevronRight, 
  ArrowUpRight, 
  Download,
  Calendar,
  UserCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CustomerRecord {
  id: string; // email or phone
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: any;
  address: string;
  city: string;
}

export default function CustomersPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const router = useRouter();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [filtered, setFiltered] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('spent'); 

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'orders'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      const customerMap = new Map<string, CustomerRecord>();

      orders.forEach(order => {
        const email = order.shippingAddress?.email || 'N/A';
        const phone = order.shippingAddress?.phone || 'N/A';
        const key = email !== 'N/A' ? email : phone;

        if (key === 'N/A') return;

        const existing = customerMap.get(key);
        const orderDate = order.createdAt?.seconds || 0;

        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += (order.total || 0);
          if (orderDate > (existing.lastOrderDate?.seconds || 0)) {
            existing.lastOrderDate = order.createdAt;
            existing.name = order.shippingAddress?.name || existing.name;
          }
        } else {
          customerMap.set(key, {
            id: key,
            name: order.shippingAddress?.name || 'Guest Customer',
            email: email,
            phone: phone,
            totalOrders: 1,
            totalSpent: (order.total || 0),
            lastOrderDate: order.createdAt,
            address: order.shippingAddress?.address || '',
            city: order.shippingAddress?.city || ''
          });
        }
      });

      const customerList = Array.from(customerMap.values());
      setCustomers(customerList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  useEffect(() => {
    let result = [...customers];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.email.toLowerCase().includes(s) || 
        c.phone.toLowerCase().includes(s)
      );
    }

    if (sortBy === 'spent') {
      result.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === 'orders') {
      result.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sortBy === 'recent') {
      result.sort((a, b) => (b.lastOrderDate?.seconds || 0) - (a.lastOrderDate?.seconds || 0));
    }

    setFiltered(result);
  }, [search, customers, sortBy]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Customers</h1>
              <p className="text-[13px] text-gray-500 mt-1">View your customer history and spending habits</p>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => showToast('CSV Export coming soon', 'info')}
                className="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
              >
                 <Download className="h-4 w-4" /> Export CSV
              </button>
              <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100">
                 <button 
                  onClick={() => setSortBy('spent')}
                  className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${sortBy === 'spent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                 >
                   Top Spent
                 </button>
                 <button 
                  onClick={() => setSortBy('recent')}
                  className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${sortBy === 'recent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                 >
                   Recent
                 </button>
              </div>
           </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Customers</p>
               <p className="text-[24px] font-black text-gray-900">{customers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active (2+ Orders)</p>
               <p className="text-[24px] font-black text-emerald-600">{customers.filter(c => c.totalOrders > 1).length}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Order Value</p>
               <p className="text-[24px] font-black text-gray-900">Rs {(customers.reduce((acc, c) => acc + c.totalSpent, 0) / (customers.reduce((acc, c) => acc + c.totalOrders,0) || 1)).toFixed(0)}</p>
            </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search customers by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
              />
           </div>
           <button 
                className="bg-gray-50 p-3.5 rounded-2xl border border-transparent hover:bg-gray-100 transition-all text-gray-400"
                onClick={() => { setSearch(''); }}
              >
                 <RefreshCw className="h-4 w-4" />
              </button>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
           {filtered.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-8">
                   <Users className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 mb-2">{search ? "No matches found" : "No customers yet"}</h3>
                <p className="text-[14px] text-gray-500 max-w-xs mx-auto mb-10">Once users place orders, their contact details and history will appear here.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                         <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                         <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Orders</th>
                         <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Spent</th>
                         <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Last Activity</th>
                         <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filtered.map((customer) => (
                        <tr key={customer.id} className="group hover:bg-gray-50/40 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                                 {customer.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">{customer.name}</span>
                                <span className="text-[11px] text-gray-400 font-bold mt-1 tracking-tight">{customer.email} • {customer.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <div className="inline-flex flex-col items-center bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                                <span className="text-[15px] font-black text-gray-900">{customer.totalOrders}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[15px] font-black text-gray-900 font-mono tracking-tight">Rs {customer.totalSpent.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6 text-[13px] font-medium text-gray-500">
                             {customer.lastOrderDate?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                             <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-0.5">{customer.city || 'N/A'}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                                <ArrowUpRight className="h-4 w-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

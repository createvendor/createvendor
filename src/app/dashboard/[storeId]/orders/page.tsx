'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Search, Package, Plus, Filter, Mail, Phone, Calendar, ArrowUpRight, Receipt, X } from 'lucide-react';
import { Order } from '@/types';
import Link from 'next/link';

export default function OrdersPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!storeId) return;

        const q = query(
            collection(db, 'orders'),
            where('storeId', '==', storeId)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            data.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            setOrders(data);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [storeId]);

    const getCustomerInfo = (order: any) => {
        if (order.shippingAddress && order.shippingAddress.name) return order.shippingAddress;
        if (order.customerInfo) {
            return {
                name: `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() || 'Guest',
                email: order.customerInfo.email || '',
                phone: order.customerInfo.phone || ''
            };
        }
        return { name: 'Guest', email: '', phone: '' };
    };

    const filteredOrders = orders.filter(o => {
        const info = getCustomerInfo(o);
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading) return null;

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                   <div>
                      <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Orders</h1>
                      <p className="text-[13px] text-gray-500 mt-1">Manage and track all your orders</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Link 
                        href={`/dashboard/${storeId}/orders/new`}
                        className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
                      >
                         <Plus className="h-4 w-4" /> Create Order
                      </Link>
                   </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[500px] flex flex-col p-6">
                   
                   <div className="mb-6">
                     <h2 className="text-[14px] font-semibold text-gray-900">All Orders</h2>
                     <p className="text-[13px] text-gray-500 mt-0.5">{filteredOrders.length} orders found</p>
                   </div>
                   
                   <div className="mb-4">
                     <div className="relative w-full">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <input 
                           type="text"
                           placeholder="Search orders by order number, name, email, or phone..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-blue-500 transition-all"
                         />
                     </div>
                   </div>

                   <div className="mb-6">
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all">
                         <Filter className="h-4 w-4" />
                         Filters & Sort
                      </button>
                   </div>

                   {filteredOrders.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 text-gray-500">
                           <Package className="h-10 w-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No orders found</h3>
                        <p className="text-[13px] text-gray-500 mb-6">Create your first order to get started</p>
                     </div>
                   ) : (
                     <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-left text-[13px]">
                           <thead>
                              <tr className="border-b border-gray-200 bg-white">
                                 <th className="px-4 py-3 font-medium text-gray-500">Order ID</th>
                                 <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                                 <th className="px-4 py-3 font-medium text-gray-500">Payment</th>
                                 <th className="px-4 py-3 font-medium text-gray-500">Total</th>
                                 <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                                 <th className="px-4 py-3 font-medium text-gray-500 text-right">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {filteredOrders.map((o) => {
                                const info = getCustomerInfo(o);
                                return (
                                  <tr key={o.id} className="hover:bg-gray-50/50 transition-all">
                                     <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                           <span className="font-medium text-gray-900">#{o.id.slice(-6).toUpperCase()}</span>
                                           <span className="text-[11px] text-gray-400">
                                              {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : 'Processing...'}
                                           </span>
                                        </div>
                                     </td>
                                     <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                           <span className="text-[13px] font-medium text-gray-900">{info.name}</span>
                                           <span className="text-[12px] text-gray-500">{info.email || info.phone}</span>
                                        </div>
                                     </td>
                                     <td className="px-4 py-3">
                                        <span className="text-gray-600 capitalize">{(o as any).paymentMethod || 'Manual'}</span>
                                     </td>
                                     <td className="px-4 py-3">
                                        <span className="font-medium text-gray-900">Rs {(o.total || (o as any).totalAmount || 0).toLocaleString()}</span>
                                     </td>
                                     <td className="px-4 py-3">
                                        <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${
                                           o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                           o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                           o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                           'bg-yellow-100 text-yellow-800'
                                        }`}>
                                           {o.status}
                                        </div>
                                     </td>
                                     <td className="px-4 py-3 text-right">
                                        <button className="p-1 px-3 border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-600 text-[12px] transition-all bg-white">
                                           View
                                        </button>
                                     </td>
                                  </tr>
                                );
                              })}
                           </tbody>
                        </table>
                     </div>
                   )}
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Users, Search, Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: any;
}

export default function PastCustomersPage() {
  const params = useParams();
  const storeId = params?.storeId as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!storeId) return;
      try {
        const q = query(collection(db, 'orders'), where('storeId', '==', storeId));
        const snap = await getDocs(q);

        // Aggregate orders into unique customers
        const customerMap: Record<string, Customer> = {};
        snap.docs.forEach(d => {
          const order = d.data();
          const email = order.customerInfo?.email;
          if (!email) return;
          if (!customerMap[email]) {
            customerMap[email] = {
              id: email,
              firstName: order.customerInfo?.firstName || '',
              lastName: order.customerInfo?.lastName || '',
              email,
              phone: order.customerInfo?.phone || '',
              address: order.customerInfo?.address || '',
              city: order.customerInfo?.city || '',
              state: order.customerInfo?.state || '',
              zipCode: order.customerInfo?.zipCode || '',
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: null,
            };
          }
          customerMap[email].orderCount += 1;
          customerMap[email].totalSpent += order.totalAmount || 0;
          const ts = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : null;
          if (ts && (!customerMap[email].lastOrderDate || ts > customerMap[email].lastOrderDate)) {
            customerMap[email].lastOrderDate = ts;
          }
        });

        const list = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
        setCustomers(list);
        setFiltered(list);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [storeId]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(customers); return; }
    const s = search.toLowerCase();
    setFiltered(customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.phone.includes(s)
    ));
  }, [search, customers]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center"><Users className="h-6 w-6 mr-2 text-primary" /> Past Customers</h1>
            <p className="text-sm text-gray-500 mt-1">{customers.length} unique customers from your orders</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-2">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${customers.reduce((a, c) => a + c.totalSpent, 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-2">Avg. Order Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${customers.length > 0 ? (customers.reduce((a, c) => a + c.totalSpent, 0) / customers.reduce((a, c) => a + c.orderCount, 0) || 0).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="flex gap-5">
          <div className={`flex-1 ${selected ? '' : 'w-full'}`}>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search customers by name, email or phone..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-1">No customers yet</h3>
                  <p className="text-sm text-gray-500">Customers who place orders will appear here.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Orders</th>
                      <th className="px-5 py-3">Total Spent</th>
                      <th className="px-5 py-3">Last Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(c => (
                      <tr
                        key={c.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === c.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelected(selected?.id === c.id ? null : c)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                              {c.firstName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{c.firstName} {c.lastName}</div>
                              <div className="text-xs text-gray-400">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-700 font-medium">{c.orderCount}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">${c.totalSpent.toFixed(2)}</td>
                        <td className="px-5 py-4 text-gray-500">
                          {c.lastOrderDate ? c.lastOrderDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {selected && (
            <div className="w-[320px] bg-white rounded-2xl border shadow-sm p-6 h-fit sticky top-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-5 pb-5 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {selected.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selected.firstName} {selected.lastName}</h3>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-2 text-gray-600">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{selected.phone}</span>
                  </div>
                )}
                {selected.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{selected.address}, {selected.city}, {selected.state} {selected.zipCode}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-5 border-t grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{selected.orderCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">${selected.totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Spent</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

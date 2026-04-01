'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store as StoreIcon, Trash2, ExternalLink } from 'lucide-react';
import { Store } from '@/types';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStores = async () => {
    try {
      const storesRef = collection(db, 'stores');
      const storesSnap = await getDocs(storesRef);
      const data: Store[] = [];
      storesSnap.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Store);
      });
      setStores(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      showToast('Error fetching stores', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this store? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'stores', id));
      showToast('Store deleted successfully', 'success');
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      showToast('Error deleting store', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Stores</h1>
          <p className="text-slate-500 mt-2">View and manage all stores across the platform.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 font-medium">
          Total: {stores.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium text-sm border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Store Name</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold italic">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{store.name}</div>
                        <div className="text-xs text-slate-500">ID: {store.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {store.customDomain || `${store.subdomain}.vercel.app`}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm max-w-[150px] truncate">
                    {store.ownerId}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/store/${store.id}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Visit Store"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(store.id!)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete Store"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <StoreIcon className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                    No stores found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

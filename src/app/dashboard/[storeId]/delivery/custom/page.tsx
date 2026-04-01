'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AlertTriangle, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CustomAddress {
  id: string;
  address: string;
  storeId: string;
  createdAt: any;
}

export default function CustomDeliveryAddressPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<CustomAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, 'customDeliveryAddresses'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomAddress));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAddresses(list);
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, [storeId]);

  const handleAdd = async () => {
    if (!newAddress.trim()) return showToast('Address is required', 'error');
    setAdding(true);
    try {
      await addDoc(collection(db, 'customDeliveryAddresses'), {
        address: newAddress.trim(),
        storeId,
        createdAt: serverTimestamp(),
      });
      setNewAddress('');
      showToast('Custom address added', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customDeliveryAddresses', id));
      showToast('Address removed', 'success');
    } catch { showToast('Failed to remove', 'error'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-gray-900">Custom Delivery Address</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Add custom delivery addresses that are not available in delivery partner platforms. These addresses will be shown in checkout and delivery preset pages.
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-6 border border-yellow-200 bg-yellow-50 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] font-semibold text-gray-900">Important Notice</span>
          </div>
          <p className="text-[13px] text-gray-700 pl-6">
            <span className="font-semibold">Delivery partners cannot deliver to these custom locations.</span>{' '}
            These addresses are for locations that are not serviced by your active delivery partner. Orders placed to these addresses will need to be handled manually or through alternative delivery methods.
          </p>
        </div>

        {/* Add Custom Address */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white mb-4">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Add Custom Delivery Address</h3>
          <p className="text-[13px] text-blue-500 mb-4">Enter a custom delivery address that will be available in checkout and delivery preset pages</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              placeholder="e.g., Remote Village, District Name"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="px-4 py-2 bg-[#3b82f6] text-white text-[13px] font-medium rounded-lg hover:bg-blue-600 flex items-center gap-1.5 transition-all flex-shrink-0"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        </div>

        {/* Custom Addresses List */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Custom Delivery Addresses ({addresses.length})</h3>
          <p className="text-[13px] text-blue-500 mb-4">List of all custom delivery addresses for your shop</p>

          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-[13px] text-gray-400">No custom delivery addresses added yet.</p>
              <p className="text-[13px] text-gray-400">Add your first custom address above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map(addr => (
                <div key={addr.id} className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-all group">
                  <span className="text-[13px] text-gray-800">{addr.address}</span>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

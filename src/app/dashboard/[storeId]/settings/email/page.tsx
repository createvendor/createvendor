'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface EmailPrefs {
  newOrderEmails: boolean;
  orderConfirmationEmails: boolean;
  newReviewEmails: boolean;
  lowStockEmails: boolean;
  refundRequestEmails: boolean;
  promotionEmails: boolean;
}

const defaultPrefs: EmailPrefs = {
  newOrderEmails: true,
  orderConfirmationEmails: true,
  newReviewEmails: true,
  lowStockEmails: true,
  refundRequestEmails: true,
  promotionEmails: false,
};

const ORDER_PREFS = [
  {
    key: 'newOrderEmails' as keyof EmailPrefs,
    label: 'New order emails',
    desc: 'Receive an email when a new order is placed.',
  },
  {
    key: 'orderConfirmationEmails' as keyof EmailPrefs,
    label: 'Order confirmation emails',
    desc: 'Receive an email when an order is marked as paid.',
  },
  {
    key: 'refundRequestEmails' as keyof EmailPrefs,
    label: 'Refund request emails',
    desc: 'Receive an email when a customer requests a refund.',
  },
  {
    key: 'newReviewEmails' as keyof EmailPrefs,
    label: 'New review emails',
    desc: 'Receive an email when a new product review is submitted.',
  },
  {
    key: 'lowStockEmails' as keyof EmailPrefs,
    label: 'Low stock alerts',
    desc: 'Receive an email when a product stock falls below the threshold.',
  },
  {
    key: 'promotionEmails' as keyof EmailPrefs,
    label: 'Promotion emails',
    desc: 'Receive emails about platform updates and promotions.',
  },
];

export default function EmailPreferencePage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<EmailPrefs>(defaultPrefs);

  useEffect(() => {
    if (!storeId) return;
    const unsubscribe = onSnapshot(doc(db, 'emailPreferences', storeId), (snap) => {
      if (snap.exists()) {
        setPrefs({ ...defaultPrefs, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [storeId]);

  const toggle = async (key: keyof EmailPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await setDoc(doc(db, 'emailPreferences', storeId), {
        ...updated,
        storeId,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err: any) {
      showToast('Failed to save: ' + err.message, 'error');
      setPrefs(prefs); // revert
    }
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
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-gray-900">Email preference</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Choose which emails you receive for this shop. These settings apply only to you for the selected shop.
          </p>
        </div>

        {/* Order Emails Section */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          {/* Section header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <h3 className="text-[14px] font-semibold text-gray-900">Order emails</h3>
            </div>
            <p className="text-[13px] text-blue-500 mt-0.5 ml-6">
              Turn off types of emails you don&apos;t want to receive. By default you receive all.
            </p>
          </div>

          {/* Toggle rows */}
          <div className="divide-y divide-gray-100">
            {ORDER_PREFS.map(pref => (
              <div key={pref.key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-[13px] font-medium text-gray-900">{pref.label}</p>
                  <p className="text-[12px] text-blue-500 mt-0.5">{pref.desc}</p>
                </div>
                <div
                  onClick={() => toggle(pref.key)}
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-all flex-shrink-0 ${prefs[pref.key] ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${prefs[pref.key] ? 'left-[22px]' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

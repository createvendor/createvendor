'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Bell, Trash2, ChevronDown } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: any;
  storeId: string;
}

export default function NotificationsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, 'notifications'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [storeId]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return 'Just now';
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filterOptions = ['All', 'Unread', 'Read'];

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Read') return n.isRead;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-gray-900">Notifications</h1>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              {filter}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                {filterOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setFilter(opt); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-all ${filter === opt ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[300px] flex flex-col">
          {filteredNotifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
              <div className="mb-4 text-gray-500">
                <Bell className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-[13px] text-gray-500">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all group cursor-pointer ${!n.isRead ? 'bg-blue-50/10' : ''}`}
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mt-2 ${n.isRead ? 'bg-gray-200' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`text-[13px] font-medium ${n.isRead ? 'text-gray-600' : 'text-gray-900'} truncate`}>{n.title}</h3>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{formatDate(n.createdAt)}</span>
                    </div>
                    {n.message && (
                      <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-red-500 text-gray-400 flex-shrink-0"
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

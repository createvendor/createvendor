'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Mail, Search, Trash2, Filter, ChevronLeft, ChevronRight, MailOpen, User, Phone, Calendar, Info, Loader2, X, MoreVertical, MessageSquare } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: 'PENDING' | 'REPLIED' | 'ARCHIVED';
  storeId: string;
  createdAt: any;
}

export default function ContactFormsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    const q = query(
      collection(db, 'contactMessages'),
      where('storeId', '==', storeId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMessages(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'contactMessages', id));
      showToast('Submission deleted successfully', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      showToast('Failed to delete submission', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const markAsRead = async (msg: ContactMessage) => {
    if (msg.isRead) return;
    try {
      await updateDoc(doc(db, 'contactMessages', msg.id), { isRead: true });
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = messages.filter(m => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone?.includes(searchQuery) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'new' && !m.isRead) ||
      (statusFilter === 'read' && m.isRead);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Contact Forms</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage contact form submissions</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 mt-2">
           <div className="flex items-center gap-3 mb-6">
              <span className="text-[13px] font-bold text-gray-900">Filters</span>
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search by name, email, phone, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-[14px] outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-600 transition-all min-w-[160px] cursor-pointer appearance-none text-gray-600"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New Messages</option>
                  <option value="read">Read Messages</option>
                </select>
              </div>
           </div>
        </div>

        {/* Results Card */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col`}>
           {filtered.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                   <Mail className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2">No contact forms found</h3>
                <p className="text-[13px] text-gray-500">Try adjusting your filters</p>
             </div>
           ) : (
             <div className="divide-y divide-gray-100">
                {filtered.map(msg => (
                  <div 
                    key={msg.id}
                    onClick={() => {
                      setSelected(msg);
                      markAsRead(msg);
                    }}
                    className={`group p-6 hover:bg-gray-50/80 cursor-pointer transition-all flex items-start justify-between relative ${!msg.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    {!msg.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    )}
                    <div className="flex gap-4 min-w-0">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px] ${!msg.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                          {msg.name?.charAt(0).toUpperCase()}
                       </div>
                       <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className={`text-[14px] truncate ${!msg.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{msg.name}</h4>
                             {!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                          <p className="text-[13px] text-gray-500 truncate mb-1">Subject: <span className="text-gray-900 font-medium">{msg.subject}</span></p>
                          <p className="text-[12px] text-gray-400">{msg.email} • {formatDate(msg.createdAt)}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg.id);
                        }}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>

      </div>

      {/* Modal / Overlay for Message View */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelected(null)} />
           <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                       {selected.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <h2 className="text-[16px] font-bold text-gray-900">{selected.name}</h2>
                       <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1">
                          <span className="bg-white border px-2 py-0.5 rounded-full font-medium">{selected.email}</span>
                          {selected.phone && <span className="bg-white border px-2 py-0.5 rounded-full font-medium">{selected.phone}</span>}
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <div className="p-10">
                 <div className="mb-10">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Topic / Subject</div>
                    <div className="text-xl font-bold text-gray-900 leading-tight">
                       {selected.subject}
                    </div>
                 </div>

                 <div className="bg-gray-50 rounded-[1.5rem] p-8 border border-gray-100">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Message Content</div>
                    <div className="text-[15px] text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                       {selected.message}
                    </div>
                 </div>

                 <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-gray-400 text-[13px] font-medium">
                       <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(selected.createdAt)}
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <a
                        href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                        className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white text-[14px] font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all text-center"
                       >
                          Reply via Email
                       </a>
                       <button 
                        onClick={() => handleDelete(selected.id)}
                        className="px-6 py-3 bg-white border border-gray-200 text-red-500 text-[14px] font-bold rounded-xl hover:bg-red-50 transition-all"
                       >
                          Delete
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}

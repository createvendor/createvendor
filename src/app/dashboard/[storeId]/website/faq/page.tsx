'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Plus, 
  Search, 
  HelpCircle, 
  Trash2, 
  Pencil,
  Loader2,
  X,
  MessageSquare,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  status: 'active' | 'inactive';
  order: number;
  storeId: string;
}

export default function FAQPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    status: 'active' as 'active' | 'inactive',
    order: 0
  });

  useEffect(() => {
    if (!storeId) return;

    const q = query(
      collection(db, 'faqs'), 
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const faqData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FAQItem[];
      setFaqs(faqData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleOpenForm = (faq?: FAQItem) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        status: faq.status || 'active',
        order: faq.order || 0
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        question: '',
        answer: '',
        status: 'active',
        order: faqs.length
      });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      showToast('Question and Answer are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        storeId,
        updatedAt: serverTimestamp()
      };

      if (editingFAQ) {
        await updateDoc(doc(db, 'faqs', editingFAQ.id), data);
        showToast('FAQ updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'faqs'), {
          ...data,
          createdAt: serverTimestamp()
        });
        showToast('FAQ created successfully', 'success');
      }
      setShowForm(false);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await deleteDoc(doc(db, 'faqs', id));
      showToast('FAQ deleted', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {!showForm ? (
          <>
            {/* List View Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-gray-900 leading-tight">FAQs</h1>
                <p className="text-[14px] text-gray-500 mt-1">Manage frequently asked questions for your store</p>
              </div>
              <button 
                onClick={() => handleOpenForm()}
                className="inline-flex items-center justify-center gap-2 bg-[#4381f2] hover:bg-[#3b71d6] text-white px-5 py-2.5 rounded-lg text-[14px] font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add FAQ
              </button>
            </div>

            {/* List Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-lg pl-10 pr-4 py-2 text-[14px] outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* FAQ Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider w-[80px]">Order</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq) => (
                        <tr key={faq.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-[14px] font-bold text-gray-400">#{faq.order + 1}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <MessageSquare className="w-4 h-4" />
                              </div>
                              <span className="text-[14px] font-bold text-gray-900 block max-w-md truncate">{faq.question}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                              faq.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {faq.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenForm(faq)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(faq.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="max-w-[240px] mx-auto">
                            <HelpCircle className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                            <p className="text-[14px] text-gray-500">No FAQs found. Add your first FAQ to get started.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Create/Edit Form View */
          <div className="max-w-3xl animate-in fade-in duration-300">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 leading-tight">{editingFAQ ? 'Edit FAQ' : 'Create FAQ'}</h1>
              <p className="text-[14px] text-gray-500 mt-1">{editingFAQ ? 'Update FAQ details' : 'Create a new FAQ for your shop'}</p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-8 space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[13px] font-bold text-gray-900">Question</label>
                       <input 
                         required
                         type="text"
                         value={formData.question}
                         onChange={e => setFormData(p => ({ ...p, question: e.target.value }))}
                         placeholder="Enter question"
                         className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-300"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[13px] font-bold text-gray-900">Answer</label>
                       <textarea 
                         required
                         rows={5}
                         value={formData.answer}
                         onChange={e => setFormData(p => ({ ...p, answer: e.target.value }))}
                         placeholder="Enter answer"
                         className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-300 resize-none"
                       />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                       <input 
                         type="checkbox"
                         id="status"
                         checked={formData.status === 'active'}
                         onChange={e => setFormData(p => ({ ...p, status: e.target.checked ? 'active' : 'inactive' }))}
                         className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                       />
                       <label htmlFor="status" className="text-[14px] font-medium text-gray-700 cursor-pointer">Active</label>
                    </div>

                    <div className="space-y-2 w-32">
                       <label className="text-[13px] font-bold text-gray-900">Order</label>
                       <input 
                         type="number"
                         value={formData.order}
                         onChange={e => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                         className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-[14px] outline-none focus:border-blue-500 transition-all font-bold text-gray-600"
                       />
                    </div>
                 </div>
               </div>

               <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
                 <button 
                   type="submit"
                   disabled={isSaving}
                   className="bg-[#4381f2] hover:bg-[#3b71d6] text-white px-8 py-2.5 rounded-lg text-[14px] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                 >
                   {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                   {editingFAQ ? 'Update FAQ' : 'Create'}
                 </button>
                 <button 
                   type="button"
                   onClick={() => setShowForm(false)}
                   className="bg-white border border-gray-200 text-gray-600 px-8 py-2.5 rounded-lg text-[14px] font-bold hover:bg-gray-50 transition-all active:scale-95"
                 >
                   Cancel
                 </button>
               </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

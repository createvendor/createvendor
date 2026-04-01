'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  Loader2, 
  Ticket, 
  Clock, 
  ArrowRight,
  Settings2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Discount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minReqRevenue: number;
  usageLimit: number;
  usedCount: number;
  startDate: any;
  endDate: any;
  isActive: boolean;
  storeId: string;
  createdAt: any;
}

export default function DiscountsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minReqRevenue: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    if (!storeId) return;
    
    const q = query(collection(db, 'discounts'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Discount));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setDiscounts(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return showToast('Code is required', 'error');
    setSaving(true);
    try {
      const data = {
        ...form,
        storeId,
        usedCount: editing ? editing.usedCount : 0,
        updatedAt: serverTimestamp()
      };

      if (editing) {
        await updateDoc(doc(db, 'discounts', editing.id), data);
        showToast('Discount successfully updated', 'success');
      } else {
        await addDoc(collection(db, 'discounts'), { ...data, createdAt: serverTimestamp() });
        showToast('Discount successfully created', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minReqRevenue: 0,
        usageLimit: 0,
        startDate: '',
        endDate: '',
        isActive: true
      });
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this discount?')) return;
    try {
      await deleteDoc(doc(db, 'discounts', id));
      showToast('Discount removed', 'success');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const toggleStatus = async (discount: Discount) => {
     try {
        await updateDoc(doc(db, 'discounts', discount.id), { isActive: !discount.isActive });
        showToast(`Discount ${discount.isActive ? 'deactivated' : 'activated'}`, 'success');
     } catch (err) {
        showToast('Failed to update status', 'error');
     }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!showForm) {
    return (
      <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Promotions & Coupons</h1>
              <p className="text-[13px] text-gray-500 mt-1">Deploy discount strategies to increase order frequency and value</p>
            </div>
            <button 
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-3 text-[14px]"
            >
              <Plus className="h-5 w-5" /> New Discount Code
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {discounts.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-20 text-center animate-in zoom-in-95 duration-700">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-8 mx-auto">
                    <Ticket className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">No active promotions</h3>
                <p className="text-[14px] text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">Incentivize your visitors with limited-time offers and coupon codes. Boost your conversions by up to 30%.</p>
                <button onClick={() => setShowForm(true)} className="text-blue-600 font-black text-sm hover:underline flex items-center gap-2 mx-auto">
                   Launch first campaign <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              discounts.map((d, idx) => (
                <div 
                  key={d.id} 
                  className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 hover:shadow-2xl hover:shadow-blue-100/20 transition-all duration-500 group animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                      <Tag className="h-8 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => toggleStatus(d)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${d.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                          {d.isActive ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                       </button>
                       <button onClick={() => { setEditing(d); setForm({...d}); setShowForm(true); }} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Pencil className="h-4 w-4" /></button>
                       <button onClick={() => handleDelete(d.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-6">
                     <div className="inline-block px-4 py-1.5 bg-gray-900 text-white rounded-lg text-[13px] font-black tracking-widest uppercase mb-2">
                        {d.code}
                     </div>
                     <h3 className="text-[24px] font-black text-gray-900 tracking-tighter">
                        {d.type === 'PERCENTAGE' ? `${d.value}% Off` : d.type === 'FIXED' ? `Rs ${d.value} Flat` : 'Free Shipping'}
                     </h3>
                     <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[12px] font-bold">
                           <span className="text-gray-400">Status</span>
                           <span className={d.isActive ? 'text-emerald-500' : 'text-gray-400'}>{d.isActive ? 'Running' : 'Paused'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[12px] font-bold">
                           <span className="text-gray-400">Usage</span>
                           <span className="text-gray-900 font-black">{d.usedCount} Redemptions</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <button 
             onClick={() => { setShowForm(false); setEditing(null); }}
             className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
          >
             <X className="h-5 w-5" />
          </button>
          <div className="text-center flex-1 pr-12">
             <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">{editing ? 'Modify Campaign' : 'Deploy New Campaign'}</h1>
             <p className="text-[13px] text-gray-500 mt-1">Configure logic for your storewide promotion</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Main Config Card */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/30 rounded-full translate-x-10 -translate-y-10" />
             
             <div className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                   <Settings2 className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-[16px] font-bold text-gray-900">Campaign Logic</h2>
                   <p className="text-[12px] text-gray-500">Define the core parameters of this discount</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">Coupon Code</label>
                      <input 
                         required
                         type="text"
                         value={form.code}
                         onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                         placeholder="SAVE30"
                         className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[15px] font-black text-gray-900 outline-none focus:border-blue-600 focus:bg-white focus:shadow-xl focus:shadow-blue-50/50 transition-all font-mono"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">Discount Type</label>
                      <select 
                         value={form.type}
                         onChange={(e) => setForm({...form, type: e.target.value as any})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                         <option value="PERCENTAGE">Percentage (%)</option>
                         <option value="FIXED">Fixed Amount (Rs)</option>
                         <option value="FREE_SHIPPING">Free Shipping</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">Discount Value</label>
                      <input 
                         required
                         type="number"
                         min="0"
                         disabled={form.type === 'FREE_SHIPPING'}
                         value={form.value}
                         onChange={(e) => setForm({...form, value: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all disabled:opacity-30"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">Min. Order Requirement (Rs)</label>
                      <input 
                         required
                         type="number"
                         min="0"
                         value={form.minReqRevenue}
                         onChange={(e) => setForm({...form, minReqRevenue: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Temporal Alignment */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 relative overflow-hidden">
             <div className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <Clock className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-[16px] font-bold text-gray-900">Campaign Timeline</h2>
                   <p className="text-[12px] text-gray-500">Automate the activation and expiry</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-2">
                   <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
                   <input 
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({...form, startDate: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[14px] font-bold text-gray-600 outline-none focus:border-blue-600 focus:bg-white transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">End Date</label>
                   <input 
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({...form, endDate: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[14px] font-bold text-gray-600 outline-none focus:border-blue-600 focus:bg-white transition-all"
                   />
                </div>
             </div>

             <div className="mt-12 flex items-center justify-between p-8 bg-gray-900 rounded-[2.5rem] text-white">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <RefreshCw className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-[14px] font-bold">Visible on Storefront</p>
                      <p className="text-[11px] text-gray-400">Campaign is currently active for all visitors</p>
                   </div>
                </div>
                <div 
                   onClick={() => setForm({...form, isActive: !form.isActive})}
                   className={`w-14 h-8 rounded-full relative cursor-pointer transition-all duration-300 ${form.isActive ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                   <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${form.isActive ? 'left-7' : 'left-1'}`} />
                </div>
             </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-10">
             <button 
                type="submit"
                disabled={saving}
                className="min-w-[240px] bg-blue-600 text-white font-black py-5 px-12 rounded-[2rem] hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-[15px]"
             >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Tag className="h-5 w-5" />}
                {editing ? 'Update Campaign' : 'Deploy Campaign'}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}

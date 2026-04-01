'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  collection, query, where, addDoc, deleteDoc,
  doc, serverTimestamp, onSnapshot, updateDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Tag, Plus, Trash2, Pencil, Copy, Loader2, Search,
  ChevronDown, ArrowLeft, Check
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  promocodeType: 'Cart' | 'Product' | 'Shipping';
  minOrderAmount?: number;
  validTill?: string;
  isActive: boolean;
  totalUsage: number;
  storeId: string;
  createdAt?: any;
}

const STATUS_OPTIONS = ['All Status', 'Active', 'Inactive'];

export default function PromocodesPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const emptyForm = {
    code: '',
    discountType: 'Percentage' as 'Percentage' | 'Fixed',
    discountValue: '' as any,
    maxDiscountAmount: '' as any,
    promocodeType: 'Cart' as 'Cart' | 'Product' | 'Shipping',
    minOrderAmount: '' as any,
    validTill: '',
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, 'promocodes'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCodes(list);
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, [storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return showToast('Promocode is required', 'error');
    if (!form.discountValue) return showToast('Discount value is required', 'error');
    setSaving(true);
    try {
      const data = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        storeId,
        totalUsage: editing?.totalUsage || 0,
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, 'promocodes', editing.id), data);
        showToast('Promocode updated', 'success');
      } else {
        await addDoc(collection(db, 'promocodes'), { ...data, createdAt: serverTimestamp() });
        showToast('Promocode created', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promocode?')) return;
    try {
      await deleteDoc(doc(db, 'promocodes', id));
      showToast('Promocode deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const openEdit = (c: PromoCode) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscountAmount: c.maxDiscountAmount || '',
      promocodeType: c.promocodeType || 'Cart',
      minOrderAmount: c.minOrderAmount || '',
      validTill: c.validTill || '',
      isActive: c.isActive !== false,
    });
    setShowForm(true);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied!', 'success');
  };

  const filteredCodes = codes.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' ||
      (statusFilter === 'Active' && c.isActive !== false) ||
      (statusFilter === 'Inactive' && c.isActive === false);
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-white pb-32">
        <div className="flex items-start gap-4 px-6 md:px-8 pt-6 max-w-[1200px] mx-auto">
          <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }} className="mt-1 flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <div className="px-6 md:px-8 pt-4 pb-6 max-w-[1200px] mx-auto">
          <h1 className="text-[20px] font-bold text-gray-900">{editing ? 'Edit Promocode' : 'Create Promocode'}</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Create a new discount code for your customers</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <form onSubmit={handleSubmit}>
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-6">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Basic Information</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Enter the basic details for your promocode</p>
              </div>

              {/* Promocode */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Promocode <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
                <p className="text-[12px] text-gray-400">Promocode will be automatically converted to uppercase</p>
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-gray-900">Discount Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-gray-900">
                    Discount Value <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">({form.discountType === 'Percentage' ? '%' : 'Rs'})</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Max Discount Amount (only for percentage) */}
              {form.discountType === 'Percentage' && (
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-gray-900">Maximum Discount Amount (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscountAmount}
                    onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="Optional: Maximum discount amount"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                  <p className="text-[12px] text-gray-400">Optional: Set a maximum discount amount for percentage discounts</p>
                </div>
              )}

              {/* Promocode Type */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Promocode Type <span className="text-red-500">*</span></label>
                <select
                  value={form.promocodeType}
                  onChange={e => setForm({ ...form, promocodeType: e.target.value as any })}
                  className="w-[120px] border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all bg-white"
                >
                  <option value="Cart">Cart</option>
                  <option value="Product">Product</option>
                  <option value="Shipping">Shipping</option>
                </select>
              </div>

              {/* Min Order Amount */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Minimum Order Amount (Rs)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                  placeholder="Optional: Minimum order amount required"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Valid Till */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Valid Till</label>
                <input
                  type="date"
                  value={form.validTill}
                  onChange={e => setForm({ ...form, validTill: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all text-gray-700"
                />
                <p className="text-[12px] text-gray-400">Optional: Set an expiration date for the promocode</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <div
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-10 h-6 rounded-full cursor-pointer transition-all flex-shrink-0 ${form.isActive ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${form.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <span className="text-[13px] font-medium text-gray-900">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 pb-8">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Promocode'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Promocodes</h1>
            <p className="text-[13px] text-gray-500 mt-1">Manage your discount codes and <span className="text-blue-500">promotional offers</span></p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
            className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
          >
            <Plus className="h-4 w-4" /> Create Promocode
          </button>
        </div>

        {/* Filters Card */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white mb-4">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative flex-1 max-w-[500px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search promocodes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                {statusFilter}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setShowStatusMenu(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-all ${statusFilter === opt ? 'font-semibold text-blue-600' : 'text-gray-700'}`}
                    >
                      {opt}
                      {statusFilter === opt && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Promocodes Table Card */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden min-h-[300px] flex flex-col p-6">
          <div className="mb-4">
            <h2 className="text-[14px] font-semibold text-gray-900">Promocodes</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Showing 0-{filteredCodes.length} of {filteredCodes.length} promocodes
            </p>
          </div>

          {filteredCodes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="mb-4 text-gray-500">
                <Tag className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-semibold text-gray-900 mb-4">No promocodes found</p>
              <button
                onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
                className="flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Plus className="h-4 w-4" /> Create Your First Promocode
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-medium text-gray-500">Code</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Discount</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Uses</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Expires</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCodes.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[12px]">{c.code}</span>
                          <button onClick={() => copyToClipboard(c.code)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{c.promocodeType || 'Cart'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.discountType === 'Percentage' ? `${c.discountValue}%` : `Rs ${c.discountValue}`} off
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.totalUsage || 0}</td>
                      <td className="px-4 py-3 text-gray-500">{c.validTill || '—'}</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {c.isActive !== false ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <button onClick={() => openEdit(c)} className="hover:text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
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

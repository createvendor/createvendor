'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  collection, query, where, getDocs, addDoc, deleteDoc,
  doc, updateDoc, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Plus, Trash2, Pencil, Search, Filter, Package,
  ArrowLeft, CloudUpload, Loader2, X, ChevronDown, Check
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

interface PromotionalOffer {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  promoCodeId?: string;
  productIds: string[];
  isActive: boolean;
  storeId: string;
  createdAt?: any;
}

interface PromoCode {
  id: string;
  code: string;
}

export default function PromotionalOffersPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromotionalOffer | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showPromoDropdown, setShowPromoDropdown] = useState(false);

  const emptyForm = {
    title: '',
    description: '',
    coverImageUrl: '',
    promoCodeId: '',
    productIds: [] as string[],
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'promotionalOffers'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as PromotionalOffer));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOffers(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    // Fetch promo codes
    const fetchCodes = async () => {
      try {
        const cq = query(collection(db, 'discounts'), where('storeId', '==', storeId));
        const csnap = await getDocs(cq);
        setPromoCodes(csnap.docs.map(d => ({ id: d.id, code: d.data().code || d.data().name || d.id } as PromoCode)));
      } catch (err) { console.error(err); }
    };

    // Fetch products
    const fetchProducts = async () => {
      try {
        const pq = query(collection(db, 'products'), where('storeId', '==', storeId));
        const psnap = await getDocs(pq);
        setProducts(psnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
    };

    fetchCodes();
    fetchProducts();
    return () => unsubscribe();
  }, [storeId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setForm(prev => ({ ...prev, coverImageUrl: data.url }));
      showToast('Image uploaded', 'success');
    } catch {
      showToast('Upload failed', 'error');
    } finally { setUploading(false); }
  };

  const toggleProduct = (pid: string) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(pid)
        ? prev.productIds.filter(id => id !== pid)
        : [...prev.productIds, pid]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return showToast('Title is required', 'error');
    setSaving(true);
    try {
      const data = { ...form, storeId, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'promotionalOffers', editing.id), data);
        showToast('Offer updated', 'success');
      } else {
        await addDoc(collection(db, 'promotionalOffers'), { ...data, createdAt: serverTimestamp() });
        showToast('Offer created', 'success');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await deleteDoc(doc(db, 'promotionalOffers', id));
      showToast('Offer deleted', 'success');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const filteredOffers = offers.filter(o =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedPromoCode = promoCodes.find(c => c.id === form.promoCodeId);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-white pb-32">
        {/* Back + Title */}
        <div className="flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 max-w-[1200px] mx-auto">
          <button
            onClick={() => { setShowForm(false); setEditing(null); }}
            className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
        <div className="px-6 md:px-8 pt-4 pb-6 max-w-[1200px] mx-auto">
          <h1 className="text-[20px] font-bold text-gray-900">{editing ? 'Edit Promotional Offer' : 'Create Promotional Offer'}</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Create a new promotional offer for your shop</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Basic Information */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-5">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Basic Information</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Enter the promotional offer details</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-gray-900">Title <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Summer Sale 2024"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-gray-900">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter a description for this promotional offer..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400 resize-y"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Cover Image</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Upload a cover image</p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-900 mb-2">Cover Image</label>
                <label className="w-full max-w-[300px] h-[160px] rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden bg-white">
                  {form.coverImageUrl ? (
                    <>
                      <Image src={form.coverImageUrl} alt="Cover" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setForm(prev => ({ ...prev, coverImageUrl: '' })); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded bg-white text-gray-700 border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <CloudUpload className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Link Promotional Code */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Link Promotional Code</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Optionally link a promocode to this promotional offer</p>
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-gray-900">Promotional Code</label>
                <div className="relative w-[200px]">
                  <button
                    type="button"
                    onClick={() => setShowPromoDropdown(!showPromoDropdown)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <span>{selectedPromoCode?.code || 'None'}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {showPromoDropdown && (
                    <div className="absolute top-full mt-1 left-0 w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => { setForm(prev => ({ ...prev, promoCodeId: '' })); setShowPromoDropdown(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <span>None</span>
                        {!form.promoCodeId && <Check className="h-4 w-4 text-blue-500" />}
                      </button>
                      {promoCodes.length === 0 ? (
                        <div className="px-4 py-2.5 text-[12px] text-gray-400">No active promocodes available</div>
                      ) : (
                        promoCodes.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setForm(prev => ({ ...prev, promoCodeId: c.id })); setShowPromoDropdown(false); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            <span>{c.code}</span>
                            {form.promoCodeId === c.id && <Check className="h-4 w-4 text-blue-500" />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Products</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Select products to include in this promotional offer</p>
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-gray-900">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, or description..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-gray-500 font-medium">
                  No products available. Create products first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto py-2">
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${form.productIds.includes(p.id) ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded border border-gray-100 overflow-hidden relative flex-shrink-0">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <Package className="h-4 w-4 m-auto text-gray-300 absolute inset-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500">Rs {p.price}</p>
                      </div>
                      {form.productIds.includes(p.id) && (
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Status</h3>
              <label className="flex items-center gap-2 cursor-pointer w-max">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[13px] font-medium text-gray-900">Active (Offer will be visible on website)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
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
                {editing ? 'Save Changes' : 'Create Offer'}
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
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Promotional Offers</h1>
            <p className="text-[13px] text-gray-500 mt-1">Manage promotional offers for your shop</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
            className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
          >
            <Plus className="h-4 w-4" /> Create Offer
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px] p-6">
          <div className="mb-3">
            <h2 className="text-[14px] font-semibold text-gray-900">All Promotional Offers</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{filteredOffers.length} offers found</p>
          </div>

          <div className="mb-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers by title, description, or slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all">
              <Filter className="h-4 w-4" />
              Filters &amp; Sort
            </button>
          </div>

          {filteredOffers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="mb-4 text-gray-500">
                <Package className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No offers found</h3>
              <p className="text-[13px] text-gray-500">Create your first promotional offer to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-medium text-gray-500">Cover</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Products</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOffers.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                          {o.coverImageUrl ? (
                            <Image src={o.coverImageUrl} alt={o.title} fill className="object-cover" />
                          ) : (
                            <Package className="h-4 w-4 m-auto text-gray-400 absolute inset-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-gray-900">{o.title}</span>
                          {o.description && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{o.description}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.productIds?.length || 0} items</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {o.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <button
                            onClick={() => { setEditing(o); setForm({ title: o.title, description: o.description || '', coverImageUrl: o.coverImageUrl || '', promoCodeId: o.promoCodeId || '', productIds: o.productIds || [], isActive: o.isActive !== false }); setShowForm(true); }}
                            className="hover:text-blue-600 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(o.id)} className="hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
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

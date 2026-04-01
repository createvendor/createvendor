'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Plus, Trash2, Copy, Loader2, Search, ArrowLeft, Check, ChevronDown, Eye
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AffiliateProduct {
  productId: string;
  productName: string;
  commissionValue: number;
  commissionType: 'Percentage' | 'Fixed';
}

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliateKey: string;
  products: AffiliateProduct[];
  paidEarnings: number;
  withdrawn: number;
  balance: number;
  isActive: boolean;
  storeId: string;
  createdAt?: any;
}

const genAffKey = () => 'AFF_' + Math.random().toString(36).substring(2, 9).toUpperCase() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();

export default function AffiliatesPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliateKey, setAffiliateKey] = useState(genAffKey());

  // Product commission row
  const [selectedProductId, setSelectedProductId] = useState('');
  const [commissionValue, setCommissionValue] = useState('0');
  const [commissionType, setCommissionType] = useState<'Percentage' | 'Fixed'>('Percentage');
  const [addedProducts, setAddedProducts] = useState<AffiliateProduct[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, 'affiliates'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Affiliate));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAffiliates(list);
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });

    // Fetch products for dropdown
    const fetchProducts = async () => {
      try {
        const pq = query(collection(db, 'products'), where('storeId', '==', storeId));
        const snap = await getDocs(pq);
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
    };
    fetchProducts();

    return () => unsubscribe();
  }, [storeId]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setAffiliateKey(genAffKey());
    setAddedProducts([]);
    setSelectedProductId('');
    setCommissionValue('0');
    setCommissionType('Percentage');
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (a: Affiliate) => {
    setEditing(a);
    setName(a.name);
    setEmail(a.email);
    setAffiliateKey(a.affiliateKey);
    setAddedProducts(a.products || []);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = allProducts.find(p => p.id === selectedProductId);
    if (!product) return;
    if (addedProducts.find(p => p.productId === selectedProductId)) {
      showToast('Product already added', 'warning');
      return;
    }
    setAddedProducts(prev => [...prev, {
      productId: selectedProductId,
      productName: product.name,
      commissionValue: Number(commissionValue),
      commissionType,
    }]);
    setSelectedProductId('');
    setCommissionValue('0');
  };

  const removeAddedProduct = (productId: string) => {
    setAddedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return showToast('Name is required', 'error');
    setSaving(true);
    try {
      const data = {
        name, email, affiliateKey,
        products: addedProducts,
        isActive: true,
        storeId,
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, 'affiliates', editing.id), data);
        showToast('Affiliate updated', 'success');
      } else {
        await addDoc(collection(db, 'affiliates'), {
          ...data,
          paidEarnings: 0,
          withdrawn: 0,
          balance: 0,
          createdAt: serverTimestamp(),
        });
        showToast('Affiliate created', 'success');
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this affiliate?')) return;
    try {
      await deleteDoc(doc(db, 'affiliates', id));
      showToast('Affiliate deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast('Affiliate key copied!', 'success');
  };

  const filteredAffiliates = affiliates.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.affiliateKey?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = allProducts.find(p => p.id === selectedProductId);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-white pb-32">
        <div className="px-6 md:px-8 pt-6 max-w-[1200px] mx-auto flex items-center gap-3">
          <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:text-gray-900 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">{editing ? 'Edit Affiliate' : 'Add Affiliate'}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Create a new affiliate with commission settings</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 mt-6">
          <form onSubmit={handleSave} className="space-y-5">

            {/* Basic Info */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-5">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Basic Info</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Affiliate name and unique key</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Affiliate name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="affiliate@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Affiliate Key</label>
                <div className="relative">
                  <input
                    type="text"
                    value={affiliateKey}
                    onChange={e => setAffiliateKey(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all font-mono pr-10"
                  />
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                </div>
                <p className="text-[12px] text-gray-400">Used in links: ?affiliateCode=YOUR_KEY</p>
              </div>
            </div>

            {/* Products & Commission */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Products & Commission</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Add products and set commission per product</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Product select */}
                <div className="relative flex-1 min-w-[160px]">
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    <span className="truncate">{selectedProduct?.name || 'Select product or search...'}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {showProductDropdown && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[200px] overflow-y-auto">
                      {allProducts.length === 0 ? (
                        <div className="px-4 py-3 text-[13px] text-gray-400">No products available</div>
                      ) : (
                        allProducts.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setSelectedProductId(p.id); setShowProductDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-all ${selectedProductId === p.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Commission value */}
                <input
                  type="number"
                  min="0"
                  value={commissionValue}
                  onChange={e => setCommissionValue(e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
                />

                {/* Commission type */}
                <div className="relative">
                  <select
                    value={commissionType}
                    onChange={e => setCommissionType(e.target.value as any)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white outline-none focus:border-blue-500 appearance-none pr-8"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {/* Added Products List */}
              {addedProducts.length > 0 && (
                <div className="mt-3 space-y-2">
                  {addedProducts.map(ap => (
                    <div key={ap.productId} className="flex items-center justify-between px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50 text-[13px]">
                      <span className="font-medium text-gray-900 truncate">{ap.productName}</span>
                      <div className="flex items-center gap-3 text-gray-500 flex-shrink-0 ml-4">
                        <span>{ap.commissionValue}{ap.commissionType === 'Percentage' ? '%' : ' Rs'}</span>
                        <button type="button" onClick={() => removeAddedProduct(ap.productId)} className="hover:text-red-500 transition-colors">
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 pb-8">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Affiliate'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
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
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Affiliates</h1>
            <p className="text-[13px] text-gray-500 mt-1">Manage affiliates and track earnings</p>
          </div>
          <button
            onClick={openNew}
            className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
          >
            <Plus className="h-4 w-4" /> Add Affiliate
          </button>
        </div>

        {/* Main Card */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="relative w-full max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search affiliates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-5 py-3 font-medium text-gray-700">Affiliate Key</th>
                  <th className="px-5 py-3 font-medium text-gray-700">Products</th>
                  <th className="px-5 py-3 font-medium text-gray-700">Paid Earnings</th>
                  <th className="px-5 py-3 font-medium text-gray-700">Withdrawn</th>
                  <th className="px-5 py-3 font-medium text-gray-700">Balance</th>
                  <th className="px-5 py-3 font-medium text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAffiliates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-[13px] text-gray-400">
                      No affiliates found. Add your first affiliate to get started.
                    </td>
                  </tr>
                ) : (
                  filteredAffiliates.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-900">{a.name}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-[12px] bg-gray-100 px-2 py-1 rounded text-gray-700">{a.affiliateKey}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{a.products?.length || 0} products</td>
                      <td className="px-5 py-3 text-gray-600">Rs {(a.paidEarnings || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-gray-600">Rs {(a.withdrawn || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-gray-600">Rs {(a.balance || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button onClick={() => copyKey(a.affiliateKey)} className="hover:text-blue-600 transition-colors" title="Copy key">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button onClick={() => openEdit(a)} className="hover:text-blue-600 transition-colors" title="View/Edit">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

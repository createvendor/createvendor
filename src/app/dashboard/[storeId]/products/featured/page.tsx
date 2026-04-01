'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Plus, Trash2, Pencil, ArrowLeft, CloudUpload, Loader2, Search, Check, Star } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

interface FeaturedSection {
  id: string;
  title: string;
  order: number;
  mode: 'manual' | 'auto';
  isActive: boolean;
  images: string[];
  productIds: string[];
}

export default function FeaturedSectionsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [sections, setSections] = useState<FeaturedSection[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeaturedSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState<{
    title: string;
    order: number;
    mode: 'manual' | 'auto';
    isActive: boolean;
    images: string[];
    productIds: string[];
  }>({
    title: 'Top Products',
    order: 0,
    mode: 'manual',
    isActive: true,
    images: ['', '', ''],
    productIds: []
  });

  const openEdit = (s: FeaturedSection) => {
    setEditing(s);
    setForm({
      title: s.title,
      order: s.order || 0,
      mode: s.mode || 'manual',
      isActive: s.isActive !== false,
      images: s.images || ['', '', ''],
      productIds: s.productIds || []
    });
    setShowForm(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;
      try {
        const q = query(collection(db, 'featured_sections'), where('storeId', '==', storeId));
        const snap = await getDocs(q);
        const fetchedSections = snap.docs.map(d => ({ id: d.id, ...d.data() } as FeaturedSection));
        fetchedSections.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSections(fetchedSections);

        const pq = query(collection(db, 'products'), where('storeId', '==', storeId), limit(50));
        const psnap = await getDocs(pq);
        setProducts(psnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [storeId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const newImages = [...form.images];
      newImages[idx] = data.url;
      setForm(prev => ({ ...prev, images: newImages }));
      showToast('Image uploaded successfully', 'success');
    } catch {
      showToast('Image upload failed', 'error');
    } finally { setUploading(null); }
  };

  const clearImage = (idx: number) => {
    const newImages = [...form.images];
    newImages[idx] = '';
    setForm(prev => ({ ...prev, images: newImages }));
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
    if (!form.title) return showToast('Title is required', 'warning');
    setSaving(true);
    try {
      const data = { ...form, storeId, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'featured_sections', editing.id), data);
        setSections(prev => {
          const newArr = prev.map(s => s.id === editing.id ? { ...s, ...data } as FeaturedSection : s);
          return newArr.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
        showToast('Section updated successfully', 'success');
      } else {
        const ref = await addDoc(collection(db, 'featured_sections'), { ...data, createdAt: serverTimestamp() });
        setSections(prev => {
           const newArr = [...prev, { id: ref.id, ...data } as FeaturedSection];
           return newArr.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
        showToast('Section created successfully', 'success');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
       await deleteDoc(doc(db, 'featured_sections', id));
       setSections(prev => prev.filter(s => s.id !== id));
       showToast('Section deleted', 'success');
    } catch (err) {
       showToast('Failed to delete section', 'error');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-start gap-4 p-6 md:p-8 max-w-[1200px] mx-auto">
          <button onClick={() => { setShowForm(false); setEditing(null); }} className="mt-1 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">{editing ? 'Edit Featured Section' : 'Create Featured Section'}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Choose a title and select products</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-32">
          <form onSubmit={handleSave} className="space-y-6 max-w-[900px]">
            
            {/* Configuration Card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="p-6">
                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900">Configuration</h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">Set the basic details for this section</p>
                </div>
                
                <div className="mt-6 flex flex-col md:flex-row gap-6">
                   <div className="flex-1 space-y-2">
                     <label className="block text-[13px] font-medium text-gray-900">Title</label>
                     <input
                       type="text"
                       required
                       value={form.title}
                       onChange={(e) => setForm({ ...form, title: e.target.value })}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                       placeholder="Top Products"
                     />
                   </div>
                   <div className="flex-1 space-y-2">
                     <label className="block text-[13px] font-medium text-gray-900">Order</label>
                     <input
                       type="number"
                       value={form.order}
                       onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
                     />
                   </div>
                </div>

                <div className="mt-6 space-y-2 max-w-[400px]">
                   <label className="block text-[13px] font-medium text-gray-900">Mode</label>
                   <select 
                      value={form.mode}
                      onChange={(e) => setForm({ ...form, mode: e.target.value as any })}
                      className="w-[120px] border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all bg-white"
                   >
                     <option value="manual">Manual</option>
                     <option value="auto">Auto</option>
                   </select>
                   <p className="text-[12px] text-gray-500">Manually select which products to show</p>
                </div>

                <div className="mt-6 flex items-center gap-2">
                   <div 
                      onClick={() => setForm({...form, isActive: !form.isActive})}
                      className={`relative w-10 h-6 rounded-full cursor-pointer transition-all ${form.isActive ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                   >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm flex items-center justify-center ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`}>
                      </div>
                   </div>
                   <span className="text-[13px] font-medium text-gray-900">Active</span>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-6">
                   {[0, 1, 2].map(idx => (
                     <div key={idx} className="flex-1 space-y-2">
                       <label className="block text-[13px] font-medium text-gray-900 mb-0">Image {idx + 1} (optional)</label>
                       <p className="text-[13px] text-gray-900 mb-2">Upload</p>
                       <label className="w-full h-[180px] rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden bg-white">
                          {form.images[idx] ? (
                            <>
                              <Image src={form.images[idx]} alt="Section image" fill className="object-cover" />
                              <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); clearImage(idx); }}
                                className="absolute top-2 right-2 w-6 h-6 rounded bg-white text-gray-700 border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
                              >
                                &times;
                              </button>
                            </>
                          ) : uploading === idx ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          ) : (
                            <CloudUpload className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, idx)} disabled={uploading !== null} />
                       </label>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Product Selection Card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col min-h-[400px]">
              <div className="p-6 pb-2">
                <h3 className="text-[14px] font-semibold text-gray-900">Select Products</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Search and paginate to find products</p>
                
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div className="flex-1 p-6">
                 {filteredProducts.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center text-center">
                       <span className="text-[13px] text-gray-500 font-medium">No products found.</span>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredProducts.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => toggleProduct(p.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${form.productIds.includes(p.id) ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                        >
                           <div className="w-10 h-10 rounded border border-gray-100 bg-gray-50 relative overflow-hidden flex-shrink-0">
                             {p.images?.[0] ? (
                               <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                             ) : (
                               <Star className="h-4 w-4 text-gray-300 m-auto" />
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-[13px] font-medium text-gray-900 truncate">{p.name}</p>
                             <p className="text-[12px] text-gray-500 truncate">Rs {p.price}</p>
                           </div>
                           {form.productIds.includes(p.id) && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-white stroke-[3]" />
                              </div>
                           )}
                        </div>
                      ))}
                    </div>
                 )}
              </div>
              
              <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 mt-auto">
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="px-6 py-2 rounded-lg bg-[#87aeea]/90 text-white text-[13px] font-medium hover:bg-[#729ee1] w-auto text-center flex justify-center items-center gap-2" 
                   style={{ backgroundColor: '#6b9cf4' }}
                 >
                   {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                   {editing ? 'Save Section' : 'Create Section'}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setShowForm(false); setEditing(null); }}
                   className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 w-auto text-center"
                 >
                   Cancel
                 </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
           <div>
              <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Featured Products</h1>
              <p className="text-[13px] text-gray-500 mt-1">Manage featured product sections for your storefront</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setForm({ title: 'Top Products', order: 0, mode: 'manual', isActive: true, images: ['', '', ''], productIds: [] });
                  setEditing(null);
                  setShowForm(true);
                }}
                className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
              >
                 <Plus className="h-4 w-4" /> Create New
              </button>
           </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
           
           <div className="p-6 pb-4">
             <h2 className="text-[14px] font-semibold text-gray-900">Featured Sections</h2>
             <p className="text-[13px] text-gray-500 mt-0.5">All featured product sections</p>
           </div>
           
           {sections.length === 0 ? (
             <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-2">No sections found</h3>
                <p className="text-[13px] text-gray-500 mb-6">Create your first featured section</p>
                <button 
                  onClick={() => {
                    setForm({ title: 'Top Products', order: 0, mode: 'manual', isActive: true, images: ['', '', ''], productIds: [] });
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="bg-[#3b82f6] text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
                >
                  <Plus className="h-4 w-4" /> Create New
                </button>
             </div>
           ) : (
             <div className="overflow-x-auto border-t border-gray-100">
                <table className="w-full text-left text-[13px]">
                   <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50">
                         <th className="px-6 py-3 font-medium text-gray-700 w-20">Order</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Title</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Mode</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Products</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Status</th>
                         <th className="px-6 py-3 font-medium text-gray-700 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {sections.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-all group">
                          <td className="px-6 py-4">
                             <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 font-medium">
                               {s.order || 0}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="font-medium text-gray-900">{s.title}</span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="capitalize text-gray-600">{s.mode}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                             {s.productIds?.length || 0} items
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${
                              s.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {s.isActive !== false ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <button
                                onClick={() => openEdit(s)}
                                className="hover:text-blue-600 transition-colors"
                                title="Edit section"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="hover:text-red-500 transition-colors"
                                title="Delete section"
                              >
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

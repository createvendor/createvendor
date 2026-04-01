'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Plus, Pencil, Trash2, ArrowLeft, CloudUpload, Loader2, X, Tag, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

interface Brand {
  id: string;
  name: string;
  imageUrl?: string;
  isActive: boolean;
  storeId: string;
}

export default function BrandsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [form, setForm] = useState({ 
    name: '', 
    imageUrl: '', 
    isActive: true 
  });

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'brands'), where('storeId', '==', storeId));
    const unsubscribeBrands = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Brand));
      data.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(data);
      setLoading(false);
    });

    const fetchCounts = async () => {
       const pq = query(collection(db, 'products'), where('storeId', '==', storeId));
       const psnap = await getDocs(pq);
       const bMap: Record<string, number> = {};
       psnap.docs.forEach(p => {
         const bId = p.data().brandId;
         if (bId) bMap[bId] = (bMap[bId] || 0) + 1;
       });
       setCounts(bMap);
    };
    fetchCounts();

    return () => unsubscribeBrands();
  }, [storeId]);

  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({ name: b.name, imageUrl: b.imageUrl || '', isActive: b.isActive !== false });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setForm(prev => ({ ...prev, imageUrl: data.url }));
      showToast('Image uploaded successfully', 'success');
    } catch {
      showToast('Image upload failed', 'error');
    } finally { setUploading(false); }
  };

  const clearImage = () => {
    setForm(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith('http')) {
        showToast('Please enter a valid URL', 'warning');
        return;
    }
    setForm(prev => ({ ...prev, imageUrl: imageUrlInput.trim() }));
    setImageUrlInput('');
    setShowUrlInput(false);
    showToast('Image link added', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return showToast('Brand name is required', 'warning');
    setSaving(true);
    try {
      const data = { ...form, storeId, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'brands', editing.id), data);
        showToast('Brand updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'brands'), { ...data, createdAt: serverTimestamp() });
        showToast('Brand created successfully', 'success');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (b: Brand) => {
     if (counts[b.id] > 0) return showToast(`Cannot delete brand with ${counts[b.id]} active products`, 'error');
     if (!confirm('Are you sure you want to delete this brand?')) return;
     try {
        await deleteDoc(doc(db, 'brands', b.id));
        showToast('Brand deleted', 'success');
     } catch (err) {
        showToast('Failed to delete brand', 'error');
     }
  };

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
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">{editing ? 'Edit Brand' : 'Create Brand'}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Add a new brand for your products</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-32">
          <div className="max-w-[700px] ml-0 md:ml-8">
            <form onSubmit={handleSave} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 space-y-6 bg-white">
                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900">Brand Information</h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">Enter the details for the new brand</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-gray-900">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <label className="block text-[13px] font-medium text-gray-900">Brand Image</label>
                     <button 
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[12px] font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-all cursor-pointer"
                     >
                        <LinkIcon size={12} /> {showUrlInput ? 'Cancel URL' : 'Add from URL'}
                     </button>
                  </div>
                  
                  {showUrlInput && (
                    <div className="p-4 rounded-lg border border-blue-100 bg-blue-50 mb-2 flex gap-2">
                        <input 
                            type="text"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="Paste image URL here (https://...)"
                            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-500 bg-white"
                        />
                        <button 
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition"
                        >
                            Add Link
                        </button>
                    </div>
                  )}

                  <p className="text-[13px] text-gray-900">Upload Brand Image</p>
                  <label className="w-full max-w-[300px] h-[160px] rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden bg-white mt-2">
                     {form.imageUrl ? (
                       <>
                         <Image src={form.imageUrl} alt="Brand" fill className="object-cover" unoptimized />
                         <button 
                           type="button" 
                           onClick={(e) => { e.preventDefault(); clearImage(); }}
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

                <label className="flex items-center gap-2 pt-2 cursor-pointer w-max pl-1">
                  <input 
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-900">Brand is active</span>
                </label>
              </div>
              
              <div className="p-4 bg-white flex items-center gap-3 flex-wrap">
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="px-6 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 w-auto text-center flex justify-center items-center gap-2" 
                 >
                   {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                   {editing ? 'Save Changes' : 'Create Brand'}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => { setShowForm(false); setEditing(null); }}
                   className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 w-auto text-center"
                 >
                   Cancel
                 </button>
              </div>
            </form>
          </div>
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
              <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Brands</h1>
              <p className="text-[13px] text-gray-500 mt-1">Manage your product brands</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setForm({ name: '', imageUrl: '', isActive: true });
                  setEditing(null);
                  setShowForm(true);
                }}
                className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
              >
                 <Plus className="h-4 w-4" /> Add Brand
              </button>
           </div>
        </div>

        {/* Main Section */}
        <div className="bg-white rounded-t-lg overflow-hidden min-h-[400px]">
           
           {brands.length === 0 ? (
             <div className="overflow-x-auto text-[13px]">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-gray-200">
                         <th className="px-6 py-3 font-medium text-gray-700 w-24">Image</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Name</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Status</th>
                         <th className="px-6 py-3 font-medium text-gray-700 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium border-b border-gray-200">
                           No brands found. Add your first brand to get started.
                        </td>
                      </tr>
                   </tbody>
                 </table>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                   <thead>
                      <tr className="border-b border-gray-200">
                         <th className="px-6 py-4 font-medium text-gray-700 w-24">Image</th>
                         <th className="px-6 py-4 font-medium text-gray-700">Name</th>
                         <th className="px-6 py-4 font-medium text-gray-700">Status</th>
                         <th className="px-6 py-4 font-medium text-gray-700 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {brands.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/50 transition-all group">
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                              {b.imageUrl ? (
                                <Image src={b.imageUrl} alt={b.name} fill className="object-cover" unoptimized />
                              ) : (
                                <Tag className="h-4 w-4 m-auto text-gray-400 absolute inset-0" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="font-medium text-gray-900">{b.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${
                              b.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {b.isActive !== false ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <button
                                onClick={() => openEdit(b)}
                                className="hover:text-blue-600 transition-colors"
                                title="Edit brand"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(b)}
                                className="hover:text-red-500 transition-colors"
                                title="Delete brand"
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

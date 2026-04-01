'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Plus, Trash2, Pencil, ArrowLeft, CloudUpload, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  storeId: string;
}

export default function FeaturesPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [form, setForm] = useState({ 
    title: '', 
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchFeatures = async () => {
      if (!storeId) return;
      try {
        const q = query(collection(db, 'features'), where('storeId', '==', storeId));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Feature));
        data.sort((a, b) => a.title.localeCompare(b.title));
        setFeatures(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchFeatures();
  }, [storeId]);

  const openEdit = (f: Feature) => {
    setEditing(f);
    setForm({ title: f.title, description: f.description || '', imageUrl: f.imageUrl || '' });
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
    if (!form.title) return showToast('Title is required', 'warning');
    setSaving(true);
    try {
      const data = { ...form, storeId, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'features', editing.id), data);
        setFeatures(prev => prev.map(f => f.id === editing.id ? { ...f, ...data } as Feature : f));
        showToast('Feature updated successfully', 'success');
      } else {
        const ref = await addDoc(collection(db, 'features'), { ...data, createdAt: serverTimestamp() });
        setFeatures(prev => [...prev, { id: ref.id, ...data } as Feature]);
        showToast('Feature created successfully', 'success');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
     if (!confirm('Are you sure you want to delete this feature?')) return;
     try {
        await deleteDoc(doc(db, 'features', id));
        setFeatures(prev => prev.filter(f => f.id !== id));
        showToast('Feature deleted', 'success');
     } catch (err) {
        showToast('Failed to delete feature', 'error');
     }
  };

  const filteredFeatures = features.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">{editing ? 'Edit Feature' : 'Create Feature'}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Add a feature for product pages (e.g. "Super Fast Delivery")</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-32">
          <div className="max-w-[700px] ml-0 md:ml-8">
            <form onSubmit={handleSave} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 space-y-6 bg-white">
                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900">Feature Information</h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">Enter title, description, and one image</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-gray-900">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                    placeholder="e.g. Super Fast Delivery"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-gray-900">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400 resize-y"
                    rows={4}
                    placeholder="Short description"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <label className="block text-[13px] font-medium text-gray-900 mb-0">Image</label>
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

                  <p className="text-[13px] text-gray-900 mb-2">Upload</p>
                  <label className="w-full max-w-[300px] h-[300px] rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden bg-white">
                     {form.imageUrl ? (
                       <>
                         <Image src={form.imageUrl} alt="Feature" fill className="object-cover" unoptimized />
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
                       <CloudUpload className="h-10 w-10 text-gray-500" strokeWidth={1.5} />
                     )}
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              
              <div className="p-4 bg-white border-t border-gray-200 max-h-[1px] opacity-0"></div>
              
              <div className="p-4 bg-white flex items-center gap-3 flex-wrap pt-0">
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="px-6 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 w-auto text-center flex justify-center items-center gap-2" 
                 >
                   {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                   {editing ? 'Save Changes' : 'Create Feature'}
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
              <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Features</h1>
              <p className="text-[13px] text-gray-500 mt-1">Manage product features (e.g. "Why shop from us" items)</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setForm({ title: '', description: '', imageUrl: '' });
                  setEditing(null);
                  setShowForm(true);
                }}
                className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
              >
                 <Plus className="h-4 w-4" /> Add Feature
              </button>
           </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6">
           <div className="max-w-[300px]">
              <input 
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
           </div>
        </div>

        {/* Main Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[120px]">
           
           {filteredFeatures.length === 0 ? (
             <div className="w-full h-full min-h-[120px] flex items-center justify-center text-center p-8">
               <span className="text-[13px] text-gray-500 font-medium">No features yet. Create one to get started.</span>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                   <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50">
                         <th className="px-6 py-3 font-medium text-gray-700 w-24">Image</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Title</th>
                         <th className="px-6 py-3 font-medium text-gray-700">Description</th>
                         <th className="px-6 py-3 font-medium text-gray-700 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredFeatures.map((f) => (
                        <tr key={f.id} className="hover:bg-gray-50/50 transition-all group">
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                              {f.imageUrl ? (
                                <Image src={f.imageUrl} alt={f.title} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">N/A</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="font-medium text-gray-900">{f.title}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                             <span className="line-clamp-1">{f.description || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <button
                                onClick={() => openEdit(f)}
                                className="hover:text-blue-600 transition-colors"
                                title="Edit feature"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(f.id)}
                                className="hover:text-red-500 transition-colors"
                                title="Delete feature"
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

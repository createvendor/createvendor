'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Plus, Pencil, Trash2, ArrowLeft, CloudUpload, Loader2, X, FolderTree, Search, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  storeId: string;
}

const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function CategoriesPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [form, setForm] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    imageUrl: '', 
    isActive: true 
  });

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'categories'), where('storeId', '==', storeId));
    const unsubscribeCategories = onSnapshot(q, (snap) => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      // Sort by creation time if available, otherwise by name
      cats.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(cats);
      setLoading(false);
    });

    const fetchCounts = async () => {
       const pq = query(collection(db, 'products'), where('storeId', '==', storeId));
       const psnap = await getDocs(pq);
       const cMap: Record<string, number> = {};
       psnap.docs.forEach(p => {
         const cId = p.data().categoryId;
         if (cId) cMap[cId] = (cMap[cId] || 0) + 1;
       });
       setCounts(cMap);
    };
    fetchCounts();

    return () => unsubscribeCategories();
  }, [storeId]);

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ 
      name: c.name, 
      slug: c.slug, 
      description: c.description || '', 
      imageUrl: c.imageUrl || '', 
      isActive: c.isActive !== false 
    });
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
    if (!form.name) return showToast('Category name is required', 'warning');
    setSaving(true);
    try {
      const data = { 
        ...form, 
        storeId, 
        slug: form.slug || toSlug(form.name),
        updatedAt: serverTimestamp() 
      };
      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), data);
        showToast('Category updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
        showToast('Category created successfully', 'success');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: Category) => {
     if (counts[c.id] > 0) return showToast(`Cannot delete category with ${counts[c.id]} active products`, 'error');
     if (!confirm('Are you sure you want to delete this category?')) return;
     try {
        await deleteDoc(doc(db, 'categories', c.id));
        showToast('Category deleted', 'success');
     } catch (err) {
        showToast('Failed to delete category', 'error');
     }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">{editing ? 'Edit Category' : 'Create Category'}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Add a new category to organize your products</p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-32">
          <div className="max-w-[700px] ml-0 md:ml-8">
            <form onSubmit={handleSave} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 space-y-6 bg-white">
                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900">Category Details</h3>
                  <p className="text-[13px] text-gray-500 mt-0.5">Fill in the information below to create a new category</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-gray-900">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                    placeholder="Enter category name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-gray-900">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400 resize-y"
                    rows={4}
                    placeholder="Enter category description"
                  />
                  <div className="text-[11px] text-gray-400 mt-1">{form.description.length}/1000 characters</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <label className="block text-[13px] font-medium text-gray-900">Category Image</label>
                     <button 
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[12px] font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-all"
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

                  <label className="w-full max-w-[300px] h-[160px] rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden bg-white">
                     {form.imageUrl ? (
                       <>
                         <Image src={form.imageUrl} alt="Category" fill className="object-cover" unoptimized />
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
                  <p className="text-[12px] text-gray-500">Upload an image for this category (optional)</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div>
                      <h4 className="text-[13px] font-medium text-gray-900">Active Status</h4>
                      <p className="text-[12px] text-gray-500 mt-0.5">Inactive categories will be hidden from customers</p>
                   </div>
                   <div 
                      onClick={() => setForm({...form, isActive: !form.isActive})}
                      className={`relative w-10 h-6 rounded-full cursor-pointer transition-all ${form.isActive ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                   >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between md:justify-end gap-3 flex-wrap">
                 <button 
                   type="button" 
                   onClick={() => { setShowForm(false); setEditing(null); }}
                   className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 w-full md:w-auto text-center"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="px-6 py-2 rounded-lg bg-[#87aeea]/90 text-white text-[13px] font-medium hover:bg-[#729ee1] w-full md:w-auto text-center flex justify-center items-center gap-2" 
                   style={{ backgroundColor: '#6b9cf4' }}
                 >
                   {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                   {editing ? 'Save Changes' : 'Create Category'}
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
              <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Categories</h1>
              <p className="text-[13px] text-gray-500 mt-1">Organize your products into categories</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setForm({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
                  setEditing(null);
                  setShowForm(true);
                }}
                className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
              >
                 <Plus className="h-4 w-4" /> Add Category
              </button>
           </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[500px] flex flex-col p-6">
           
           <div className="mb-4">
             <h2 className="text-[15px] font-semibold text-gray-900">All Categories</h2>
             <p className="text-[13px] text-gray-500 mt-1">{filteredCategories.length} categories found</p>
           </div>
           
           {categories.length > 0 && (
             <div className="relative w-full mb-6">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input 
                   type="text"
                   placeholder="Search categories..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
                 />
             </div>
           )}

           {filteredCategories.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-4 text-gray-500">
                   <FolderTree className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No categories found</h3>
                <p className="text-[13px] text-gray-500 mb-6">Get started by creating your first category</p>
                <button 
                  onClick={() => {
                    setForm({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="bg-[#3b82f6] text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </button>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                   <thead>
                      <tr className="border-b border-gray-200">
                         <th className="px-4 py-3 font-medium text-gray-500">Image</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Category Name</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Products</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                         <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredCategories.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                              {c.imageUrl ? (
                                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                              ) : (
                                <FolderTree className="h-4 w-4 m-auto text-gray-400 absolute inset-0" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{c.name}</span>
                              <span className="text-[11px] text-gray-400">/{c.slug}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                             <span className="text-gray-900">{counts[c.id] || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${
                              c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {c.isActive !== false ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <button
                                onClick={() => openEdit(c)}
                                className="hover:text-blue-600 transition-colors"
                                title="Edit category"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(c)}
                                className="hover:text-red-500 transition-colors"
                                title="Delete category"
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

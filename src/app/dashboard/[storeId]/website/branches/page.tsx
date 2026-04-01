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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  MapPin, 
  ExternalLink, 
  Trash2, 
  Pencil,
  Loader2,
  ChevronRight,
  Globe,
  Store as StoreIcon,
  X,
  Check
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Branch {
  id: string;
  name: string;
  location: string;
  googleMapLink: string;
  isMain: boolean;
  status: 'active' | 'inactive';
  storeId: string;
}

export default function BranchesPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    googleMapLink: '',
    isMain: false,
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'branches'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const branchData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      setBranches(branchData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleOpenForm = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        location: branch.location,
        googleMapLink: branch.googleMapLink || '',
        isMain: branch.isMain,
        status: branch.status || 'active'
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        location: '',
        googleMapLink: '',
        isMain: false,
        status: 'active'
      });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      showToast('Name and Location are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        storeId,
        updatedAt: serverTimestamp()
      };

      if (editingBranch) {
        await updateDoc(doc(db, 'branches', editingBranch.id), data);
        showToast('Branch updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'branches'), {
          ...data,
          createdAt: serverTimestamp()
        });
        showToast('Branch created successfully', 'success');
      }
      setShowForm(false);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await deleteDoc(doc(db, 'branches', id));
      showToast('Branch deleted', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-[28px] font-bold text-gray-900 leading-tight">Branches</h1>
                <p className="text-[14px] text-gray-500 mt-1">Manage and view your shop branches</p>
              </div>
              <button 
                onClick={() => handleOpenForm()}
                className="inline-flex items-center justify-center gap-2 bg-[#4381f2] hover:bg-[#3b71d6] text-white px-5 py-2.5 rounded-lg text-[14px] font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Branch
              </button>
            </div>

            {/* List Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-lg pl-10 pr-4 py-2 text-[14px] outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Branch Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Google Map</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBranches.length > 0 ? (
                      filteredBranches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <StoreIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[14px] font-bold text-gray-900 block">{branch.name}</span>
                                {branch.isMain && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-0.5 inline-block">Main</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[14px] text-gray-600">{branch.location}</span>
                          </td>
                          <td className="px-6 py-4 text-[14px] text-gray-600">
                             {branch.googleMapLink ? (
                               <a href={branch.googleMapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium">
                                 View Map <ExternalLink className="w-3 h-3" />
                               </a>
                             ) : (
                               <span className="text-gray-400">Not provided</span>
                             )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                              branch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {branch.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleOpenForm(branch)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(branch.id)}
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
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="max-w-[240px] mx-auto">
                            <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                            <p className="text-[14px] text-gray-500">No branches found. Add your first branch to get started.</p>
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
              <h1 className="text-[28px] font-bold text-gray-900 leading-tight">{editingBranch ? 'Edit Branch' : 'Create Branch'}</h1>
              <p className="text-[14px] text-gray-500 mt-1">{editingBranch ? 'Update branch details' : 'Add a new branch location for your shop'}</p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-8 space-y-6">
                 <div>
                   <h2 className="text-[15px] font-bold text-gray-900">Branch Information</h2>
                   <p className="text-[12px] text-gray-500 mt-0.5">Enter the details for the new branch</p>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[13px] font-bold text-gray-900">Branch Name *</label>
                       <input 
                         required
                         type="text"
                         value={formData.name}
                         onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                         placeholder="e.g., Main Store, Downtown Branch"
                         className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-300"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[13px] font-bold text-gray-900">Location *</label>
                       <input 
                         required
                         type="text"
                         value={formData.location}
                         onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                         placeholder="Full address of the branch"
                         className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-300"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[13px] font-bold text-gray-900">Google Map Link</label>
                       <input 
                         type="url"
                         value={formData.googleMapLink}
                         onChange={e => setFormData(p => ({ ...p, googleMapLink: e.target.value }))}
                         placeholder="https://maps.google.com/..."
                         className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-300"
                       />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                       <input 
                         type="checkbox"
                         id="isMain"
                         checked={formData.isMain}
                         onChange={e => setFormData(p => ({ ...p, isMain: e.target.checked }))}
                         className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                       />
                       <label htmlFor="isMain" className="text-[14px] font-medium text-gray-700 cursor-pointer">Set as main branch</label>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                       <span className="text-[13px] font-bold text-gray-900">Status</span>
                       <div className="flex items-center gap-2">
                         <button 
                           type="button"
                           onClick={() => setFormData(p => ({...p, status: 'active'}))}
                           className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${
                             formData.status === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                           }`}
                         >Active</button>
                         <button 
                           type="button"
                           onClick={() => setFormData(p => ({...p, status: 'inactive'}))}
                           className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${
                             formData.status === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                           }`}
                         >Inactive</button>
                       </div>
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
                   {editingBranch ? 'Update Branch' : 'Create Branch'}
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

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  Search, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Layout, 
  Globe, 
  MousePointer2,
  Settings2,
  RefreshCw,
  Loader2,
  Type,
  Link as LinkIcon
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  showInFooter: boolean;
  showInNavbar: boolean;
  storeId: string;
  createdAt: any;
}

export default function PagesManagement() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CustomPage | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: true,
    showInFooter: true,
    showInNavbar: false
  });

  useEffect(() => {
    if (!storeId) return;
    
    const q = query(collection(db, 'customPages'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomPage));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPages(list);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) return showToast('Title and Slug are required', 'error');
    setSaving(true);
    try {
      const data = { ...form, storeId, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'customPages', editing.id), data);
        showToast('Page updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'customPages'), { ...data, createdAt: serverTimestamp() });
        showToast('Page created successfully', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm({
        title: '', slug: '', content: '', isPublished: true, showInFooter: true, showInNavbar: false
      });
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this page?')) return;
    try {
      await deleteDoc(doc(db, 'customPages', id));
      showToast('Page removed', 'success');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const togglePublish = async (p: CustomPage) => {
     try {
        await updateDoc(doc(db, 'customPages', p.id), { isPublished: !p.isPublished });
        showToast(`Page ${p.isPublished ? 'drafted' : 'published'}`, 'success');
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
          
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in slide-in-from-left duration-500">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Content Pages</h1>
              <p className="text-[13px] text-gray-500 mt-1">Manage static content like Privacy Policy, About Us, and custom site pages</p>
            </div>
            <button 
              onClick={() => { setEditing(null); setForm({ title: '', slug: '', content: '', isPublished: true, showInFooter: true, showInNavbar: false }); setShowForm(true); }}
              className="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-3 text-[14px]"
            >
              <Plus className="h-5 w-5" /> Design New Page
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pages.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-20 text-center animate-in zoom-in-95 duration-700">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center mb-8 mx-auto">
                    <FileText className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">No custom pages yet</h3>
                <p className="text-[14px] text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">Establish trust with your customers by adding clear Policies, an About Us story, or any other informative content.</p>
                <button onClick={() => setShowForm(true)} className="text-blue-600 font-black text-sm hover:underline flex items-center gap-2 mx-auto">
                   Start your first page <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              pages.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 hover:shadow-2xl hover:shadow-blue-100/20 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => togglePublish(p)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${p.isPublished ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                          {p.isPublished ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                       </button>
                       <button onClick={() => { setEditing(p); setForm({...p}); setShowForm(true); }} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Pencil className="h-4 w-4" /></button>
                       <button onClick={() => handleDelete(p.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-[20px] font-black text-gray-900 truncate tracking-tight uppercase">{p.title}</h3>
                     <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                        <Globe className="h-3.5 w-3.5" /> /{p.slug}
                     </div>
                     <div className="pt-6 border-t border-gray-50 mt-6 flex flex-wrap gap-2">
                        {p.showInFooter && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">Footer</span>}
                        {p.showInNavbar && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md">Navbar</span>}
                        {!p.isPublished && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-md">Draft</span>}
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
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <button 
             onClick={() => { setShowForm(false); setEditing(null); }}
             className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
          >
             <X className="h-5 w-5" />
          </button>
          <div className="text-center flex-1 pr-12">
             <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">{editing ? 'Edit Page Architecture' : 'Initialize New Page'}</h1>
             <p className="text-[13px] text-gray-500 mt-1">Craft high-fidelity content pages for your storefront</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-10">
          
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/30 rounded-full translate-x-10 -translate-y-10" />
             
             <div className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                   <Type className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-[16px] font-bold text-gray-900">Page Identity</h2>
                   <p className="text-[12px] text-gray-500">Slug and Title configuration</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                   <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">Page Title</label>
                   <input 
                      required
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      placeholder="e.g. Terms of Service"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] px-8 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest pl-1">URL Slug</label>
                   <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/</div>
                      <input 
                         required
                         type="text"
                         value={form.slug}
                         onChange={(e) => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                         placeholder="terms-and-conditions"
                         className="w-full bg-gray-50 border-2 border-transparent rounded-[1.8rem] pl-12 pr-8 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner font-mono"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 relative overflow-hidden">
             <div className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                   <Layout className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-[16px] font-bold text-gray-900">Content Canvas</h2>
                   <p className="text-[12px] text-gray-500">Wealthy text content for your page</p>
                </div>
             </div>

             <textarea 
                required
                rows={12}
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
                placeholder="Compose your page content here (Supports standard text)..."
                className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] p-10 text-[16px] leading-relaxed text-gray-700 font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
             />
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12">
             <div className="mb-12 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <Settings2 className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-[16px] font-bold text-gray-900">Placement & Visibility</h2>
                   <p className="text-[12px] text-gray-500">Control where this page appears</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                      <p className="text-[13px] font-bold text-gray-900">Published</p>
                      <p className="text-[11px] text-gray-400">Live on site</p>
                   </div>
                   <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                      <p className="text-[13px] font-bold text-gray-900">Show in Footer</p>
                      <p className="text-[11px] text-gray-400">Bottom links</p>
                   </div>
                   <input type="checkbox" checked={form.showInFooter} onChange={e => setForm({...form, showInFooter: e.target.checked})} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                      <p className="text-[13px] font-bold text-gray-900">Show in Navbar</p>
                      <p className="text-[11px] text-gray-400">Header menu</p>
                   </div>
                   <input type="checkbox" checked={form.showInNavbar} onChange={e => setForm({...form, showInNavbar: e.target.checked})} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                </div>
             </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-10">
             <button 
                type="submit"
                disabled={saving}
                className="min-w-[240px] bg-blue-600 text-white font-black py-5 px-12 rounded-[2rem] hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-[15px]"
             >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                {editing ? 'Update Page' : 'Publish Page'}
             </button>
             <button 
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="text-gray-400 font-bold hover:text-gray-900 transition-all text-[15px] px-8"
             >
                Cancel
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}

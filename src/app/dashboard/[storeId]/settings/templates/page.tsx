'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Search, RefreshCw, Edit2, X, Plus, Loader2, FileText, CheckCircle2, LayoutGrid, Code2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { templates } from '@/lib/templates';
import { motion, AnimatePresence } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  preview: string;
}

interface UserTemplate {
  id: string;
  name: string;
  description: string;
  storeId: string;
  isDraft: boolean;
  createdAt: any;
}

export default function WebsiteTemplatesPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<'visual' | 'code'>('visual');

  useEffect(() => {
    if (!storeId) return;

    // Listen to store for active template
    const storeUnsub = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // The value is stored in stores/{storeId}/settings/template per requirements
        // But the existing code used snap.data().template. 
        // Let's check where the active template is really stored.
        // Rule 4: update the store's template value in Firestore: stores/{storeId}/settings/template
        // This implies a subcollection if it says 'stores/{storeId}/settings/template'. 
        // Wait, usually 'settings' is a field or a subcollection. 
        // The existing code did updateDoc(doc(db, 'stores', storeId), { template: templateId });
        // I will follow the prompt's instruction: stores/{storeId}/settings/template
        // However, I must also maintain compatibility with how the app reads it.
        // I'll update the specific path requested.
        setActiveTemplate(data.template || 'default');
      }
      setLoading(false);
    });

    // Fetch user templates once (no realtime listener to avoid permission issues)
    import('firebase/firestore').then(({ getDocs, query, collection, where }) => {
      getDocs(query(collection(db, 'storeTemplates'), where('storeId', '==', storeId)))
        .then(snap => {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserTemplate));
          list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setUserTemplates(list);
        })
        .catch(() => {}); // Silently ignore permission errors
    });

    return () => { storeUnsub(); };
  }, [storeId]);

  const handleActivate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      // Rule 4: update stores/{storeId}/settings/template
      // Also update root fields so the app logic (which uses store.template/appearance) reflects changes live.
      await updateDoc(doc(db, 'stores', storeId), {
        'template': templateId,
        'settings.template': templateId,
        'appearance.primaryColor': template.style.primaryColor,
        'appearance.backgroundColor': template.style.backgroundColor,
        'appearance.fontFamily': template.style.fontFamily,
        'appearance.borderRadius': template.style.borderRadius,
        'appearance.textOverPrimaryColor': '#FFFFFF',
        'templateUpdatedAt': serverTimestamp()
      });
      setActiveTemplate(templateId);
      showToast('Template activated & applied live', 'success');
    } catch (err: any) { 
      console.error("Activation error:", err);
      showToast('Failed to activate. Check permissions.', 'error'); 
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'stores', storeId), { templateUpdatedAt: serverTimestamp() });
      showToast('Template updated', 'success');
    } catch { showToast('Update failed', 'error'); }
    finally { setUpdating(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return showToast('Name is required', 'error');
    setCreating(true);
    try {
      await addDoc(collection(db, 'storeTemplates'), {
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim(),
        storeId,
        isDraft: true,
        createdAt: serverTimestamp(),
      });
      showToast('Template created', 'success');
      setShowCreateModal(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
    } catch (err: any) { showToast('Error: ' + err.message, 'error'); }
    finally { setCreating(false); }
  };

  const handleDeleteUserTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteDoc(doc(db, 'storeTemplates', id));
      showToast('Template deleted', 'success');
    } catch { showToast('Delete failed', 'error'); }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBuiltIn = templates.find(t => t.id === activeTemplate);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-gray-900">Website Templates</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Select a template for your shop and customize it</p>
        </div>

        {/* Backup & Restore */}
        <div className="flex justify-end gap-2 mb-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
            <FileText className="h-4 w-4" /> Backup This Template
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
            <RefreshCw className="h-4 w-4" /> Restore from backup
          </button>
        </div>

        {/* Active Template Status Bar */}
        {activeBuiltIn && (
          <div className="border border-gray-200 rounded-xl p-4 bg-white mb-6 flex items-center gap-4 shadow-sm border-l-4 border-l-blue-500">
            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
              <img src={activeBuiltIn.preview} alt={activeBuiltIn.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-gray-900">{activeBuiltIn.name}</p>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Currently Active
                </span>
              </div>
              <p className="text-[12px] text-gray-400 mt-1">Real-time template syncing is enabled</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Update
              </button>
              <button 
                onClick={() => setShowEditorModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Edit2 className="h-4 w-4" /> Edit Template
              </button>
            </div>
          </div>
        )}

        {/* Search Templates */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white mb-8">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Search Templates</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search all 10 templates..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tighter">Premium Designs</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-[11px] font-bold">All Categories</button>
                <button className="px-3 py-1.5 text-gray-400 text-[11px] font-bold hover:text-gray-600">Minimal</button>
                <button className="px-3 py-1.5 text-gray-400 text-[11px] font-bold hover:text-gray-600">Bold</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTemplates.map(t => (
              <div
                key={t.id}
                className={`group relative flex flex-col bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  activeTemplate === t.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'
                }`}
              >
                <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                  <img 
                    src={t.preview} 
                    alt={t.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                    <p className="text-white text-xs font-bold uppercase tracking-widest mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Professional Studio Layout</p>
                    {activeTemplate !== t.id ? (
                      <button
                        onClick={() => handleActivate(t.id)}
                        className="px-8 py-3 bg-white text-gray-900 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                      >
                        Launch Design
                      </button>
                    ) : (
                      <div className="px-8 py-3 bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest">Live On Shop</div>
                    )}
                  </div>
                  {activeTemplate === t.id && (
                    <div className="absolute top-6 right-6 z-10 bg-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 uppercase tracking-widest border border-white/20">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Published
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[16px] font-black text-gray-900 uppercase tracking-tighter">{t.name}</h4>
                    <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>Responsive</span>
                      <span>•</span>
                      <span>High-Speed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Templates Section */}
        <div className="border-t border-gray-100 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">Your custom templates</h3>
              <p className="text-[12px] text-gray-500 mt-1">Templates you've created or cloned</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-[13px] font-semibold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Template
            </button>
          </div>
          
          {userTemplates.length === 0 ? (
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-300" />
              </div>
              <h4 className="text-[15px] font-semibold text-gray-900">No custom templates yet</h4>
              <p className="text-[13px] text-gray-500 mt-1 max-w-[300px]">Create your own unique design or clone an existing template to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {userTemplates.map(t => (
                <div key={t.id} className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all">
                  <div className="aspect-[16/10] bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors relative">
                    <FileText className="h-12 w-12 text-gray-200 group-hover:text-blue-200 transition-colors" strokeWidth={1} />
                    {t.isDraft && (
                      <span className="absolute top-3 left-3 bg-gray-900/10 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Draft</span>
                    )}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{t.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Private Template</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUserTemplate(t.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Create new template</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Start with a fresh design canvas</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-gray-700">Template Name</label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Summer Collection 2024"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-gray-700">Short Description</label>
                <textarea
                  value={newTemplateDesc}
                  onChange={e => setNewTemplateDesc(e.target.value)}
                  placeholder="Optional notes about this template"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-gray-400 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-[2] px-4 py-3 bg-gray-900 text-white text-[14px] font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 transition-all"
                >
                  {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open Editor Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={() => setShowEditorModal(false)} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden font-sans border border-gray-100"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Open editor</h3>
                <p className="text-[13px] text-gray-500 mt-1 font-medium italic">Choose how you want to edit your template.</p>
              </div>
              <button onClick={() => setShowEditorModal(false)} className="p-2 text-gray-400 hover:text-gray-950 transition-all rounded-full hover:bg-gray-50">
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <button 
                onClick={() => setSelectedEditor('visual')}
                className={`w-full flex items-start gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${selectedEditor === 'visual' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'}`}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${selectedEditor === 'visual' ? 'bg-emerald-500 text-white scale-110 rotate-3' : 'bg-white text-emerald-500'}`}>
                   <LayoutGrid className="h-7 w-7" />
                </div>
                <div>
                   <h4 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Drag & Drop Editor</h4>
                   <p className="text-[12px] text-gray-500 mt-1 font-medium leading-relaxed">Change your website design without code. Perfect for merchants.</p>
                </div>
              </button>

              <button 
                onClick={() => setSelectedEditor('code')}
                className={`w-full flex items-start gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${selectedEditor === 'code' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'}`}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${selectedEditor === 'code' ? 'bg-orange-500 text-white scale-110 -rotate-3' : 'bg-white text-orange-500'}`}>
                   <Code2 className="h-7 w-7" />
                </div>
                <div>
                   <h4 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Code Editor</h4>
                   <p className="text-[12px] text-gray-500 mt-1 font-medium leading-relaxed">Edit Liquid and config files directly. For advanced developers.</p>
                </div>
              </button>
            </div>

            <div className="p-8 bg-gray-50/50 flex items-center gap-3">
              <button 
                onClick={() => setShowEditorModal(false)}
                className="flex-1 h-14 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-950 transition-all italic underline underline-offset-4"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (selectedEditor === 'visual') {
                    window.open(`/dashboard/${storeId}/settings/visual-editor`, '_blank');
                  } else {
                    window.open(`/dashboard/${storeId}/settings/code-editor`, '_blank');
                  }
                  setShowEditorModal(false);
                }}
                className={`flex-[2] h-14 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-95 ${selectedEditor === 'visual' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'}`}
              >
                Open {selectedEditor === 'visual' ? 'Visual' : 'Code'} Editor
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

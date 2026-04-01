'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  ChevronLeft, 
  Save, 
  Code2, 
  FileJson, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CodeEditorPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState('');

    useEffect(() => {
        const fetchStore = async () => {
            if (!storeId) return;
            try {
                const snap = await getDoc(doc(db, 'stores', storeId));
                if (snap.exists()) {
                    const data = snap.data();
                    setConfig(JSON.stringify(data.visualLayout || [], null, 2));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, [storeId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const parsed = JSON.parse(config);
            await updateDoc(doc(db, 'stores', storeId), {
                visualLayout: parsed,
                lastCodeUpdate: serverTimestamp()
            });
            showToast('JSON Configuration updated!', 'success');
        } catch (err: any) {
            showToast('Invalid JSON: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-950 text-white font-mono uppercase tracking-[0.3em]">Opening Terminal...</div>;

    return (
        <div className="h-screen flex flex-col bg-gray-950 text-gray-300 font-mono overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-50 shadow-2xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 group">
                        <ChevronLeft className="h-5 w-5 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-orange-600 rounded flex items-center justify-center shadow-lg">
                            <Code2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xs font-black uppercase tracking-widest text-white">Code Editor (JSON)</h1>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                <span>Config.json</span>
                                <ChevronRight className="h-2 w-2" />
                                <span className="text-orange-500">Edit Mode</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 text-[10px] font-bold">
                        <Info size={14} /> LIQUID ENGINE v2.0
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 h-10 bg-orange-600 text-white rounded font-bold text-[11px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50"
                    >
                        {saving ? 'UPDATING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* File Explorer Sidebar */}
                <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-8 shrink-0">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">File Explorer</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded text-xs text-white border-l-2 border-orange-500 transition-all cursor-pointer">
                                <FileJson className="h-4 w-4 text-orange-400" /> layout.config
                            </div>
                            <div className="flex items-center gap-3 p-3 text-xs text-gray-500 h-10 border border-transparent hover:border-gray-800 rounded transition-all cursor-not-allowed italic">
                                theme.liquid (locked)
                            </div>
                            <div className="flex items-center gap-3 p-3 text-xs text-gray-500 h-10 border border-transparent hover:border-gray-800 rounded transition-all cursor-not-allowed italic">
                                product.page (locked)
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto p-4 bg-orange-500/5 rounded border border-orange-500/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2 underline">Developer Tip:</p>
                        <p className="text-[9px] leading-relaxed text-gray-500 italic">Advanced merchants can edit JSON raw data here to create complex layouts.</p>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 bg-[#0d1117] p-8 overflow-hidden flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                         <div className="flex gap-2">
                             <div className="h-3 w-3 rounded-full bg-red-500/20"></div>
                             <div className="h-3 w-3 rounded-full bg-orange-500/20"></div>
                             <div className="h-3 w-3 rounded-full bg-emerald-500/20"></div>
                         </div>
                         <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Read & Write Access</span>
                    </div>
                    <textarea 
                        value={config}
                        onChange={(e) => setConfig(e.target.value)}
                        className="flex-1 w-full bg-transparent outline-none resize-none border-none text-[13px] font-mono leading-relaxed text-blue-300 selection:bg-orange-500/30"
                        spellCheck={false}
                    />
                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-[9px] text-gray-700 font-bold uppercase tracking-[0.2em]">
                        <span>UTF-8 // JSON</span>
                        <span>Line {config.split('\n').length} // Col 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

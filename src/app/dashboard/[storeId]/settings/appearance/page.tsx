'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Palette, Loader2, Save, Type, MousePointer2, Check, ChevronDown, Info, Layout, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Helper to determine if a color is light or dark
function getContrastColor(hexColor: string) {
  if (!hexColor) return '#FFFFFF';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

const FONTS = [
  'Poppins',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Raleway',
  'Source Sans Pro'
];

export default function AppearancePage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    primaryColor: '#2563eb',
    textOverPrimaryColor: '#FFFFFF',
    manualColorOverride: false,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
  });

  useEffect(() => {
    if (!storeId) return;

    const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.appearance) {
          setForm(prev => ({
            ...prev,
            ...data.appearance
          }));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const autoContrastColor = useMemo(() => {
    return getContrastColor(form.primaryColor);
  }, [form.primaryColor]);

  const activeTextOverPrimary = form.manualColorOverride ? form.textOverPrimaryColor : autoContrastColor;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...form,
        textOverPrimaryColor: activeTextOverPrimary
      };
      await updateDoc(doc(db, 'stores', storeId), { 
        appearance: dataToSave, 
        updatedAt: new Date() 
      });
      showToast('Appearance settings updated', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Appearance</h1>
            <p className="text-[13px] text-gray-500 mt-1">Design your shop's visual identity</p>
          </div>
          <button 
            type="submit"
            form="appearance-form"
            disabled={saving}
            className="bg-blue-600 text-white font-bold py-3.5 px-10 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-[14px]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Styles
          </button>
        </div>

        <form id="appearance-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left-4 duration-500">
             
             {/* Colors Card */}
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Palette className="h-6 w-6" />
                   </div>
                   <div>
                      <h2 className="text-[16px] font-bold text-gray-900">Brand Colors</h2>
                      <p className="text-[13px] text-gray-500">Select colors that represent your brand</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-4">Primary Brand Color</label>
                      <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                         <div 
                           className="w-12 h-12 rounded-xl shadow-inner cursor-pointer border-2 border-white ring-1 ring-gray-100 overflow-hidden" 
                           style={{ backgroundColor: form.primaryColor }}
                         >
                            <input 
                               type="color" 
                               value={form.primaryColor} 
                               onChange={(e) => setForm({...form, primaryColor: e.target.value})} 
                               className="w-full h-full opacity-0 cursor-pointer"
                            />
                         </div>
                         <input 
                            type="text" 
                            value={form.primaryColor.toUpperCase()} 
                            onChange={(e) => setForm({...form, primaryColor: e.target.value})} 
                            className="bg-transparent text-[14px] font-mono font-bold text-gray-600 outline-none w-24"
                         />
                      </div>
                   </div>

                   <div className={!form.manualColorOverride ? "opacity-30 pointer-events-none transition-all" : "transition-all"}>
                      <label className="block text-[13px] font-bold text-gray-700 mb-4">Text Over Primary</label>
                      <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                         <div 
                           className="w-12 h-12 rounded-xl shadow-inner cursor-pointer border-2 border-white ring-1 ring-gray-100 overflow-hidden" 
                           style={{ backgroundColor: activeTextOverPrimary }}
                         >
                            <input 
                               type="color" 
                               disabled={!form.manualColorOverride}
                               value={activeTextOverPrimary} 
                               onChange={(e) => setForm({...form, textOverPrimaryColor: e.target.value})} 
                               className="w-full h-full opacity-0 cursor-pointer"
                            />
                         </div>
                         <input 
                            type="text" 
                            disabled={!form.manualColorOverride}
                            value={activeTextOverPrimary.toUpperCase()} 
                            onChange={(e) => setForm({...form, textOverPrimaryColor: e.target.value})} 
                            className="bg-transparent text-[14px] font-mono font-bold text-gray-600 outline-none w-24"
                         />
                      </div>
                   </div>
                </div>

                <div className="mt-10 p-6 bg-blue-50/50 border border-blue-50 rounded-[1.8rem] flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${form.manualColorOverride ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                         <RefreshCw className={`h-4 w-4 ${!form.manualColorOverride && 'animate-spin-slow'}`} />
                      </div>
                      <div>
                         <p className="text-[13px] font-bold text-gray-900">Automatic Contrast</p>
                         <p className="text-[11px] text-gray-500">Automatically adjust text for visibility</p>
                      </div>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setForm({...form, manualColorOverride: !form.manualColorOverride})}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 ${form.manualColorOverride ? 'bg-amber-500' : 'bg-blue-600'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${form.manualColorOverride ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
             </div>

             {/* Typography Card */}
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Type className="h-6 w-6" />
                   </div>
                   <div>
                      <h2 className="text-[16px] font-bold text-gray-900">Typography</h2>
                      <p className="text-[13px] text-gray-500">Select the primary font for your shop</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {FONTS.map(font => (
                     <div 
                        key={font}
                        onClick={() => setForm({...form, fontFamily: font})}
                        className={`cursor-pointer h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:border-blue-200 ${form.fontFamily === font ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-gray-50 bg-gray-50/30'}`}
                     >
                        <span className="text-[20px] font-bold text-gray-900" style={{ fontFamily: font }}>Aa</span>
                        <span className="text-[11px] font-bold text-gray-500">{font}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Layout Card */}
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Layout className="h-6 w-6" />
                   </div>
                   <div>
                      <h2 className="text-[16px] font-bold text-gray-900">Corner Radius</h2>
                      <p className="text-[13px] text-gray-500">Control the curve of your interface elements</p>
                   </div>
                </div>

                <div className="flex items-center gap-6">
                   {['0px', '8px', '16px', '32px'].map(radius => (
                     <div 
                        key={radius}
                        onClick={() => setForm({...form, borderRadius: radius})}
                        className={`flex-1 h-14 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${form.borderRadius === radius ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold shadow-sm' : 'border-gray-100 bg-white text-gray-400 font-medium hover:bg-gray-50'}`}
                     >
                        <span className="text-[13px]">{radius === '0px' ? 'Sharp' : radius === '32px' ? 'Round' : radius}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right Column: Premium Preview */}
          <div className="lg:col-span-5 relative animate-in slide-in-from-right-4 duration-500">
             <div className="sticky top-12">
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                   
                   {/* Mock Browser Header */}
                   <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                      <div className="flex gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-100" />
                         <div className="w-3 h-3 rounded-full bg-amber-100" />
                         <div className="w-3 h-3 rounded-full bg-emerald-100" />
                      </div>
                      <div className="bg-gray-50 rounded-full px-5 py-1.5 text-[11px] text-gray-400 font-bold border border-gray-100">
                         yourstore.com
                      </div>
                      <div className="flex gap-4 text-gray-300">
                         <Monitor className="h-4 w-4" />
                         <Smartphone className="h-4 w-4" />
                      </div>
                   </div>

                   {/* Mock Content */}
                   <div className="p-10 flex-1 space-y-12" style={{ fontFamily: form.fontFamily }}>
                      {/* Nav Mock */}
                      <div className="flex items-center justify-between">
                         <div className="w-24 h-6 bg-gray-100 rounded-lg animate-pulse" />
                         <div className="flex gap-6">
                            <div className="w-10 h-2 bg-gray-100 rounded-full" />
                            <div className="w-10 h-2 bg-gray-100 rounded-full" />
                         </div>
                      </div>

                      {/* Hero Section Mock */}
                      <div className="space-y-6">
                         <h3 className="text-[32px] font-bold text-gray-900 leading-[1.1] tracking-tight">Experience Premium Shopping</h3>
                         <p className="text-[14px] text-gray-500 leading-relaxed">Discover our new summer collection designed for the modern lifestyle.</p>
                         <button 
                            type="button"
                            className="px-8 py-3.5 font-bold transition-all shadow-xl shadow-blue-100 active:scale-95"
                            style={{ backgroundColor: form.primaryColor, color: activeTextOverPrimary, borderRadius: form.borderRadius }}
                         >
                            Shop Collection
                         </button>
                      </div>

                      {/* Products Grid Mock */}
                      <div className="grid grid-cols-2 gap-6">
                         {[1, 2].map(i => (
                           <div key={i} className="space-y-4">
                              <div className="aspect-square bg-gray-50 border border-gray-50" style={{ borderRadius: form.borderRadius }} />
                              <div className="space-y-2">
                                 <div className="w-2/3 h-3 bg-gray-100 rounded-full" />
                                 <div className="w-1/3 h-3 font-bold" style={{ color: form.primaryColor }}>Rs 2,500</div>
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="pt-8 border-t border-gray-50 flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-50" />
                         <div className="space-y-1">
                            <div className="w-24 h-2 bg-gray-100 rounded-full" />
                            <div className="w-16 h-2 bg-gray-50 rounded-full" />
                         </div>
                      </div>
                   </div>

                   {/* Preview Footer */}
                   <div className="p-8 bg-gray-50/50 text-center border-t border-gray-50">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Live Visual Preview</span>
                   </div>
                </div>
                
                <p className="text-center mt-8 text-[12px] text-gray-400 font-medium italic animate-pulse">Changes will reflect instantly on your storefront</p>
             </div>
          </div>

        </form>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700;800;900&family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap');
      `}</style>
    </div>
  );
}

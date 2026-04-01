'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { CreditCard, Loader2, Save, CheckCircle2, AlertTriangle, Smartphone, Wallet, QrCode, ShieldCheck, ChevronRight, X, Info, Upload } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

export default function PaymentMethodsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeConfig, setActiveConfig] = useState<string | null>(null);

  const [methods, setMethods] = useState({
    cod: { isEnabled: true },
    fonepay: { isEnabled: false, merchantId: '', secretKey: '', username: '', password: '' },
    manualQr: { isEnabled: false, qrImageUrl: '', details: '' },
    esewa: { isEnabled: false, merchantId: '', details: '' },
    khalti: { isEnabled: false, secretKey: '', details: '' }
  });

  useEffect(() => {
    if (!storeId) return;

    const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.paymentMethods) {
          setMethods(prev => ({ ...prev, ...data.paymentMethods }));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleSaveConfig = async (methodKey: string, config: any) => {
    setSaving(true);
    try {
      const newMethods = { ...methods, [methodKey]: config };
      await updateDoc(doc(db, 'stores', storeId), { 
        paymentMethods: newMethods, 
        updatedAt: new Date() 
      });
      showToast(`${methodKey.toUpperCase()} configuration updated!`, 'success');
      setActiveConfig(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async (key: string) => {
    const method = (methods as any)[key];
    const newConfig = { ...method, isEnabled: !method.isEnabled };
    
    try {
      const newMethods = { ...methods, [key]: newConfig };
      await updateDoc(doc(db, 'stores', storeId), { 
        paymentMethods: newMethods, 
        updatedAt: new Date() 
      });
      showToast(`${key.toUpperCase()} is now ${newConfig.isEnabled ? 'Active' : 'Disabled'}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
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
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Payment Methods</h1>
            <p className="text-[13px] text-gray-500 mt-1">Setup secure checkout options for your customers</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
             <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-4 w-4" />
             </div>
             <span className="text-[13px] font-bold text-gray-700">128-bit Encryption Enabled</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
           <div className="max-w-xl">
              <h2 className="text-[22px] font-bold mb-3">Accepting Local Payments</h2>
              <p className="text-blue-100 text-[14px] leading-relaxed">Boost your sales by offering popular local payment methods like Fonepay and Manual QR. Ensure your merchant details are accurate to avoid payment delays.</p>
           </div>
           <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                   {i === 1 && <Image src="https://login.fonepay.com/assets/img/fonepay_payments_fatafat.png" alt="Fonepay" width={60} height={60} className="object-contain" />}
                   {i === 2 && <Smartphone className="h-8 w-8 text-white/80" />}
                   {i === 3 && <CreditCard className="h-8 w-8 text-white/80" />}
                </div>
              ))}
           </div>
        </div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           
           {/* COD Card */}
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 flex flex-col h-full hover:shadow-xl hover:shadow-gray-100 transition-all duration-500 group">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                 <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">Cash on Delivery</h3>
              <p className="text-[13px] text-gray-500 mb-8 flex-1">Standard method where customers pay when they receive products.</p>
              
              <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${methods.cod.isEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-bold uppercase tracking-wider text-gray-400">{methods.cod.isEnabled ? 'Active' : 'Disabled'}</span>
                 </div>
                 <button 
                  onClick={() => toggleMethod('cod')}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${methods.cod.isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${methods.cod.isEnabled ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
           </div>

           {/* Fonepay Card */}
           <div className={`bg-white rounded-[2.5rem] border transition-all duration-500 p-10 flex flex-col h-full hover:shadow-xl ${activeConfig === 'fonepay' ? 'border-blue-600 ring-4 ring-blue-50 shadow-2xl' : 'border-gray-100 hover:shadow-blue-100/20'}`}>
              <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 flex items-center justify-center mb-10 overflow-hidden relative shadow-sm">
                 <Image src="https://login.fonepay.com/assets/img/fonepay_payments_fatafat.png" alt="Fonepay" fill className="object-contain p-2" />
              </div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[17px] font-bold text-gray-900">FonepayQR</h3>
                 {!methods.fonepay.merchantId && <div className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase">Setup Reqd</div>}
              </div>
              <p className="text-[13px] text-gray-500 mb-8 flex-1">Accept instant payments through Fonepay network with automatic verification.</p>
              
              <div className="pt-8 border-t border-gray-50 flex items-center justify-between gap-4">
                 <button 
                   onClick={() => setActiveConfig('fonepay')}
                   className="flex-1 bg-gray-50 text-gray-900 font-bold py-3.5 rounded-2xl text-[13px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                 >
                    Configure
                 </button>
                 <button 
                  disabled={!methods.fonepay.merchantId}
                  onClick={() => toggleMethod('fonepay')}
                  className={`w-14 h-8 flex-shrink-0 rounded-full relative transition-all duration-300 disabled:opacity-30 ${methods.fonepay.isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${methods.fonepay.isEnabled ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
           </div>

           {/* Manual QR Card */}
           <div className={`bg-white rounded-[2.5rem] border transition-all duration-500 p-10 flex flex-col h-full hover:shadow-xl ${activeConfig === 'manualQr' ? 'border-blue-600 ring-4 ring-blue-50 shadow-2xl' : 'border-gray-100 hover:shadow-blue-100/20'}`}>
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-10 shadow-sm">
                 <QrCode className="h-8 w-8" />
              </div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[17px] font-bold text-gray-900">Manual QR</h3>
                 {!methods.manualQr.qrImageUrl && <div className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase">Setup Reqd</div>}
              </div>
              <p className="text-[13px] text-gray-500 mb-8 flex-1">Upload your own QR code for customers to scan and pay manually.</p>
              
              <div className="pt-8 border-t border-gray-50 flex items-center justify-between gap-4">
                 <button 
                   onClick={() => setActiveConfig('manualQr')}
                   className="flex-1 bg-gray-50 text-gray-900 font-bold py-3.5 rounded-2xl text-[13px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                 >
                    Configure
                 </button>
                 <button 
                   disabled={!methods.manualQr.qrImageUrl}
                   onClick={() => toggleMethod('manualQr')}
                   className={`w-14 h-8 flex-shrink-0 rounded-full relative transition-all duration-300 disabled:opacity-30 ${methods.manualQr.isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${methods.manualQr.isEnabled ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
           </div>

        </div>

      </div>

      {/* Config Overlay / Drawer */}
      {activeConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setActiveConfig(null)} />
           <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                       {activeConfig === 'fonepay' ? <Wallet className="h-6 w-6" /> : <QrCode className="h-6 w-6" />}
                    </div>
                    <div>
                       <h2 className="text-[18px] font-bold text-gray-900">{activeConfig === 'fonepay' ? 'Fonepay Configuration' : 'Manual QR Setup'}</h2>
                       <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-widest font-bold">Secure Merchant Setup</p>
                    </div>
                 </div>
                 <button onClick={() => setActiveConfig(null)} className="p-2.5 bg-white border border-gray-100 rounded-full hover:bg-gray-100 transition-all text-gray-400">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <div className="p-10 max-h-[70vh] overflow-y-auto">
                 {activeConfig === 'fonepay' ? (
                   <form 
                     className="space-y-8" 
                     onSubmit={(e) => {
                       e.preventDefault();
                       const target = e.target as any;
                       handleSaveConfig('fonepay', {
                         ...methods.fonepay,
                         merchantId: target.merchantId.value,
                         secretKey: target.secretKey.value,
                         username: target.username.value,
                         password: target.password.value
                       });
                     }}
                   >
                      <div className="bg-amber-50 border border-amber-100 rounded-[1.8rem] p-6 flex gap-4">
                         <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                         <p className="text-[13px] text-amber-800 leading-relaxed font-medium">
                            <span className="font-bold">Disclaimer:</span> Ensure all credentials are correct. CreateVendor is not responsible for payment failures due to incorrect configuration.
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Merchant ID *</label>
                            <input name="merchantId" required defaultValue={methods.fonepay.merchantId} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" placeholder="Enter your merchant identifier" />
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Secret Key *</label>
                            <input name="secretKey" required type="password" defaultValue={methods.fonepay.secretKey} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" placeholder="••••••••••••••••" />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Username *</label>
                            <input name="username" required defaultValue={methods.fonepay.username} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" placeholder="Merchant login" />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Password *</label>
                            <input name="password" required type="password" defaultValue={methods.fonepay.password} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" placeholder="Merchant password" />
                         </div>
                      </div>

                      <div className="pt-6">
                         <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Secure Configuration'}
                         </button>
                      </div>
                   </form>
                 ) : (
                   <form 
                     className="space-y-8"
                     onSubmit={(e) => {
                        e.preventDefault();
                        const target = e.target as any;
                        handleSaveConfig('manualQr', {
                          ...methods.manualQr,
                          qrImageUrl: target.qrUrl.value,
                          details: target.details.value
                        });
                     }}
                   >
                      <div className="space-y-6">
                         <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-4">Merchant QR Image</label>
                            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer group">
                               {methods.manualQr.qrImageUrl ? (
                                 <div className="relative w-40 h-40 bg-white rounded-3xl shadow-lg border border-gray-100 p-4">
                                    <Image src={methods.manualQr.qrImageUrl} alt="QR" fill className="object-contain p-4" />
                                 </div>
                               ) : (
                                 <Upload className="h-10 w-10 text-gray-300 mb-3 group-hover:text-blue-600 transition-all" />
                               )}
                               <span className="text-[13px] text-gray-400 font-medium mt-4">Click to upload or replace QR image</span>
                            </div>
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">QR Image URL (Direct Link) *</label>
                            <input name="qrUrl" required defaultValue={methods.manualQr.qrImageUrl} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" placeholder="https://..." />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Payment Instructions (Optional)</label>
                            <textarea name="details" defaultValue={methods.manualQr.details} rows={4} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm resize-none" placeholder="Enter bank account dertails or payment notes..." />
                         </div>
                      </div>

                      <div className="pt-6">
                         <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save QR Setup'}
                         </button>
                      </div>
                   </form>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

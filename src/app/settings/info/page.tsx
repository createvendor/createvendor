'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store } from '@/types';
import { 
  Store as StoreIcon, Loader2, Save, Globe, Info, 
  MapPin, Phone, Mail, FileText, Image as ImageIcon, 
  Link as LinkIcon, Plus, Trash2, UploadCloud, CheckCircle2,
  Settings, Instagram, Facebook, Twitter, Chrome
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

export default function ShopInfoPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    phone: '',
    address: '',
    panVat: '',
    isPublished: true,
  });

  const [currency, setCurrency] = useState('Rs');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string}[]>([]);

  useEffect(() => {
    if (!storeId) return;

    const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Store;
        setFormData({
          name: data.name || '',
          description: data.description || '',
          contactEmail: data.contactEmail || data.settings?.contactEmail || '',
          phone: data.phone || '',
          address: data.address || '',
          panVat: data.panVat || '',
          isPublished: data.isPublished !== false,
        });
        setCurrency(data.settings?.currency || 'Rs');
        setLogoUrl((data.appearance as any)?.logoUrl || '');
        setFaviconUrl((data.appearance as any)?.faviconUrl || '');
        setSocialLinks(data.settings?.socialLinks || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (!file) return;
    const isLogo = type === 'logo';
    isLogo ? setUploadingLogo(true) : setUploadingFavicon(true);
    
    try {
      const form = new FormData();
      form.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      isLogo ? setLogoUrl(data.url) : setFaviconUrl(data.url);
      showToast(`${isLogo ? 'Logo' : 'Favicon'} uploaded successfully!`, 'success');
    } catch (err: any) {
      showToast("Failed to upload image.", 'error');
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingFavicon(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const storeRef = doc(db, 'stores', storeId);
      await updateDoc(storeRef, {
        ...formData,
        'settings.currency': currency,
        'settings.socialLinks': socialLinks,
        'appearance.logoUrl': logoUrl,
        'appearance.faviconUrl': faviconUrl,
      });
      showToast('Shop information updated successfully!', 'success');
    } catch (error) {
      showToast("Error updating store info", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );

  const CURRENCIES = [
    { value: 'Rs', label: 'Rs (Nepalese Rupee)' },
    { value: '₹', label: '₹ (Indian Rupee)' },
    { value: '$', label: '$ (US Dollar)' },
    { value: '€', label: '€ (Euro)' },
    { value: '£', label: '£ (British Pound)' },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-10 font-sans pb-32">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Shop Information</h1>
            <p className="text-[13px] text-gray-500 mt-1">Configure your public shop profile and branding</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="hidden md:flex bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 items-center gap-2 text-[14px] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Visibility */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${formData.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Globe className="h-6 w-6" />
                   </div>
                   <div>
                      <h2 className="text-[15px] font-bold text-gray-900">Shop Visibility</h2>
                      <p className="text-[13px] text-gray-500 mt-1">{formData.isPublished ? 'Your shop is live and accepting orders.' : 'Your shop is currently hidden from the public.'}</p>
                   </div>
                </div>
                <div 
                   onClick={() => setFormData(p => ({...p, isPublished: !p.isPublished}))}
                   className={`w-16 h-9 rounded-full p-1 cursor-pointer transition-all flex-shrink-0 ${formData.isPublished ? 'bg-emerald-600' : 'bg-gray-200'}`}
                >
                   <div className={`w-7 h-7 bg-white rounded-full shadow-sm transition-all ${formData.isPublished ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
             </div>
          </div>

          {/* Section 2: General Details */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-10 space-y-10">
                <div>
                   <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                      <StoreIcon className="h-5 w-5 text-blue-600" /> Basic Details
                   </h2>
                   <p className="text-[13px] text-gray-500 mt-1">Foundational information about your business</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="md:col-span-2">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2">Shop Name *</label>
                      <input 
                         required 
                         name="name"
                         value={formData.name} 
                         onChange={handleInputChange} 
                         className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3.5 text-[15px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                         placeholder="Enter your brand name"
                      />
                   </div>

                   <div className="md:col-span-2">
                      <label className="block text-[13px] font-bold text-gray-700 mb-2">Shop Description</label>
                      <textarea 
                         name="description"
                         rows={4}
                         value={formData.description} 
                         onChange={handleInputChange} 
                         className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-4 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm resize-none" 
                         placeholder="Describe what you sell and your shop's mission..."
                      />
                      <div className="text-[11px] text-gray-400 mt-2 text-right">{formData.description.length}/1000 characters</div>
                   </div>

                   <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-2">PAN / VAT Number</label>
                      <input 
                         name="panVat"
                         value={formData.panVat} 
                         onChange={handleInputChange} 
                         className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                         placeholder="e.g. 600000000"
                      />
                   </div>

                   <div>
                      <label className="block text-[13px] font-bold text-gray-700 mb-2">Currency Unit</label>
                      <select 
                         value={currency} 
                         onChange={(e) => setCurrency(e.target.value)} 
                         className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm cursor-pointer appearance-none"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                      >
                         {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-50">
                   <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-8">
                      <Mail className="h-5 w-5 text-blue-600" /> Contact & Location
                   </h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="block text-[13px] font-bold text-gray-700 mb-2">Public Contact Email *</label>
                         <input 
                            required
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail} 
                            onChange={handleInputChange} 
                            className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                            placeholder="support@yourshop.com"
                         />
                      </div>

                      <div>
                         <label className="block text-[13px] font-bold text-gray-700 mb-2">Public Phone Number *</label>
                         <input 
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. 9800000000"
                         />
                      </div>

                      <div className="md:col-span-2">
                         <label className="block text-[13px] font-bold text-gray-700 mb-2">Shop Address *</label>
                         <textarea 
                            required
                            name="address"
                            rows={2}
                            value={formData.address} 
                            onChange={handleInputChange} 
                            className="w-full border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm resize-none"
                            placeholder="Street address, City, Province"
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-50">
                   <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-8">
                      <ImageIcon className="h-5 w-5 text-blue-600" /> Branding Assets
                   </h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                         <label className="block text-[13px] font-bold text-gray-700 mb-4">Shop Logo</label>
                         <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                               {logoUrl ? <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" /> : <UploadCloud className="h-8 w-8 text-gray-300" />}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                               {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-blue-600" />}
                               Change Logo
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'logo')} />
                            </label>
                         </div>
                      </div>

                      <div>
                         <label className="block text-[13px] font-bold text-gray-700 mb-4">Favicon (Browser Icon)</label>
                         <div className="flex items-center gap-6">
                            <div className="relative w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                               {faviconUrl ? <Image src={faviconUrl} alt="Favicon" fill className="object-contain p-2" /> : <Chrome className="h-6 w-6 text-gray-300" />}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                               {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-blue-600" />}
                               Change Icon
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'favicon')} />
                            </label>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-50">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-blue-600" /> Social Presence
                         </h2>
                         <p className="text-[13px] text-gray-500 mt-1">Links to your external social media profiles</p>
                      </div>
                      <button 
                         type="button" 
                         onClick={addSocialLink}
                         className="bg-white border shadow-sm px-5 py-2 rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                      >
                         <Plus className="h-4 w-4" /> Add Link
                      </button>
                   </div>

                   {socialLinks.length === 0 ? (
                     <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                        <Facebook className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                        <p className="text-[13px] text-gray-400">No social links added yet</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {socialLinks.map((link, idx) => (
                          <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-top-2 duration-300">
                             <input 
                                value={link.platform} 
                                onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)} 
                                placeholder="Platform (e.g. Instagram)" 
                                className="w-1/3 border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                             />
                             <input 
                                value={link.url} 
                                onChange={(e) => updateSocialLink(idx, 'url', e.target.value)} 
                                placeholder="https://..." 
                                className="flex-1 border-2 border-gray-50 bg-gray-50/30 rounded-2xl px-5 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                             />
                             <button 
                                type="button" 
                                onClick={() => removeSocialLink(idx)}
                                className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                             >
                                <Trash2 className="h-5 w-5" />
                             </button>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
             
             {/* Bottom Mobile Save Button */}
             <div className="md:hidden p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-2xl">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
                >
                   {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                   Save Info
                </button>
             </div>
          </div>

        </form>
      </div>

    </div>
  );
}

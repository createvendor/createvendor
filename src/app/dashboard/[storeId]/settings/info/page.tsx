'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store } from '@/types';
import { Loader2, CloudUpload, Globe, Plus, Trash2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

const CURRENCIES = [
  { value: 'Rs', label: 'Rs (Nepalese Rupee)' },
  { value: '₹', label: '₹ (Indian Rupee)' },
  { value: '$', label: '$ (US Dollar)' },
  { value: '€', label: '€ (Euro)' },
  { value: '£', label: '£ (British Pound)' },
];

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
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);

  useEffect(() => {
    if (!storeId) return;
    const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Store;
        setFormData({
          name: data.name || '',
          description: data.description || '',
          contactEmail: data.contactEmail || (data.settings as any)?.contactEmail || '',
          phone: data.phone || '',
          address: data.address || '',
          panVat: data.panVat || '',
          isPublished: data.isPublished !== false,
        });
        setCurrency((data.settings as any)?.currency || 'Rs');
        setLogoUrl((data.appearance as any)?.logoUrl || '');
        setFaviconUrl((data.appearance as any)?.faviconUrl || '');
        setSocialLinks((data.settings as any)?.socialLinks || []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [storeId]);

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (!file) return;
    const isLogo = type === 'logo';
    isLogo ? setUploadingLogo(true) : setUploadingFavicon(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      isLogo ? setLogoUrl(data.url) : setFaviconUrl(data.url);
      showToast(`${isLogo ? 'Logo' : 'Favicon'} uploaded`, 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingFavicon(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'stores', storeId), {
        ...formData,
        'settings.currency': currency,
        'settings.socialLinks': socialLinks,
        'appearance.logoUrl': logoUrl,
        'appearance.faviconUrl': faviconUrl,
      });
      showToast('Shop information saved', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-gray-900">Shop Information</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Update your shop details and <span className="text-blue-500">branding</span>
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">

          {/* Shop Visibility */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Shop Visibility</h3>
            <p className="text-[13px] text-blue-500 mb-4">Control whether your shop is publicly accessible</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">Publish Shop</p>
                  <p className="text-[12px] text-gray-500">Your shop is live and accessible to customers</p>
                </div>
              </div>
              <div
                onClick={() => setFormData(p => ({ ...p, isPublished: !p.isPublished }))}
                className={`relative w-11 h-6 rounded-full cursor-pointer transition-all flex-shrink-0 ${formData.isPublished ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${formData.isPublished ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </div>
          </div>

          {/* Shop Details */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-5">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Shop Details</h3>
              <p className="text-[13px] text-blue-500">Update your shop name, description, and logo</p>
            </div>

            {/* Shop Name */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-900">Shop Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Shop Description */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-900">Shop Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                maxLength={1000}
                placeholder="Enter shop description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
              />
              <p className="text-[12px] text-blue-500">{formData.description.length}/1000 characters</p>
            </div>

            {/* PAN/VAT Number */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-900">PAN/VAT Number</label>
              <input
                type="text"
                value={formData.panVat}
                onChange={e => setFormData(p => ({ ...p, panVat: e.target.value }))}
                placeholder="Enter PAN or VAT number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
              <p className="text-[12px] text-blue-500">Enter your business PAN or VAT registration number</p>
            </div>

            {/* Company Address */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-900">Company Address / Location <span className="text-red-500">*</span></label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all resize-none"
              />
              <p className="text-[12px] text-gray-400">This address will be publicly visible to customers</p>
            </div>

            {/* Public Contact Number */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-blue-500">Public Contact Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
              />
              <p className="text-[12px] text-gray-400">This contact number will be publicly visible to customers</p>
            </div>

            {/* Public Email */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-blue-500">Public Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={e => setFormData(p => ({ ...p, contactEmail: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
              />
              <p className="text-[12px] text-gray-400">This email will be publicly visible to customers</p>
            </div>

            {/* Price Unit */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-900">Price Unit</label>
              <div className="relative w-48">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all bg-white appearance-none pr-8"
                >
                  {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-[12px] text-blue-500">Currency unit to display with prices. More currencies will be available soon.</p>
            </div>

            {/* Shop Logo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-medium text-gray-900">Shop Logo</label>
                <div className="flex gap-2">
                  <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-md font-medium uppercase tracking-wider">Upload or Paste Link</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-6">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'logo')}
                  />
                  <div className="w-[180px] h-[160px] border border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-white hover:bg-gray-50 transition-all overflow-hidden group">
                    {uploadingLogo ? (
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    ) : logoUrl ? (
                      <div className="relative w-full h-full">
                        <Image src={logoUrl} alt="Shop Logo" fill className="object-contain p-4" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CloudUpload className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <CloudUpload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Click to Upload</span>
                      </div>
                    )}
                  </div>
                </label>
                
                <div className="flex flex-col justify-center space-y-2">
                  <p className="text-[12px] text-gray-500 font-medium italic">Already have a link? Support by direct link below</p>
                  <input 
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-medium text-gray-900">Favicon</label>
                <div className="flex gap-2">
                  <span className="text-[11px] text-blue-500 bg-blue-50 px-2 py-1 rounded-md font-medium uppercase tracking-wider">Browser Icon</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-6">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'favicon')}
                  />
                  <div className="w-[180px] h-[160px] border border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-white hover:bg-gray-50 transition-all overflow-hidden group">
                    {uploadingFavicon ? (
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    ) : faviconUrl ? (
                      <div className="relative w-full h-full">
                        <Image src={faviconUrl} alt="Favicon" fill className="object-contain p-8" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CloudUpload className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <CloudUpload className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Favicon</span>
                      </div>
                    )}
                  </div>
                </label>
                
                <div className="flex flex-col justify-center space-y-2">
                  <p className="text-[12px] text-gray-500 font-medium italic">Support by direct link below</p>
                  <input 
                    type="url"
                    value={faviconUrl}
                    onChange={e => setFaviconUrl(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-blue-500 transition-all bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-[13px] font-medium text-gray-900">Social Media Links</label>
                  <p className="text-[12px] text-gray-400">Add links to your social media profiles</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSocialLinks(prev => [...prev, { platform: '', url: '' }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Link
                </button>
              </div>

              {socialLinks.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-[13px] text-blue-500">
                    No social media links added. Click &quot;Add Link&quot; to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={e => {
                          const updated = [...socialLinks];
                          updated[idx].platform = e.target.value;
                          setSocialLinks(updated);
                        }}
                        placeholder="Platform"
                        className="w-1/3 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={e => {
                          const updated = [...socialLinks];
                          updated[idx].url = e.target.value;
                          setSocialLinks(updated);
                        }}
                        placeholder="https://..."
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setSocialLinks(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

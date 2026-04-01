'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { CloudUpload, Plus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

interface QuickLink {
  label: string;
  url: string;
}

export default function FooterPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [savingLogo, setSavingLogo] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [logoUrl, setLogoUrl] = useState('');
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    if (!storeId) return;
    const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLogoUrl(data?.website?.footer?.logoUrl || data?.appearance?.logoUrl || '');
        setQuickLinks(data?.website?.footer?.quickLinks || []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [storeId]);

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setLogoUrl(data.url);
      showToast('Logo uploaded', 'success');
    } catch (err: any) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally { setUploadingLogo(false); }
  };

  const handleSaveLogo = async () => {
    setSavingLogo(true);
    try {
      await updateDoc(doc(db, 'stores', storeId), {
        'website.footer.logoUrl': logoUrl,
        updatedAt: new Date(),
      });
      showToast('Logo saved', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSavingLogo(false); }
  };

  const handleSaveLinks = async () => {
    setSavingLinks(true);
    try {
      await updateDoc(doc(db, 'stores', storeId), {
        'website.footer.quickLinks': quickLinks,
        updatedAt: new Date(),
      });
      showToast('Quick links saved', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSavingLinks(false); }
  };

  const addLink = () => setQuickLinks(prev => [...prev, { label: '', url: '' }]);

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...quickLinks];
    updated[index][field] = value;
    setQuickLinks(updated);
  };

  const removeLink = (index: number) => setQuickLinks(prev => prev.filter((_, i) => i !== index));

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
          <h1 className="text-[20px] font-bold text-gray-900">Footer</h1>
          <p className="text-[13px] text-blue-500 mt-0.5">Manage your shop&apos;s footer logo and quick links</p>
        </div>

        {/* Footer Logo Card */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white mb-4">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Footer Logo</h3>
          <p className="text-[13px] text-blue-500 mb-5">Upload a logo to display in your shop&apos;s footer</p>

          <label className="block text-[13px] font-medium text-gray-900 mb-2">Shop Logo</label>

          {/* Upload area */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files && handleLogoUpload(e.target.files[0])}
            />
            <div className="w-[180px] h-[140px] border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 transition-all overflow-hidden">
              {uploadingLogo ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : logoUrl ? (
                <div className="relative w-full h-full">
                  <Image src={logoUrl} alt="Footer Logo" fill className="object-contain p-2" />
                </div>
              ) : (
                <CloudUpload className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
              )}
            </div>
          </label>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleSaveLogo}
              disabled={savingLogo}
              className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
            >
              {savingLogo && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Logo
            </button>
          </div>
        </div>

        {/* Footer Quick Links Card */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Footer Quick Links</h3>
          <p className="text-[13px] text-blue-500 mb-5">Add links to display in your shop&apos;s footer navigation</p>

          {/* Add Link Button */}
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all mb-4"
          >
            <Plus className="h-4 w-4" /> Add Link
          </button>

          {/* Links List */}
          {quickLinks.length > 0 && (
            <div className="space-y-3 mb-4">
              {quickLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={e => updateLink(idx, 'label', e.target.value)}
                    placeholder="Label (e.g. About Us)"
                    className="w-1/3 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => updateLink(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Save Links */}
          <button
            type="button"
            onClick={handleSaveLinks}
            disabled={savingLinks}
            className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
          >
            {savingLinks && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Links
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Check, AlertCircle, Loader2, XCircle, ChevronLeft } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const CNAME_TARGET = 'cname.createvendor.shop';

export default function CustomDomainPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [step, setStep] = useState(1); // 1=Enter, 2=CNAME, 3=Verify
  const [domain, setDomain] = useState('');
  const [currentDomain, setCurrentDomain] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const unsubscribe = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const d = data.customDomain || '';
        const verified = data.domainVerified === true;
        setCurrentDomain(d);
        setDomain(d);
        setIsVerified(verified);
        if (d && verified) setStep(3);
        else if (d) setStep(2);
        else setStep(1);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [storeId]);

  const handleSaveDomain = async () => {
    if (!domain || !domain.includes('.')) return showToast('Enter a valid domain', 'error');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'stores', storeId), {
        customDomain: domain,
        domainVerified: false,
        updatedAt: new Date(),
      });
      setCurrentDomain(domain);
      setIsVerified(false);
      setStep(2);
      showToast('Domain saved. Now point your CNAME.', 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleVerify = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: currentDomain, target: CNAME_TARGET }),
      });
      const data = await res.json();
      if (data.isValid) {
        await updateDoc(doc(db, 'stores', storeId), { domainVerified: true });
        setIsVerified(true);
        showToast('Domain verified!', 'success');
      } else {
        showToast('Not verified yet. DNS may take 5–15 minutes.', 'error');
      }
    } catch { showToast('Check failed. Try again.', 'error'); }
    finally { setChecking(false); }
  };

  const handleRemove = async () => {
    if (!confirm('Remove custom domain?')) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'stores', storeId), { customDomain: '', domainVerified: false });
      setDomain(''); setCurrentDomain(''); setIsVerified(false); setStep(1);
      showToast('Domain removed', 'success');
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const steps = [
    { num: 1, label: 'Enter Your Domain' },
    { num: 2, label: 'Point Your CNAME' },
    { num: 3, label: 'Verify / Remove' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[860px] mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-gray-900">Custom Domain</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Connect your own domain to your shop</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8 gap-0">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5 min-w-[90px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                  step > s.num ? 'bg-[#3b82f6] text-white' :
                  step === s.num ? 'bg-[#3b82f6] text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className={`text-[11px] font-medium text-center leading-tight ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mb-5 mx-1 ${step > s.num ? 'bg-[#3b82f6]' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Enter Domain */}
        {step === 1 && (
          <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Enter Your Domain</h3>
                <p className="text-[12px] text-gray-500">Type your domain name below</p>
              </div>
            </div>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value.toLowerCase().replace(/^https?:\/\/(www\.)?/, ''))}
              placeholder="yourdomain.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            <button
              onClick={handleSaveDomain}
              disabled={saving || !domain}
              className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Next
            </button>
          </div>
        )}

        {/* Step 2: CNAME */}
        {step === 2 && (
          <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Point Your CNAME</h3>
                <p className="text-[12px] text-gray-500">Add this CNAME record at your DNS provider</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-[13px]">
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <p className="text-[11px] text-gray-400 mb-1">Type</p>
                  <p className="font-semibold text-gray-900">CNAME</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <p className="text-[11px] text-gray-400 mb-1">Host / Name</p>
                  <p className="font-semibold text-gray-900">
                    {currentDomain.split('.').length > 2 ? currentDomain.split('.')[0] : '@'}
                  </p>
                </div>
                <div className="border border-blue-100 rounded-lg p-3 bg-blue-50">
                  <p className="text-[11px] text-blue-400 mb-1">Points To</p>
                  <p className="font-semibold text-blue-700 break-all">{CNAME_TARGET}</p>
                </div>
              </div>
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 text-[12px] text-gray-700">
                <strong>Note:</strong> If using Cloudflare, set proxy to <strong>DNS only</strong> (grey cloud).
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600"
              >
                Next: Verify
              </button>
              <button onClick={() => setStep(1)} className="text-[13px] text-gray-500 hover:text-gray-800">
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verify / Remove */}
        {step === 3 && (
          <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Verify / Remove</h3>
                <p className="text-[12px] text-gray-500">Wait for DNS propagation and automatic verification</p>
              </div>
            </div>

            {isVerified ? (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-green-800">Domain Verified</p>
                  <p className="text-[12px] text-green-700 mt-0.5">
                    <strong>{currentDomain}</strong> is successfully connected to your shop.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-700">Verification Pending</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    After adding the DNS records, verification happens automatically.{' '}
                    <span className="text-blue-500">This usually takes 5-15 minutes.</span>{' '}
                    You can check back later or refresh this page.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleVerify}
                disabled={checking}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {checking && <Loader2 className="h-4 w-4 animate-spin" />}
                Check Verification Status
              </button>
              <button
                onClick={handleRemove}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" /> Remove Domain
              </button>
            </div>
          </div>
        )}

        {/* Back button */}
        {step > 1 && (
          <div className="mt-4">
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

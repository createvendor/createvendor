'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AlertTriangle, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PartnerConfig {
  danfeAccessKey: string;
  danfeSecretKey: string;
  danfeActive: boolean;
  pathaoClientId: string;
  pathaoClientSecret: string;
  pathaoUsername: string;
  pathaoPassword: string;
  pathaoActive: boolean;
}

const PATHAO_WEBHOOK_URL = 'https://ilovepdffly.com/api/webhooks/pathao';

export default function DeliveryPartnersPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [config, setConfig] = useState<PartnerConfig>({
    danfeAccessKey: '',
    danfeSecretKey: '',
    danfeActive: false,
    pathaoClientId: '',
    pathaoClientSecret: '',
    pathaoUsername: '',
    pathaoPassword: '',
    pathaoActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingDanfe, setSavingDanfe] = useState(false);
  const [savingPathao, setSavingPathao] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const fetchConfig = async () => {
      try {
        const ref = doc(db, 'deliverySettings', storeId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setConfig(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [storeId]);

  const isDanfeConfigured = config.danfeAccessKey && config.danfeSecretKey;
  const isPathaoConfigured = config.pathaoClientId && config.pathaoClientSecret && config.pathaoUsername && config.pathaoPassword;

  const saveDanfe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDanfe(true);
    try {
      await setDoc(doc(db, 'deliverySettings', storeId), {
        danfeAccessKey: config.danfeAccessKey,
        danfeSecretKey: config.danfeSecretKey,
        danfeActive: config.danfeActive,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast('Danfe Express credentials saved', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSavingDanfe(false); }
  };

  const savePathao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPathao(true);
    try {
      await setDoc(doc(db, 'deliverySettings', storeId), {
        pathaoClientId: config.pathaoClientId,
        pathaoClientSecret: config.pathaoClientSecret,
        pathaoUsername: config.pathaoUsername,
        pathaoPassword: config.pathaoPassword,
        pathaoActive: config.pathaoActive,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast('Pathao Parcel credentials saved', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSavingPathao(false); }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(PATHAO_WEBHOOK_URL);
    showToast('Webhook URL copied!', 'success');
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
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-gray-900">Delivery Partners</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Configure and manage your delivery partners. Only one partner can be <span className="text-blue-500">active</span> at a time.
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-6 border border-blue-200 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] font-semibold text-gray-900">Important Notice</span>
          </div>
          <div className="text-[13px] text-gray-700 space-y-2 pl-6">
            <p><span className="font-semibold">Delivery addresses</span> will be shown based on your active delivery partner to avoid unwanted orders.</p>
            <p>If you <span className="font-semibold">disable all partners</span>, all the district list will be shown.</p>
            <p>Due to platform restrictions, we cannot cross match the address. So be aware before switching to a new platform, as that may result in the location being unavailable in other delivery partner platforms.</p>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Danfe Express */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                {/* Danfe-style icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="8" width="20" height="13" rx="2" fill="#ef4444" opacity="0.2"/>
                  <path d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M12 12l-4 3h8l-4-3z" fill="#ef4444"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Danfe Express</h3>
                <p className={`text-[12px] ${isDanfeConfigured ? 'text-green-600' : 'text-gray-400'}`}>
                  {isDanfeConfigured ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            <form onSubmit={saveDanfe} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Danfe Express Access Key <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={config.danfeAccessKey}
                  onChange={e => setConfig({ ...config, danfeAccessKey: e.target.value })}
                  placeholder="Enter danfe express access key"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Danfe Express Secret Key <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={config.danfeSecretKey}
                  onChange={e => setConfig({ ...config, danfeSecretKey: e.target.value })}
                  placeholder="Enter danfe express secret key"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingDanfe}
                  className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
                >
                  {savingDanfe && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, danfeAccessKey: '', danfeSecretKey: '' })}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Pathao Parcel */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" fill="#ef4444"/>
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#ef4444" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Pathao Parcel</h3>
                <p className={`text-[12px] ${isPathaoConfigured ? 'text-green-600' : 'text-gray-400'}`}>
                  {isPathaoConfigured ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            {/* Webhook notice */}
            <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-gray-50 text-[12px] text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" /> Webhook
              </div>
              <p>Setup url: <a href="https://parcel.pathao.com/courier/developer-api" target="_blank" className="text-blue-500 hover:underline">https://parcel.pathao.com/courier/developer-api</a></p>
              <p>After filling all the information, save it in here &amp; then test the webhook from pathao, if it works then you can use it. Webhook url :</p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={PATHAO_WEBHOOK_URL}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] bg-white outline-none text-gray-600 font-mono"
                />
                <button onClick={copyWebhook} className="flex-shrink-0 p-1.5 hover:text-blue-600 transition-colors text-gray-400">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={savePathao} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Pathao Client ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={config.pathaoClientId}
                  onChange={e => setConfig({ ...config, pathaoClientId: e.target.value })}
                  placeholder="Enter pathao client id"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Pathao Client Secret <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={config.pathaoClientSecret}
                  onChange={e => setConfig({ ...config, pathaoClientSecret: e.target.value })}
                  placeholder="Enter pathao client secret"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Pathao Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={config.pathaoUsername}
                  onChange={e => setConfig({ ...config, pathaoUsername: e.target.value })}
                  placeholder="Enter pathao username"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Pathao Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={config.pathaoPassword}
                  onChange={e => setConfig({ ...config, pathaoPassword: e.target.value })}
                  placeholder="Enter pathao password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingPathao}
                  className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
                >
                  {savingPathao && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, pathaoClientId: '', pathaoClientSecret: '', pathaoUsername: '', pathaoPassword: '' })}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

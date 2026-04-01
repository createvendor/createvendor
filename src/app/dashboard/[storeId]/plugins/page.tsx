'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Puzzle,
  Search,
  Plus,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  BarChart3,
  Eye,
  MessageSquare,
  Phone,
  Power,
  Info,
  CheckCircle2,
  X,
  Zap,
  Monitor,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/context/ToastContext';

interface PluginConfig {
  [key: string]: string;
}

interface PluginData {
  id: string;
  isEnabled: boolean;
  config?: PluginConfig;
}

interface PluginField {
  label: string;
  key: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'textarea';
}

interface PluginCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'Infrastructure' | 'Marketing' | 'Analytics';
  fields: PluginField[];
}

export default function PluginsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [view, setView] = useState<'list' | 'marketplace'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [activePlugins, setActivePlugins] = useState<PluginData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginCard | null>(null);
  const [formConfig, setFormConfig] = useState<PluginConfig>({});

  useEffect(() => {
    if (!storeId) return;
    const unsub = onSnapshot(doc(db, 'stores', storeId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setActivePlugins(data.plugins || []);
      }
      setLoading(false);
    }, (err) => {
      console.error("Plugins onSnapshot error:", err);
      if (err.name !== 'AbortError') {
        showToast('Failed to load plugins', 'error');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [storeId]);

  const marketplacePlugins: PluginCard[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Integration',
      description: 'Add a floating WhatsApp button to your store so customers can chat with you instantly.',
      icon: <Phone className="h-6 w-6" />,
      category: 'Marketing',
      fields: [
        { label: 'WhatsApp Number', key: 'phone', placeholder: 'e.g. 9800000000', required: true },
        { label: 'Welcome Message', key: 'message', placeholder: 'How can we help you today?', required: true }
      ]
    },
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      description: 'Track visitor behavior and optimize your Facebook and Instagram ad campaigns.',
      icon: <Monitor className="h-6 w-6" />,
      category: 'Analytics',
      fields: [
        { label: 'Pixel ID', key: 'pixelId', placeholder: 'Enter your Facebook Pixel ID', required: true }
      ]
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Get deep insights into your store traffic and customer behavior using GA4.',
      icon: <BarChart3 className="h-6 w-6" />,
      category: 'Analytics',
      fields: [
        { label: 'Measurement ID', key: 'measurementId', placeholder: 'G-XXXXXXXXXX', required: true }
      ]
    },
    {
      id: 'microsoft-clarity',
      name: 'Microsoft Clarity',
      description: 'See how users interact with your site through heatmaps and session recordings.',
      icon: <Eye className="h-6 w-6" />,
      category: 'Analytics',
      fields: [
        { label: 'Clarity Project ID', key: 'clarityId', placeholder: 'Enter project ID', required: true }
      ]
    },
    {
      id: 'tawk-to',
      name: 'Tawk.to Live Chat',
      description: 'Provide real-time support to your customers with a free live chat widget.',
      icon: <MessageSquare className="h-6 w-6" />,
      category: 'Marketing',
      fields: [
        { label: 'Property ID', key: 'propertyId', placeholder: 'Find in tawk.to dashboard', required: true },
        { label: 'Widget ID', key: 'widgetId', placeholder: 'e.g. default', required: true }
      ]
    }
  ];

  const handleOpenEnableModal = (plugin: PluginCard) => {
    setSelectedPlugin(plugin);
    const existing = activePlugins.find(p => p.id === plugin.id);
    const initialConfig: PluginConfig = {};
    plugin.fields.forEach(f => {
      initialConfig[f.key] = existing?.config?.[f.key] || '';
    });
    setFormConfig(initialConfig);
    setIsModalOpen(true);
  };

  const handleEnablePlugin = async () => {
    if (!selectedPlugin) return;
    for (const field of selectedPlugin.fields) {
      if (field.required && !formConfig[field.key]) {
        showToast(`${field.label} is required`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const storeRef = doc(db, 'stores', storeId);
      const updatedPlugins = [...activePlugins];
      const idx = updatedPlugins.findIndex(p => p.id === selectedPlugin.id);

      if (idx > -1) {
        updatedPlugins[idx] = { ...updatedPlugins[idx], isEnabled: true, config: formConfig };
      } else {
        updatedPlugins.push({ id: selectedPlugin.id, isEnabled: true, config: formConfig });
      }

      await updateDoc(storeRef, { plugins: updatedPlugins, updatedAt: serverTimestamp() });
      showToast(`${selectedPlugin.name} enabled`, 'success');
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to enable plugin', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDisablePlugin = async (id: string) => {
    if (!confirm('Are you sure you want to disable this plugin?')) return;
    setSaving(true);
    try {
      const storeRef = doc(db, 'stores', storeId);
      const updatedPlugins = activePlugins.map(p =>
        p.id === id ? { ...p, isEnabled: false } : p
      );

      await updateDoc(storeRef, { plugins: updatedPlugins, updatedAt: serverTimestamp() });
      showToast('Plugin disabled', 'success');
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getPluginStatus = (id: string) => {
    return activePlugins.find(p => p.id === id)?.isEnabled || false;
  };

  const filteredMarketplace = marketplacePlugins.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeIntegrations = marketplacePlugins.filter(p => getPluginStatus(p.id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32">
      <div className="max-w-7xl mx-auto">

        {/* Modal */}
        {isModalOpen && selectedPlugin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    {selectedPlugin.icon}
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-900">Setup {selectedPlugin.name}</h2>
                    <p className="text-[12px] text-gray-400 mt-0.5">Configure the plugin for your store</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {selectedPlugin.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formConfig[field.key] || ''}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-medium outline-none focus:border-blue-600 focus:bg-white transition-all resize-none shadow-sm"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={formConfig[field.key] || ''}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[14px] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-8 border-t flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 border rounded-2xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnablePlugin}
                  disabled={saving}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[13px] font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Enable Plugin
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'marketplace' ? (
          <div className="animate-in fade-in duration-500">
            <div className="mb-12 flex items-center gap-6">
              <button
                onClick={() => setView('list')}
                className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center rounded-2xl text-gray-400 hover:text-blue-600 hover:shadow-md transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Plugin Marketplace</h1>
                <p className="text-[13px] text-gray-500 mt-1">Connect third-party tools to extend your storefront capabilities</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] font-medium outline-none focus:border-blue-600 shadow-sm transition-all"
                />
              </div>
              <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100 w-full md:w-auto">
                 {['All', 'Marketing', 'Analytics'].map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all flex-1 md:flex-none ${activeCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                   >
                      {cat}
                   </button>
                 ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMarketplace.map((plugin) => {
                const isEnabled = getPluginStatus(plugin.id);
                return (
                  <div
                    key={plugin.id}
                    className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    <div className="p-8 flex-1">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-blue-600 group-hover:scale-110 transition-transform">
                          {plugin.icon}
                        </div>
                        <div className="min-w-0 pt-1">
                          <h3 className="text-[16px] font-bold text-gray-900 truncate leading-tight group-hover:text-blue-600 transition-colors uppercase">{plugin.name}</h3>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">{plugin.category}</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                        {plugin.description}
                      </p>
                    </div>
                    <div className="p-8 border-t bg-gray-50/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEnableModal(plugin)}
                        className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${isEnabled
                          ? 'bg-white border text-gray-600 hover:border-gray-900'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                          }`}
                      >
                        {isEnabled ? 'Configure' : 'Configure'} <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Plugins</h1>
                <p className="text-[13px] text-gray-500 mt-1">Manage all your active storefront extensions and integrations</p>
              </div>
              <button
                onClick={() => setView('marketplace')}
                className="bg-blue-600 text-white py-4 px-10 rounded-2xl text-[14px] font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Browse Marketplace
              </button>
            </div>

            {activeIntegrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeIntegrations.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="p-8 flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          {plugin.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-tight truncate">{plugin.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500 font-medium leading-relaxed italic line-clamp-2">{plugin.description}</p>
                    </div>
                    <div className="p-8 bg-gray-50/20 border-t flex justify-between gap-3">
                      <button
                        onClick={() => handleOpenEnableModal(plugin)}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-xl py-3 text-[11px] font-bold uppercase tracking-widest hover:border-gray-900 transition-all"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => handleDisablePlugin(plugin.id)}
                        className="w-12 h-12 bg-white border border-gray-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-100 transition-all"
                        title="Disable Plugin"
                      >
                        <Power className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-24 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center mt-4">
                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-8">
                  <Puzzle className="h-10 w-10 text-gray-200" />
                </div>
                <h2 className="text-[18px] font-bold text-gray-900 mb-2">No active plugins</h2>
                <p className="text-gray-500 mb-10 text-[14px] max-w-sm leading-relaxed">
                  Enhance your storefront with analytics, live chat, and marketing tools from our plugin marketplace.
                </p>
                <button
                  onClick={() => setView('marketplace')}
                  className="bg-blue-600 text-white py-4 px-10 rounded-2xl text-[14px] font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Visit Marketplace
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface InstallationPreset {
  id: string;
  name: string;
  cost: number;
  availableCities: string[];
  storeId: string;
  createdAt: any;
}

const NEPAL_DISTRICTS = [
  "Kathmandu Inside Ring Road", "Kathmandu Outside Ring Road", "Lalitpur", "Bhaktapur",
  "Pokhara", "Biratnagar", "Dharan", "Itahari", "Butwal",
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhojpur",
  "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusha", "Dolakha", "Dolpa", "Doti",
  "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kavrepalanchok", "Khotang",
  "Lamjung", "Mahottari", "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi",
  "Nawalpur", "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parsa", "Pyuthan",
  "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum East", "Rukum West", "Rupandehi",
  "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja",
  "Tanahu", "Taplejung", "Terhathum", "Udayapur"
];

export default function InstallationPresetsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [presets, setPresets] = useState<InstallationPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InstallationPreset | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', cost: 0 as any, availableCities: [] as string[] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, 'installationPresets'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as InstallationPreset));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPresets(list);
      setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [storeId]);

  const toggleCity = (city: string) => {
    const current = [...form.availableCities];
    const index = current.indexOf(city);
    if (index > -1) { current.splice(index, 1); } else { current.push(city); }
    setForm({ ...form, availableCities: current });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return showToast('Preset name is required', 'error');
    setSaving(true);
    try {
      const data = { ...form, cost: Number(form.cost) || 0, storeId, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'installationPresets', editing.id), data);
        showToast('Installation preset updated', 'success');
      } else {
        await addDoc(collection(db, 'installationPresets'), { ...data, createdAt: serverTimestamp() });
        showToast('Installation preset created', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this installation preset?')) return;
    try {
      await deleteDoc(doc(db, 'installationPresets', id));
      showToast('Preset deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const openEdit = (p: InstallationPreset) => {
    setEditing(p);
    setForm({ name: p.name, cost: p.cost, availableCities: p.availableCities || [] });
    setShowForm(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-white pb-32">
        <div className="px-6 md:px-8 pt-6 pb-5 max-w-[1200px] mx-auto">
          <h1 className="text-[20px] font-bold text-gray-900">{editing ? 'Edit Installation Preset' : 'Create Installation Preset'}</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Define installation cost and which cities it&apos;s available in</p>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <form onSubmit={handleSave} className="space-y-5">

            {/* Basic Information */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-5">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Basic Information</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Enter the name and cost for <span className="text-blue-500">this</span> installation preset</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Preset Name <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Standard Installation"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-900">Installation Cost (Rs) <span className="text-red-500">*</span></label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.cost}
                  onChange={e => setForm({ ...form, cost: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
                />
                <p className="text-[12px] text-gray-400">Use 0 for free installation. Set a positive value for paid installation.</p>
              </div>
            </div>

            {/* Available Cities */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900">Available Cities <span className="text-red-500">*</span></h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Select the cities where this installation service is offered</p>
              </div>

              <div
                className="border border-gray-200 rounded-lg overflow-y-auto bg-white"
                style={{ maxHeight: '340px', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
              >
                {NEPAL_DISTRICTS.map((city) => (
                  <label
                    key={city}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={form.availableCities.includes(city)}
                      onChange={() => toggleCity(city)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-[13px] ${form.availableCities.includes(city) ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                      {city}
                    </span>
                  </label>
                ))}
              </div>

              {form.availableCities.length > 0 && (
                <p className="text-[12px] text-blue-500 font-medium">{form.availableCities.length} cities selected</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 pb-8">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-blue-600 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Installation Preset'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Installation Presets</h1>
            <p className="text-[13px] text-gray-500 mt-1">Manage installation costs and availability by city</p>
          </div>
          <button
            onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
            className="bg-[#3b82f6] text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
          >
            <Plus className="h-4 w-4" /> Add Installation Preset
          </button>
        </div>

        {presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <p className="text-[14px] text-gray-500 mb-4">No installation presets found</p>
            <button
              onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
              className="bg-[#3b82f6] text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
            >
              <Plus className="h-4 w-4" /> Create Your First Installation Preset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {presets.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-gray-900">{p.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <button onClick={() => openEdit(p)} className="hover:text-blue-600 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">Installation Cost</span>
                    <span className="font-medium text-gray-900">Rs {p.cost}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">Available Cities</span>
                    <span className="font-medium text-blue-600">{p.availableCities?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

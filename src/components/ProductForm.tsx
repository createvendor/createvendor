import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Image as ImageIcon, Trash2, 
  ChevronUp, ChevronDown, Search, ArrowLeft, 
  Save, Globe, Share2, Info, ShoppingBag, Truck, Settings
} from 'lucide-react';
import Image from 'next/image';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  productId?: string;
  storeId?: string;
  onClose: () => void;
  onSave?: (product: any) => void;
}

export default function ProductForm({ productId, storeId, onClose, onSave }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('shipping');
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    images: [],
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    sku: '',
    barcode: '',
    stock: 0,
    inventoryType: 'track',
    category: '',
    status: 'ACTIVE',
    tags: [],
    shipping: {
      weight: 0,
      fee: 'delivery_fee',
      preset: '',
      time: ''
    },
    variants: [],
    variantList: [],
    extraFields: [],
    specifications: [],
    features: {
      title: 'Why shop from us',
      list: []
    },
    seo: {
      title: '',
      description: '',
      handle: ''
    }
  });

  const [newTag, setNewTag] = useState('');

  // Fetch store data for SEO preview
  useEffect(() => {
    if (storeId) {
      // Local MySQL lookup for store (for SEO preview)
      fetch(`/api/stores?id=${storeId}`)
        .then(res => res.json())
        .then(data => { if (!data.error) setStore(data); })
        .catch(() => {});
    }
  }, [storeId]);

  // Fetch product data if editing
  useEffect(() => {
    if (productId && storeId) {
      setLoading(true);
      // Local MySQL lookup for product
      fetch(`/api/products?productId=${productId}&storeId=${storeId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setFormData({ ...formData, ...data, id: productId });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [productId, storeId]);

  const handleSave = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const productData = {
        ...formData,
        id: productId, // If exists, it's an update
        storeId: storeId,
      };

      // ✧ Local Persistence call: Say goodbye to Google Bills!
      const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(productId ? 'Product updated' : 'Product created');
        if (onSave) onSave({ ...productData, id: result.id });
        if (onClose) onClose();
      } else {
        toast.error(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error(error);
      toast.error('Local database connection error');
    } finally {
      setLoading(false);
    }
  };

  const addVariantOption = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: '', values: [] }]
    });
  };

  const removeVariantOption = (index: number) => {
    const next = [...formData.variants];
    next.splice(index, 1);
    setFormData({ ...formData, variants: next });
  };

  const generateVariants = () => {
    if (formData.variants.length === 0) return;
    
    // Simple Cartesian product logic
    let combos: any[] = [{}];
    formData.variants.forEach((opt: any) => {
      if (opt.name && opt.values.length > 0) {
        const nextCombos: any[] = [];
        combos.forEach(combo => {
          opt.values.forEach((val: string) => {
            nextCombos.push({ ...combo, [opt.name]: val });
          });
        });
        combos = nextCombos;
      }
    });

    const newList = combos.map(c => ({
      options: c,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      stock: formData.stock,
      image: null
    }));

    setFormData({ ...formData, variantList: newList });
  };

  const handleTagAdd = (e: any) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = newTag.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData({ ...formData, tags: [...formData.tags, tag] });
      }
      setNewTag('');
    }
  };

  const addExtraField = () => {
    setFormData({
      ...formData,
      extraFields: [...formData.extraFields, { label: '', type: 'text', required: false }]
    });
  };

  const addSpecGroup = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { title: '', fields: [{ title: '', value: '' }] }]
    });
  };

  const addSpecField = (gIdx: number) => {
    const next = [...formData.specifications];
    next[gIdx].fields.push({ title: '', value: '' });
    setFormData({ ...formData, specifications: next });
  };

  const removeSpecGroup = (idx: number) => {
    const next = [...formData.specifications];
    next.splice(idx, 1);
    setFormData({ ...formData, specifications: next });
  };

  const removeSpecField = (gIdx: number, fIdx: number) => {
    const next = [...formData.specifications];
    next[gIdx].fields.splice(fIdx, 1);
    setFormData({ ...formData, specifications: next });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[17px] font-bold text-gray-800">{productId ? 'Edit Product' : 'Add Product'}</h1>
            <p className="text-[12px] text-gray-400">Inventory Management & Store Presence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={loading} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* General Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Info size={16} className="text-blue-500" /> General Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-gray-500">Product Title *</label>
                  <input 
                    placeholder="Short, catchy and descriptive"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 transition-all font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-gray-500">Description</label>
                  <textarea 
                    rows={6}
                    placeholder="Tell your customers more about this product..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] outline-none focus:border-blue-500 transition-all leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-8 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-emerald-500" /> Pricing & Inventory
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[12px] font-medium text-gray-500">Regular Price *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">Rs</span>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-2.5 text-[14px] font-bold outline-none focus:border-emerald-500 bg-emerald-50/10" />
                        </div>
                    </div>
                </div>

                {/* Advanced Configuration Tabs */}
                <div className="flex border-b border-gray-50 overflow-x-auto gap-8 pt-4 no-scrollbar">
                    {[
                        { id: 'shipping', label: 'Shipping', icon: <Truck size={14} /> },
                        { id: 'variants', label: 'Variants', icon: <Settings size={14} /> },
                        { id: 'userinput', label: 'User Input', icon: <Info size={14} /> },
                        { id: 'specifications', label: 'Specs', icon: <Info size={14} /> },
                        { id: 'features', label: 'Features', icon: <Plus size={14} /> },
                        { id: 'seo', label: 'SEO', icon: <Globe size={14} /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-[13px] font-medium flex items-center gap-2 transition-all relative shrink-0 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.icon} {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
                        </button>
                    ))}
                </div>

                <div className="pt-2">
                    {activeTab === 'shipping' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                             <p className="text-[12px] text-gray-400">Set physical attributes and delivery rules</p>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[12px] font-medium text-gray-500">Weight (kg)</label>
                                    <input type="number" value={formData.shipping.weight} onChange={e => setFormData({...formData, shipping: {...formData.shipping, weight: parseFloat(e.target.value)}})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[12px] font-medium text-gray-500">Delivery Time</label>
                                    <input placeholder="2-3 days" value={formData.shipping.time} onChange={e => setFormData({...formData, shipping: {...formData.shipping, time: e.target.value}})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] outline-none" />
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'variants' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-4">
                                {formData.variants.map((v: any, i: number) => (
                                    <div key={i} className="flex gap-3 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <input placeholder="Option (e.g. Size)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none" value={v.name} onChange={e => { const nv = [...formData.variants]; nv[i].name = e.target.value; setFormData({...formData, variants: nv}); }} />
                                        <input placeholder="Values (S, M, L)" className="flex-[2] border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none" value={v.values.join(', ')} onChange={e => { const nv = [...formData.variants]; nv[i].values = e.target.value.split(',').map(s => s.trim()).filter(s => s); setFormData({...formData, variants: nv}); }} />
                                        <button onClick={() => removeVariantOption(i)} className="text-gray-300 hover:text-red-500"><X size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addVariantOption} className="text-[12px] font-bold text-blue-600 flex items-center gap-2 hover:underline"><Plus size={14} /> Add Variant Option</button>
                            </div>
                            <button type="button" onClick={generateVariants} className="bg-blue-50 text-blue-700 px-6 py-2 rounded-lg text-[12px] font-bold hover:bg-blue-600 hover:text-white transition-all">Generate Variant List</button>
                            
                            {formData.variantList.length > 0 && (
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-[12px]">
                                        <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Variant</th>
                                                <th className="px-4 py-3 font-semibold">Price</th>
                                                <th className="px-4 py-3 font-semibold">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {formData.variantList.map((v: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-700">{Object.values(v.options).join(' / ')}</td>
                                                    <td className="px-4 py-3"><input type="number" value={v.price} className="w-20 border border-gray-100 rounded px-2 py-1 outline-none" onChange={e => { const nl = [...formData.variantList]; nl[i].price = parseFloat(e.target.value); setFormData({...formData, variantList: nl}); }}/></td>
                                                    <td className="px-4 py-3"><input type="number" value={v.stock} className="w-20 border border-gray-100 rounded px-2 py-1 outline-none" onChange={e => { const nl = [...formData.variantList]; nl[i].stock = parseInt(e.target.value); setFormData({...formData, variantList: nl}); }}/></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'userinput' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <p className="text-[12px] text-gray-400">Request custom data from customers at checkout</p>
                            <div className="space-y-3">
                                {formData.extraFields.map((f: any, i: number) => (
                                    <div key={i} className="flex gap-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                        <input placeholder="Label" value={f.label} className="flex-1 text-[13px] outline-none" onChange={e => { const nf = [...formData.extraFields]; nf[i].label = e.target.value; setFormData({...formData, extraFields: nf}); }}/>
                                        <select className="text-[12px] bg-gray-50 px-2 rounded" value={f.type} onChange={e => { const nf = [...formData.extraFields]; nf[i].type = e.target.value; setFormData({...formData, extraFields: nf}); }}>
                                            <option value="text">Short Text</option>
                                            <option value="longtext">Long Text</option>
                                            <option value="file">File Upload</option>
                                        </select>
                                        <button onClick={() => { const nf = [...formData.extraFields]; nf.splice(i, 1); setFormData({...formData, extraFields: nf}); }} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addExtraField} className="text-[12px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Add Input Field</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                            {formData.specifications.map((group: any, gIdx: number) => (
                                <div key={gIdx} className="space-y-4 relative group">
                                    <div className="flex items-center gap-3">
                                        <input placeholder="Group Title (e.g. General)" className="bg-transparent text-[14px] font-bold text-gray-800 outline-none border-b border-dashed border-gray-200 focus:border-blue-500" value={group.title} onChange={e => { const ns = [...formData.specifications]; ns[gIdx].title = e.target.value; setFormData({...formData, specifications: ns}); }}/>
                                        <button onClick={() => removeSpecGroup(gIdx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"><X size={14} /></button>
                                    </div>
                                    <div className="space-y-3 pl-4">
                                        {group.fields.map((f: any, fIdx: number) => (
                                            <div key={fIdx} className="flex gap-4">
                                                <input placeholder="Brand" className="flex-1 text-[13px] border-b border-gray-100 outline-none focus:border-blue-400 py-1" value={f.title} onChange={e => { const ns = [...formData.specifications]; ns[gIdx].fields[fIdx].title = e.target.value; setFormData({...formData, specifications: ns}); }}/>
                                                <input placeholder="Apple" className="flex-[2] text-[13px] border-b border-gray-100 outline-none focus:border-blue-400 py-1" value={f.value} onChange={e => { const ns = [...formData.specifications]; ns[gIdx].fields[fIdx].value = e.target.value; setFormData({...formData, specifications: ns}); }}/>
                                                <button onClick={() => removeSpecField(gIdx, fIdx)} className="text-gray-200 outline-none"><X size={14}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addSpecField(gIdx)} className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus size={12} /> Add Field</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addSpecGroup} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-200 flex items-center justify-center gap-2 text-[13px] transition-all"><Plus size={18} /> Add Technical Section</button>
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                             <input placeholder="Section Header" className="w-full font-bold text-[14px] outline-none" value={formData.features.title} onChange={e => setFormData({...formData, features: {...formData.features, title: e.target.value}})} />
                             <div className="space-y-2">
                                {formData.features.list.map((feat: string, i: number) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <input className="flex-1 text-[13px] outline-none" value={feat} onChange={e => { const nl = [...formData.features.list]; nl[i] = e.target.value; setFormData({...formData, features: {...formData.features, list: nl}}); }} placeholder="Awesome feature name..."/>
                                        <button onClick={() => { const nl = [...formData.features.list]; nl.splice(i, 1); setFormData({...formData, features: {...formData.features, list: nl}}); }} className="text-gray-200"><X size={14}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setFormData({...formData, features: {...formData.features, list: [...formData.features.list, '']}})} className="text-[12px] font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Add Selling Point</button>
                             </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[12px] font-medium text-gray-500">Meta Description</label>
                                    <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[13px] outline-none focus:border-blue-500" value={formData.seo.description} onChange={e => setFormData({...formData, seo: {...formData.seo, description: e.target.value}})} />
                                </div>
                                <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100 space-y-2">
                                    <p className="text-[12px] text-emerald-600 font-medium">{store?.subdomain || 'shop'}.createvendor.shop › products</p>
                                    <p className="text-[16px] text-blue-600 hover:underline cursor-pointer">{formData.name || 'Untitled Product'}</p>
                                    <p className="text-[13px] text-gray-500 line-clamp-2">{formData.seo.description || 'Add a meta description to see how your product will appear in global search results.'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-8">
            
            {/* Status & Inventory Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-8 shadow-sm">
                <div className="space-y-2">
                    <h4 className="text-[14px] font-bold text-gray-800">Product Status</h4>
                    <div className="flex p-1 bg-gray-50 rounded-lg border border-gray-100">
                        <button onClick={() => setFormData({...formData, status: 'ACTIVE'})} className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all ${formData.status === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Active</button>
                        <button onClick={() => setFormData({...formData, status: 'DRAFT'})} className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all ${formData.status === 'DRAFT' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>Draft</button>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <h4 className="text-[14px] font-bold text-gray-800">Inventory</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-gray-500">Track quantity</span>
                            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.inventoryType === 'track' ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => setFormData({...formData, inventoryType: formData.inventoryType === 'track' ? 'unlimited' : 'track'})}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.inventoryType === 'track' ? 'left-6' : 'left-1'}`} />
                            </div>
                        </div>
                        {formData.inventoryType === 'track' && (
                            <div className="space-y-1 animate-in zoom-in-95 duration-200">
                                <label className="text-[12px] font-medium text-gray-500">Available Stock</label>
                                <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[14px] outline-none" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Gallery */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-bold text-gray-800">Media Gallery</h4>
                    <span className="text-[11px] text-gray-400">{formData.images.length}/10 images</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((img: string, i: number) => (
                        <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                            <Image src={img} alt="" fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <button onClick={() => { const ni = [...formData.images]; ni.splice(i, 1); setFormData({...formData, images: ni}); }} className="p-2.5 bg-white text-red-500 rounded-full hover:scale-110 transition-transform shadow-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    
                    {formData.images.length < 10 && (
                        <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group active:scale-[0.98]">
                            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-[10px] font-bold mt-2 uppercase tracking-wider">Upload Item</span>
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !storeId) return;
                                    
                                    const payload = new FormData();
                                    payload.append('file', file);
                                    payload.append('storeId', storeId);
                                    
                                    try {
                                        toast.loading('Uploading to server...', { id: 'uploading' });
                                        const res = await fetch('/api/upload', { method: 'POST', body: payload });
                                        const data = await res.json();
                                        
                                        if (data.url) {
                                            setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
                                            toast.success('Upload complete', { id: 'uploading' });
                                        } else {
                                            toast.error(data.error || 'Upload failed', { id: 'uploading' });
                                        }
                                    } catch (err) {
                                        toast.error('Connection error', { id: 'uploading' });
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 leading-tight"><Info size={12} /> Images are securely saved on your primary cPanel host storage.</p>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}

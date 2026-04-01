'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product } from '@/types';
import { Plus, Pencil, Trash2, Search, ExternalLink, Box, Filter, Download, Upload } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'products'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const productsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      productsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProducts(productsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  useEffect(() => {
    let result = products;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s));
    }
    setFiltered(result);
  }, [search, products]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleting(productId);
    try {
      await deleteDoc(doc(db, 'products', productId));
      showToast('Product successfully removed', 'success');
    } catch (error) {
      showToast('Failed to delete product', 'error');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
           <div>
              <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Products</h1>
              <p className="text-[13px] text-gray-500 mt-1">Manage your products and inventory</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                onClick={() => showToast('Excel Import coming soon', 'info')}
              >
                 <Upload className="h-4 w-4 text-gray-500" /> Import from Excel
              </button>
              <button 
                onClick={() => router.push(`/dashboard/${storeId}/products/new`)}
                className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
              >
                 <Plus className="h-4 w-4" /> Add Product
              </button>
           </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[600px] flex flex-col p-6">
           
           <div className="mb-4">
             <h2 className="text-[15px] font-semibold text-gray-900">All Products</h2>
             <p className="text-[13px] text-gray-500 mt-1">{filtered.length} products found</p>
           </div>

           {/* Filters & Search */}
           <div className="flex flex-col gap-3 mb-6">
              <div className="relative w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input 
                   type="text"
                   placeholder="Search products by name, or description..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all"
                 />
              </div>
              <div>
                <button className="bg-white border border-gray-200 px-4 py-1.5 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 w-max">
                   <Filter className="h-4 w-4 text-gray-500" /> Filters & Sort
                </button>
              </div>
           </div>

           {filtered.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-4 text-gray-500">
                   <Box className="h-12 w-12" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">No products found</h3>
                <p className="text-[13px] text-gray-500 mb-6">Get started by creating your first product</p>
                <button 
                  onClick={() => router.push(`/dashboard/${storeId}/products/new`)}
                  className="bg-[#3b82f6] text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-[13px]"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                   <thead>
                      <tr className="border-b border-gray-200">
                         <th className="px-4 py-3 font-medium text-gray-500">Image</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Product Name</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Inventory</th>
                         <th className="px-4 py-3 font-medium text-gray-500">Price</th>
                         <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filtered.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                              {product.images?.[0] ? (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                              ) : (
                                <Box className="h-5 w-5 m-auto text-gray-300 absolute inset-0" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex px-2 py-1 rounded text-[11px] font-medium ${
                              (product.status || 'DRAFT') === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                              (product.status || 'DRAFT') === 'ARCHIVED' ? 'bg-gray-100 text-gray-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {product.status || 'DRAFT'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                             <span className={`${Number(product.stock) === 0 ? 'text-red-500' : Number(product.stock) < 5 ? 'text-amber-500' : 'text-gray-900'}`}>{product.stock || 0} in stock</span>
                          </td>
                          <td className="px-4 py-3">
                            Rs {product.price?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <button
                                onClick={() => window.open(`/store/${storeId}/p/${product.id}`, '_blank')}
                                className="hover:text-gray-900 transition-colors"
                                title="View live storefront"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/dashboard/${storeId}/products/${product.id}`)}
                                className="hover:text-blue-600 transition-colors"
                                title="Edit product"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deleting === product.id}
                                className="hover:text-red-500 transition-colors disabled:opacity-30"
                                title="Delete product"
                              >
                                {deleting === product.id ? <div className="h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

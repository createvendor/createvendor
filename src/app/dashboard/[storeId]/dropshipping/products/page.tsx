'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Info, Search, Filter, Package } from 'lucide-react';

interface DropshipProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  storeId: string;
  isDropship?: boolean;
}

export default function DropshippingPage() {
  const params = useParams();
  const storeId = params?.storeId as string;

  const [products, setProducts] = useState<DropshipProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!storeId) return;
    // Fetch products marked as available for dropshipping from other stores
    const q = query(
      collection(db, 'products'),
      where('availableForDropship', '==', true)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DropshipProduct));
      setProducts(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [storeId]);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-[20px] font-bold text-gray-900">Dropshipping</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Browse and sell products from other sellers</p>
        </div>

        {/* How It Works */}
        <div className="mb-4 border border-blue-200 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] font-semibold text-gray-900">How Dropshipping Works</span>
          </div>
          <p className="text-[13px] text-gray-700 pl-6 mb-3">
            Browse products from verified sellers and add them to your shop. When customers order, the product ships directly from the original seller. You set your own price and keep the{' '}
            <span className="text-blue-500">difference</span>.
          </p>
          <div className="ml-6 border border-blue-200 rounded-lg p-3 bg-white text-[13px] text-gray-700">
            <p className="font-medium">Want to sell your products to resellers?</p>
            <p className="mt-0.5">
              If you want to list your own products and let others sell them, you need to enroll as a dropshipper vendor. Please check the{' '}
              <a href="#" className="text-blue-500 hover:underline">help center</a>{' '}
              for more information.{' '}
              <a href="#" className="text-blue-500 font-medium hover:underline">Enroll now</a>
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-4 border border-gray-200 rounded-xl p-5 bg-white">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Search &amp; Filter</h3>
          <p className="text-[13px] text-gray-500 mb-4">Find products available for dropshipping</p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
            <Filter className="h-4 w-4" /> Filters &amp; Sort
          </button>
        </div>

        {/* Products */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-gray-300 mb-4" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-gray-700 mb-1">No products found</p>
              <p className="text-[13px] text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {filtered.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-all">
                  <div className="aspect-video bg-gray-100">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-1 line-clamp-1">{p.name}</h4>
                    <p className="text-[12px] text-gray-500 mb-2 line-clamp-2">{p.description}</p>
                    <p className="text-[14px] font-bold text-gray-900">Rs {p.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

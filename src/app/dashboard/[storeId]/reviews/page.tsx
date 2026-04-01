'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Review, Product } from '@/types';
import { 
  Star, 
  MessageSquare, 
  Trash2, 
  Search, 
  Package, 
  Clock, 
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ReviewsPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!storeId) return;

    const fetchProducts = async () => {
       const pq = query(collection(db, 'products'), where('storeId', '==', storeId));
       const psnap = await getDocs(pq);
       const pmap: Record<string, Product> = {};
       psnap.docs.forEach(d => {
          pmap[d.id] = { id: d.id, ...d.data() } as Product;
       });
       setProducts(pmap);
    };
    fetchProducts();

    const q = query(collection(db, 'reviews'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReviews(list);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  useEffect(() => {
    let result = reviews;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(s) || 
        r.comment.toLowerCase().includes(s) ||
        products[r.productId]?.name?.toLowerCase().includes(s)
      );
    }
    if (statusFilter === 'pending') result = result.filter(r => !r.isApproved);
    else if (statusFilter === 'approved') result = result.filter(r => r.isApproved);
    setFiltered(result);
  }, [search, reviews, statusFilter, products]);

  const handleToggleApprove = async (review: Review) => {
    if (!review.id) return;
    try {
      await updateDoc(doc(db, 'reviews', review.id), { isApproved: !review.isApproved });
      showToast(review.isApproved ? 'Review hidden' : 'Review approved', 'success');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      showToast('Review removed', 'success');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 md:p-12 font-sans pb-32">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
           <div>
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Product Reviews</h1>
              <p className="text-[13px] text-gray-500 mt-1">Moderate customer feedback and ratings</p>
           </div>
           <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${statusFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${statusFilter === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('approved')}
                className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${statusFilter === 'approved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Approved
              </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
               <h2 className="text-[24px] font-black text-gray-900">{reviews.length}</h2>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Approved</p>
               <h2 className="text-[24px] font-black text-emerald-600">{reviews.filter(r => r.isApproved).length}</h2>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
               <div className="flex items-center gap-2">
                  <h2 className="text-[24px] font-black text-gray-900">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0}</h2>
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</p>
               <h2 className="text-[24px] font-black text-amber-600">{reviews.filter(r => !r.isApproved).length}</h2>
            </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input 
             type="text"
             placeholder="Search reviews..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-[14px] font-medium outline-none focus:border-blue-600 shadow-sm transition-all"
           />
        </div>

        {/* Review List */}
        <div className="space-y-6">
           {filtered.length === 0 ? (
             <div className="bg-white rounded-[2.5rem] p-24 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
                   <MessageSquare className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-500 text-[14px] max-w-xs mx-auto">New customer feedback will appear here for your moderation.</p>
             </div>
           ) : (
             filtered.map((review) => (
                <div key={review.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 hover:shadow-md transition-all">
                   <div className="flex flex-col lg:flex-row gap-8">
                      {/* Product & Rating */}
                      <div className="lg:w-60 flex-shrink-0">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                               {products[review.productId]?.images?.[0] ? <img src={products[review.productId].images[0]} className="w-full h-full object-cover" /> : <Package className="h-5 w-5 text-gray-300" />}
                            </div>
                            <div className="min-w-0">
                               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Product</p>
                               <p className="text-[13px] font-bold text-gray-900 truncate">{products[review.productId]?.name || 'Unknown Item'}</p>
                            </div>
                         </div>
                         <div className="bg-gray-50 rounded-2xl p-4 border border-gray-50">
                            <div className="flex items-center gap-1 mb-1">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                               ))}
                            </div>
                            <p className="text-[14px] font-black">{review.rating} Stars</p>
                         </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                                  {review.name.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="text-[15px] font-bold text-gray-900">{review.name}</h4>
                                  <p className="text-[11px] text-gray-400 flex items-center gap-1 font-medium"><Clock className="h-3 w-3" /> {review.createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                               </div>
                            </div>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${review.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                               {review.isApproved ? 'Approved' : 'Pending'}
                            </span>
                         </div>
                         <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50 mb-6">
                            <p className="text-[14px] text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleApprove(review)}
                              className={`px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${review.isApproved ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'}`}
                            >
                               {review.isApproved ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                               {review.isApproved ? 'Unapprove' : 'Approve Review'}
                            </button>
                            <button 
                              onClick={() => handleDelete(review.id!)}
                              className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}

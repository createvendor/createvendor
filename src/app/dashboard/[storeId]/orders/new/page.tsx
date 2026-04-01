'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Search, ArrowLeft, Maximize, UserPlus, FileText, Package, CreditCard, Check } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

export default function CreateOrderPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;
    const { showToast } = useToast();

    const [storeName, setStoreName] = useState('Store');
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Cart state
    const [cart, setCart] = useState<any[]>([]);
    const [delivery, setDelivery] = useState('0.00');
    const [discount, setDiscount] = useState('0');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!storeId) return;
        const fetchData = async () => {
            try {
                const storeDoc = await getDoc(doc(db, 'stores', storeId));
                if (storeDoc.exists()) setStoreName(storeDoc.data().name || 'Store');

                const q = query(collection(db, 'products'), where('storeId', '==', storeId));
                const snap = await getDocs(q);
                setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [storeId]);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1, price: product.price || 0 }]);
        }
    };

    const toggleFullscreen = () => {
         if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
              console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
         } else {
            if (document.exitFullscreen) {
               document.exitFullscreen();
            }
         }
    };

    const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const total = subtotal + parseFloat(delivery || '0') - parseFloat(discount || '0');

    const handleCompletePayment = async () => {
        if (cart.length === 0) return showToast('Cart is empty', 'warning');
        setSaving(true);
        try {
            const orderData = {
                storeId,
                status: 'DELIVERED', // Since it's POS, assumed delivered
                paymentMethod,
                totalAmount: total,
                subtotal,
                deliveryFee: parseFloat(delivery || '0'),
                discount: parseFloat(discount || '0'),
                items: cart,
                createdAt: serverTimestamp(),
                customerInfo: { name: 'Walk-in Customer' }, // Default
                orderType: 'pos'
            };
            await addDoc(collection(db, 'orders'), orderData);
            showToast('Order completed successfully', 'success');
            setCart([]);
            setDelivery('0.00');
            setDiscount('0');
        } catch (error) {
            showToast('Error completing order', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
       return <div className="min-h-screen bg-white" />;
    }

    return (
        <div className="flex bg-white h-screen overflow-hidden text-[13px] font-sans">
            {/* Main POS Interface (Left) */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
                {/* Top Nav */}
                <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <button onClick={() => router.push(`/dashboard/${storeId}/orders`)} className="p-1 hover:bg-gray-100 rounded-full transition-all">
                          <ArrowLeft className="h-4 w-4 text-gray-700" />
                       </button>
                       <span className="font-semibold text-[14px] text-gray-900">{storeName}</span>
                    </div>
                    <button onClick={toggleFullscreen} className="p-1.5 hover:bg-gray-100 rounded-full transition-all text-gray-500">
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 bg-white overflow-y-auto p-4 custom-scrollbar">
                    {filteredProducts.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-[13px] font-medium">
                            No products found
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredProducts.map(p => (
                                <div key={p.id} onClick={() => addToCart(p)} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all bg-white flex flex-col items-center group">
                                    <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden relative">
                                        {p.images?.[0] ? (
                                            <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <Package className="h-8 w-8 m-auto text-gray-300 absolute inset-0" />
                                        )}
                                    </div>
                                    <h4 className="font-medium text-[12px] text-gray-900 line-clamp-1 text-center w-full">{p.name}</h4>
                                    <p className="text-[12px] text-gray-500 mt-0.5">Rs {p.price}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar (Right) */}
            <div className="w-[320px] bg-white flex flex-col h-full flex-shrink-0">
                <div className="p-4 border-b border-gray-200">
                    <button className="w-full py-2 px-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-[13px] font-medium">
                        <UserPlus className="h-4 w-4 text-gray-400" /> Add Customer
                    </button>
                </div>
                
                <div className="p-4 pb-3 flex items-center gap-2 text-gray-900 border-b border-gray-100">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-[13px]">Current Order</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="text-[13px] font-medium">No items in cart</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start border-b border-gray-100 pb-3">
                                    <div className="flex-1 pr-2">
                                        <h5 className="font-medium text-gray-900 text-[12px] leading-tight">{(item as any).name}</h5>
                                        <p className="text-gray-500 text-[11px] mt-1">Rs {item.price} x {item.quantity}</p>
                                    </div>
                                    <span className="font-semibold text-gray-900 text-[12px]">Rs {parseFloat(item.price) * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-200 bg-white">
                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="text-[12px]">Sub-total</span>
                            <span className="font-medium text-[12px]">Rs {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="text-[12px]">Delivery</span>
                            <span className="font-medium text-[12px]">
                                Rs <input 
                                   type="number"
                                   className="w-12 text-right outline-none bg-transparent"
                                   value={delivery}
                                   onChange={(e) => setDelivery(e.target.value)}
                                />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span className="text-[12px]">Discount</span>
                            <span className="font-medium flex items-center gap-1 justify-end">
                                <input 
                                   type="number"
                                   className="w-14 border border-gray-200 rounded px-1.5 py-0.5 text-right outline-none focus:border-blue-400 text-[12px]"
                                   value={discount}
                                   onChange={(e) => setDiscount(e.target.value)}
                                />
                                <span className="text-[11px] text-gray-400">Rs</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span className="font-semibold text-[14px] text-gray-900">Total</span>
                            <span className="font-bold text-[14px] text-gray-900">Rs {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-4">
                       <span className="text-[12px] font-medium text-gray-900 mb-2 block">Payment Method</span>
                       <button className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-[12px]">
                          <CreditCard className="h-4 w-4 text-gray-400" /> Cash
                       </button>
                    </div>

                    <button 
                       onClick={handleCompletePayment}
                       disabled={saving}
                       className="w-full bg-[#87aeea] text-white py-3 rounded-lg flex justify-center items-center gap-2 transition-all font-medium disabled:opacity-50 text-[13px]"
                       style={{ backgroundColor: '#87aeea' }}
                    >
                       {saving ? <Check className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />} Complete Payment
                    </button>
                </div>
            </div>
            
            {/* Global styles for hiding scrollbar visually but keeping it functional, per modern POS designs */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function CartDrawer() {
    const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, cartTotal } = useCart();
    const params = useParams();
    const storeId = params?.storeId as string;
    const [store, setStore] = React.useState<any>(null);

    React.useEffect(() => {
        if (storeId) {
            getDoc(doc(db, 'stores', storeId)).then(snap => {
                if (snap.exists()) setStore(snap.data());
            });
        }
    }, [storeId]);

    const currency = store?.settings?.currency || 'Rs';

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[110] flex flex-col shadow-2xl transform transition-transform duration-500 ease-out translate-x-0 font-sans">
                <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight">Your Bag</h2>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{items.length} Modules Registered</p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="h-8 w-8 border border-gray-100 rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition-all"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <ShoppingBag className="h-10 w-10 text-gray-200" />
                            <div className="space-y-1">
                                <p className="font-bold text-lg uppercase tracking-tight">Inventory Empty</p>
                                <p className="text-xs text-gray-400 italic">No modules registered in current session.</p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-80 transition-all font-mono"
                            >
                                Re-enter Store
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item, idx) => {
                                const variantKey = item.selectedVariants 
                                    ? Object.entries(item.selectedVariants).map(([k, v]) => `${k}:${v}`).join('|')
                                    : 'no-variant';
                                const uniqueKey = `${item.product.id}-${variantKey}-${idx}`;

                                return (
                                    <div key={uniqueKey} className="flex gap-4 group">
                                        <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 transition-transform group-hover:scale-105">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col pt-1">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {item.product.name}
                                                    </h4>
                                                    {item.selectedVariants && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(item.selectedVariants).map(([name, value]) => (
                                                                <span key={name} className="px-2 py-0.5 bg-gray-50 text-[8px] text-gray-400 font-bold uppercase tracking-widest rounded-sm border border-gray-100">
                                                                    {name}: <span className="text-gray-600">{value}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.product.id, item.selectedVariants)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg overflow-hidden p-0.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariants)}
                                                        className="h-7 w-7 text-gray-400 hover:text-gray-900 hover:bg-white rounded transition-all flex items-center justify-center"
                                                    >
                                                        <Minus className="h-2.5 w-2.5" />
                                                    </button>
                                                    <span className="w-6 text-center font-bold text-[10px]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariants)}
                                                        disabled={item.quantity >= item.product.stock}
                                                        className="h-7 w-7 text-gray-400 hover:text-gray-900 hover:bg-white rounded transition-all disabled:opacity-30 flex items-center justify-center"
                                                    >
                                                        <Plus className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-gray-950 text-base tracking-tighter">
                                                    {currency} {((item.product.price || 0) * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 bg-white border-t space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <span>Logistic Fees</span>
                                <span className="text-emerald-500 font-medium tracking-normal">Calculated @ Checkout</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold uppercase tracking-tight">Gross Subtotal</span>
                                <span className="text-2xl font-bold text-gray-950 tracking-tighter">
                                    {currency} {cartTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/store/${storeId}/checkout`}
                            onClick={() => setIsCartOpen(false)}
                            className="w-full h-14 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all flex items-center justify-center group font-mono"
                        >
                            Commit To Purchase
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

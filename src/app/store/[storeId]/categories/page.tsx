'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useStoreContext } from '@/context/StoreContext';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store } from '@/types';
import { ChevronLeft, LayoutGrid, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
    const params = useParams();
    const storeId = params?.storeId as string;

    const { store, categories, loading } = useStoreContext();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!store) return notFound();

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b sticky top-0 bg-white z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/store/${storeId}`} className="flex items-center text-gray-600 hover:text-black font-medium transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Link>
                    <span className="text-sm font-black uppercase tracking-widest">{store.name}</span>
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="mb-12 text-center">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LayoutGrid className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Official Categories</h1>
                    <p className="text-gray-500 mt-2 font-medium">Explore our collection by category</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={`/store/${storeId}/categories/${cat.id}`}
                            className="group relative overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100 aspect-video flex flex-col items-center justify-center hover:bg-gray-950 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200"
                        >
                            <span className="text-2xl font-black text-gray-900 group-hover:text-white uppercase transition-all duration-500 tracking-tighter sm:text-3xl">{cat.name}</span>
                            <div className="mt-2 h-[1px] w-8 bg-gray-200 group-hover:bg-white/30 transition-all duration-500" />
                            <span className="mt-4 text-[10px] font-black text-gray-400 group-hover:text-white/50 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500">View Products &rarr;</span>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

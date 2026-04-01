'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store } from '@/types';
import { ChevronLeft, FileText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function StoreContentPage() {
    const params = useParams();
    const storeId = params?.storeId as string;
    const slug = params?.slug as string;

    const [store, setStore] = useState<Store | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const SLUG_LABELS: Record<string, string> = {
        'about': 'About Us',
        'faq': 'Frequently Asked Questions',
        'privacy': 'Privacy Policy',
        'terms': 'Terms & Conditions',
        'return': 'Return Policy',
        'refund': 'Refund Policy',
    };

    useEffect(() => {
        const fetch = async () => {
            if (!storeId || !slug) return;
            try {
                const storeSnap = await getDoc(doc(db, 'stores', storeId));
                if (storeSnap.exists()) setStore({ id: storeSnap.id, ...storeSnap.data() } as Store);
                
                const contentSnap = await getDoc(doc(db, 'storeContent', `${storeId}_${slug}`));
                if (contentSnap.exists()) setContent(contentSnap.data().content);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetch();
    }, [storeId, slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!store || !content) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
            <Link href={`/store/${storeId}`} className="text-blue-600 hover:underline">Back to Store</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b sticky top-0 bg-white z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/store/${storeId}`} className="flex items-center text-gray-600 hover:text-black font-medium transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Link>
                    <span className="text-sm font-black uppercase tracking-widest">{store.name}</span>
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                <div className="mb-10 text-center">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter sm:text-5xl">{SLUG_LABELS[slug] || slug}</h1>
                </div>
                
                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4 whitespace-pre-wrap font-sans text-lg">
                    {content}
                </div>
            </main>

            <footer className="border-t py-12 mt-12 bg-gray-50/50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">&copy; {new Date().getFullYear()} {store.name}. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

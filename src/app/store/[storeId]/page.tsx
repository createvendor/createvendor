'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useStoreContext } from '@/context/StoreContext';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store, Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, Menu, Heart, Star, LayoutGrid, List, Facebook, Instagram, PackageX, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PluginManager } from '@/components/storefront/PluginManager';
import { TemplateRenderer } from '@/components/storefront/TemplateRenderer';

export default function StoreFront() {
    const params = useParams();
    const storeId = params?.storeId as string;
    const { items, setIsCartOpen, addItem } = useCart();

    const { store, products, categories, brands, branches, loading, error } = useStoreContext();

    useEffect(() => {
        if (storeId) {
            // Affiliate Tracking
            const urlParams = new URLSearchParams(window.location.search);
            const affiliateCode = urlParams.get('affiliateCode');
            if (affiliateCode) {
                localStorage.setItem(`aff_code_${storeId}`, affiliateCode);
            }

            // Track Page View
            try {
                const isMobile = /Mobi|Android/i.test(navigator.userAgent);
                addDoc(collection(db, 'page_views'), {
                    storeId,
                    referrer: document.referrer || 'Direct',
                    device: isMobile ? 'Mobile' : 'Desktop',
                    userAgent: navigator.userAgent,
                    createdAt: serverTimestamp()
                });
            } catch (err) { console.error("Tracking Error:", err); }
        }
    }, [storeId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Store Not Found'}</h1>
                <p className="text-gray-500">The store you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    if (store.isPublished === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
                <PackageX className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Store Unavailable</h1>
                <p className="text-gray-500 font-medium">This store is currently not taking visitors.</p>
            </div>
        );
    }

    // Determine active template
    const templateId = store.settings?.template || store.template || 'default';

    return (
        <TemplateRenderer 
            templateId={templateId}
            store={store}
            products={products}
            categories={categories}
            brands={brands}
            branches={branches}
            content={{}}
            activePageId="home"
        />
    );
}

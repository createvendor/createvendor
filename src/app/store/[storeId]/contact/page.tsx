'use client';
 
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStoreContext } from '@/context/StoreContext';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store, Product } from '@/types';
import { PackageX, Loader2 } from 'lucide-react';
import { TemplateRenderer } from '@/components/storefront/TemplateRenderer';
 
export default function ContactPage() {
    const params = useParams();
    const storeId = params?.storeId as string;
 
    const { store, products, categories, brands, branches, content, loading, error } = useStoreContext();
 
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
 
    if (error || !store) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Store Not Found'}</h1>
            </div>
        );
    }
 
    const templateId = store.settings?.template || store.template || 'default';
 
    return (
        <TemplateRenderer 
            templateId={templateId}
            store={store}
            products={products}
            categories={categories}
            brands={brands}
            branches={branches}
            content={content}
            activePageId="contact"
        />
    );
}

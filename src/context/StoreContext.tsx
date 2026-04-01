'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store, Product } from '@/types';

interface StoreContextType {
    store: Store | null;
    products: Product[];
    categories: any[];
    brands: any[];
    branches: any[];
    content: Record<string, string>;
    loading: boolean;
    error: string | null;
}

const StoreContext = createContext<StoreContextType>({
    store: null,
    products: [],
    categories: [],
    brands: [],
    branches: [],
    content: {},
    loading: true,
    error: null,
});

export const StoreProvider = ({ children, storeId }: { children: React.ReactNode; storeId: string }) => {
    const [store, setStore] = useState<Store | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [content, setContent] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            if (!storeId) {
                setLoading(false);
                return;
            }
            try {
                // Fetch Store
                const storeRef = doc(db, 'stores', storeId);
                const storeSnap = await getDoc(storeRef);

                if (!storeSnap.exists()) {
                    setError('Store not found.');
                    setLoading(false);
                    return;
                }
                const storeData = { id: storeSnap.id, ...storeSnap.data() } as Store;
                setStore(storeData);

                // Run all other queries in parallel
                const sections = ['footer', 'privacy', 'terms', 'return', 'refund', 'faq', 'about'];
                const contentPromises = sections.map(async (sec) => {
                    const snap = await getDoc(doc(db, 'storeContent', `${storeId}_${sec}`));
                    return { key: sec, value: snap.exists() ? snap.data().content : '' };
                });

                const catQuery = query(collection(db, 'categories'), where('storeId', '==', storeId));
                const brandQuery = query(collection(db, 'brands'), where('storeId', '==', storeId));
                const branchQuery = query(collection(db, 'branches'), where('storeId', '==', storeId));
                const productsQuery = query(
                    collection(db, 'products'),
                    where('storeId', '==', storeId),
                    where('status', 'in', ['active', 'ACTIVE'])
                );

                const [
                    contentResults,
                    catSnap,
                    brandSnap,
                    branchSnap,
                    productsSnap
                ] = await Promise.all([
                    Promise.all(contentPromises),
                    getDocs(catQuery),
                    getDocs(brandQuery),
                    getDocs(branchQuery),
                    getDocs(productsQuery)
                ]);

                const contentMap: Record<string, string> = {};
                contentResults.forEach(res => contentMap[res.key] = res.value);
                setContent(contentMap);

                setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setBrands(brandSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setBranches(branchSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
            } catch (err: any) {
                console.error("Error fetching storefront Context:", err);
                setError("Failed to load store.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [storeId]);

    return (
        <StoreContext.Provider value={{ store, products, categories, brands, branches, content, loading, error }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStoreContext = () => useContext(StoreContext);

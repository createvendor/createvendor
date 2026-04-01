import { Metadata } from 'next';
import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import React from 'react';

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ storeId: string }> 
}): Promise<Metadata> {
    const { storeId } = await params;
    
    try {
        const storeSnap = await getDoc(doc(db, 'stores', storeId));
        if (storeSnap.exists()) {
            const data = storeSnap.data();
            const favicon = (data.appearance as any)?.faviconUrl;
            
            return {
                title: data.name || 'Store',
                description: data.description || 'Welcome to our store',
                icons: {
                    icon: favicon || '/favicon.ico',
                    apple: favicon || '/apple-icon.png',
                }
            };
        }
    } catch (error) {
        console.error('Metadata generation error:', error);
    }
    
    return {
        title: 'Store',
        icons: {
            icon: '/favicon.ico',
        }
    };
}

import { StoreProvider } from '@/context/StoreContext';

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ storeId: string }>;
}) {
    const { storeId } = await params;
    return (
        <StoreProvider storeId={storeId}>
            <CartProvider>
                <div className="relative min-h-screen">
                    {children}
                    <CartDrawer />
                </div>
            </CartProvider>
        </StoreProvider>
    );
}

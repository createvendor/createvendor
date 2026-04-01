'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function StorePlaceholderPage() {
    const params = useParams();
    const storeId = params?.storeId as string;
    const section = window.location.pathname.split('/').pop() || 'Feature';

    return (
        <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🚧</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-4 capitalize">{section}</h1>
            <p className="text-[15px] text-muted-foreground mb-8">
                This section for store <strong>{storeId}</strong> is still under construction.
            </p>
            <div className="p-6 bg-white border rounded-2xl shadow-sm text-left w-full max-w-md">
                <h3 className="font-bold text-lg mb-2">Coming Soon</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        Advanced data visualization
                    </li>
                    <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        Management tools
                    </li>
                    <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        Export & reporting features
                    </li>
                </ul>
            </div>
        </div>
    );
}

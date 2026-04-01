'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
    const router = useRouter();
    const { user, storeId, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in, go to login
                router.push('/login');
            } else if (user.email === 'bishalmishra9000@gmail.com') {
                router.push('/admin');
            } else if (storeId) {
                // Has a store, go to their dashboard
                router.push(`/dashboard/${storeId}`);
            } else {
                // Logged in but no store, maybe onboarding?
                router.push('/onboarding');
            }
        }
    }, [user, storeId, loading, router]);

    return null; // Silent redirect
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { FileText, Loader2, Save } from 'lucide-react';

const PAGES = [
    { key: 'footer', label: 'Footer Content', placeholder: 'Enter your footer content, links, or copyright text…' },
    { key: 'privacy', label: 'Privacy Policy', placeholder: 'We value your privacy. This Privacy Policy explains how we collect, use, and protect your information…' },
    { key: 'terms', label: 'Terms & Conditions', placeholder: 'By accessing and using this website, you agree to be bound by these Terms and Conditions…' },
    { key: 'return', label: 'Return Policy', placeholder: 'We want you to be satisfied. Here is our return policy…' },
    { key: 'refund', label: 'Refund Policy', placeholder: 'Refund requests are processed within 5-7 business days…' },
    { key: 'faq', label: 'FAQ', placeholder: 'Q: How do I place an order?\nA: Simply add items to your cart and proceed to checkout…' },
];

export default function WebsiteContentPage() {
    const params = useParams();
    const storeId = params?.storeId as string;
    const section = (params as any)?.section || 'footer';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [content, setContent] = useState('');

    const page = PAGES.find(p => p.key === section) || PAGES[0];

    useEffect(() => {
        const fetch = async () => {
            if (!storeId) return;
            try {
                const snap = await getDoc(doc(db, 'storeContent', `${storeId}_${section}`));
                if (snap.exists()) setContent(snap.data().content || '');
                else setContent('');
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetch();
        setLoading(true);
        setContent('');
        fetch();
    }, [storeId, section]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, 'storeContent', `${storeId}_${section}`), {
                content,
                storeId,
                section,
                updatedAt: new Date()
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) { alert(err.message); } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/30 p-6 md:p-8">
            <div className="max-w-[900px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center"><FileText className="h-6 w-6 mr-2 text-primary" /> {page.label}</h1>
                    <p className="text-sm text-gray-500 mt-1">This content will be displayed on your store's {page.label.toLowerCase()} page.</p>
                </div>

                {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 border border-emerald-200 font-medium">✓ {page.label} saved!</div>}

                <form onSubmit={handleSave}>
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                        <textarea
                            rows={20}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder={page.placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/20 font-sans leading-relaxed"
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="submit" disabled={saving} className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center shadow-md">
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save {page.label}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

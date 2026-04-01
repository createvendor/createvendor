'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store } from '@/types';
import { BookOpen, Calendar, ChevronLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  shortDescription?: string;
  coverImage: string;
  createdAt: any;
}

export default function BlogListingPage() {
    const params = useParams();
    const storeId = params?.storeId as string;

    const [store, setStore] = useState<Store | null>(null);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!storeId) return;
            try {
                const storeSnap = await getDoc(doc(db, 'stores', storeId));
                if (storeSnap.exists()) setStore({ id: storeSnap.id, ...storeSnap.data() } as Store);
                
                const q = query(collection(db, 'blogPosts'), where('storeId', '==', storeId), where('isPublished', '==', true));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
                data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setPosts(data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetch();
    }, [storeId]);

    const formatDate = (ts: any) => {
        if (!ts) return '';
        const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!store) return <div className="p-20 text-center">Store not found</div>;

    return (
        <div className="min-h-screen bg-gray-50/30">
            <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/store/${storeId}`} className="flex items-center text-gray-500 hover:text-black font-medium transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Link>
                    <span className="text-sm font-black uppercase tracking-widest">{store.name} BLOG</span>
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-20">
                    <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter sm:text-7xl mb-6">The Journal</h1>
                    <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto italic">Stories, updates and insights from {store.name}.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.length === 0 ? (
                        <div className="col-span-full py-32 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50 bg-white rounded-3xl border-2 border-dashed border-gray-100 italic">No articles published yet.</div>
                    ) : (
                        posts.map((post) => (
                            <Link 
                                key={post.id} 
                                href={`/store/${storeId}/blog/${post.id}`}
                                className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 hover:-translate-y-2 h-full"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    {post.coverImage ? (
                                        <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200"><BookOpen className="h-12 w-12" /></div>
                                    )}
                                </div>
                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <Calendar className="h-3 w-3" /> {formatDate(post.createdAt)}
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight mb-4 tracking-tighter">{post.title}</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed line-clamp-3 mb-8">{post.shortDescription || post.excerpt}</p>
                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-950 group-hover:underline underline-offset-4">Read Article &rarr;</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Store } from '@/types';
import { ChevronLeft, Calendar, User, Share2, Facebook, Twitter, Link as LinkIcon, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  createdAt: any;
  author?: string;
}

export default function BlogDetailPage() {
    const params = useParams();
    const storeId = params?.storeId as string;
    const postId = params?.id as string;

    const [store, setStore] = useState<Store | null>(null);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!storeId || !postId) return;
            try {
                const storeSnap = await getDoc(doc(db, 'stores', storeId));
                if (storeSnap.exists()) setStore({ id: storeSnap.id, ...storeSnap.data() } as Store);
                
                const postSnap = await getDoc(doc(db, 'blogPosts', postId));
                if (postSnap.exists()) setPost(postSnap.data() as BlogPost);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetch();
    }, [storeId, postId]);

    const formatDate = (ts: any) => {
        if (!ts) return '';
        const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!store || !post) return notFound();

    return (
        <article className="min-h-screen bg-white font-sans selection:bg-gray-900 selection:text-white pb-32">
            <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/store/${storeId}/blog`} className="flex items-center text-gray-400 hover:text-black font-medium transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Newsroom
                    </Link>
                    <span className="text-sm font-black uppercase tracking-widest">{store.name}</span>
                    <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 pt-20">
                <div className="mb-12 text-center flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-6 py-2 rounded-full border border-gray-100 italic transition-all shadow-sm">
                        <Calendar className="h-3 w-3" /> {formatDate(post.createdAt)}
                    </div>
                    <h1 className="text-4xl font-black text-gray-950 uppercase tracking-tighter sm:text-7xl leading-[1.1] mb-10 max-w-4xl mx-auto">{post.title}</h1>
                    <div className="h-1 w-20 bg-gray-900 rounded-full mb-10 opacity-10"></div>
                </div>
                
                {post.coverImage && (
                    <div className="relative w-full aspect-video rounded-[3.5rem] overflow-hidden mb-20 shadow-2xl border border-gray-100 bg-gray-50 group hover:scale-[1.01] transition-all duration-1000 cursor-zoom-in">
                        <Image src={post.coverImage} alt="Article Header" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />
                    </div>
                )}

                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Share & Meta Sidebar */}
                    <div className="lg:col-span-1 hidden lg:block sticky top-32 h-fit">
                        <div className="flex flex-col gap-6 text-gray-300">
                           <button className="hover:text-black transition-colors p-3 bg-gray-50 rounded-2xl hover:bg-white shadow-sm border-transparent hover:border-gray-100 border"><Facebook className="h-5 w-5" /></button>
                           <button className="hover:text-black transition-colors p-3 bg-gray-50 rounded-2xl hover:bg-white shadow-sm border-transparent hover:border-gray-100 border"><Twitter className="h-5 w-5" /></button>
                           <button className="hover:text-black transition-colors p-3 bg-gray-50 rounded-2xl hover:bg-white shadow-sm border-transparent hover:border-gray-100 border"><LinkIcon className="h-5 w-5" /></button>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="lg:col-span-11 max-w-2xl mx-auto lg:mx-0">
                        <div className="prose prose-stone prose-xl max-w-none text-gray-700 leading-relaxed font-sans font-medium whitespace-pre-wrap selection-bg-black selection:text-white first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-gray-900 tracking-tight">
                            {post.content}
                        </div>
                        
                        <div className="mt-20 pt-16 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 bg-gray-50/50 p-12 rounded-[3.5rem] border border-gray-100">
                             <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-200 text-xl font-black italic shadow-inner">{post.author?.charAt(0) || 'A'}</div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Authored By</p>
                                    <h3 className="text-lg font-black text-gray-950 uppercase tracking-tighter">{post.author || 'Editorial Team'}</h3>
                                </div>
                             </div>
                             <Link href={`/store/${storeId}/blog`} className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] hover:underline underline-offset-8 transition-all">Back to newsroom &rarr;</Link>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

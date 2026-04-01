'use client';

import React from 'react';
import { Store, Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowUpRight, Instagram, Facebook, Twitter, Search, Heart, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PluginManager } from '@/components/storefront/PluginManager';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface TemplateProps {
  store: Store;
  products: Product[];
  categories: any[];
  brands: any[];
  branches: any[];
}

export default function FashionHubTemplate({ store, products, categories, brands, branches }: TemplateProps) {
    const { items, setIsCartOpen, addItem } = useCart();
    const storeId = store.id;

    return (
        <div className="min-h-screen bg-[#fff1f2] text-[#1e1b1b] selection:bg-[#fb7185] selection:text-white font-sans">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400;700;900&family=Playfair+Display:ital,wght@1,400&display=swap');
                body { font-family: 'Montserrat', sans-serif; }
                .font-editorial { font-family: 'Playfair Display', serif; }
                .text-stroke { -webkit-text-stroke: 1px #1e1b1b; color: transparent; }
                .fashion-card-shadow { box-shadow: 20px 20px 0px #fb7185; }
            `}</style>
            
            <PluginManager plugins={store.plugins} />

            {/* Fashion Header */}
            <motion.header 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 h-24 bg-transparent z-[100] px-8 md:px-16 flex items-center justify-between"
            >
                <div className="flex items-center gap-16">
                     <Link href={`/store/${storeId}`} className="text-3xl font-black tracking-tighter uppercase leading-none">
                        {store.name}
                    </Link>
                    <nav className="hidden lg:flex items-center gap-10">
                        {categories.slice(0, 4).map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 * i }}
                            >
                                <Link href={`/store/${storeId}/categories/${cat.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#fb7185] transition-colors">
                                    {cat.name}
                                </Link>
                            </motion.div>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-10">
                     <div className="hidden md:flex gap-8 group">
                         <Instagram size={20} className="hover:text-[#fb7185] transition-colors cursor-pointer" />
                         <Facebook size={20} className="hover:text-[#fb7185] transition-colors cursor-pointer" />
                     </div>
                     <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(true)} 
                        className="relative h-14 w-14 bg-[#1e1b1b] text-white flex items-center justify-center rounded-full"
                    >
                        <ShoppingBag size={20} />
                        {items.length > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 h-5 w-5 bg-[#fb7185] text-white text-[10px] font-black rounded-full flex items-center justify-center"
                            >
                                {items.length}
                            </motion.span>
                        )}
                    </motion.button>
                </div>
            </motion.header>

            {/* Asymmetrical Hero */}
            <div className="relative pt-40 px-8 md:px-16 lg:h-screen flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-12 relative">
                         <motion.h2 
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="text-[12vw] font-black leading-[0.8] uppercase tracking-tighter relative z-10 select-none"
                        >
                            SEASONAL <br/> <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-stroke">VIBES</motion.span> {store.name}
                         </motion.h2>
                         <motion.div 
                            initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 3 }}
                            transition={{ delay: 0.5, duration: 1.2 }}
                            className="absolute top-0 right-0 w-1/3 aspect-[3/4] hidden lg:block"
                        >
                             {store.appearance?.bannerUrl ? (
                                <Image src={store.appearance.bannerUrl} alt="Hero" fill className="object-cover rounded-[5rem] rotate-3 fashion-card-shadow" />
                             ) : (
                                <div className="w-full h-full bg-[#fb7185] rounded-[5rem] rotate-3 fashion-card-shadow shadow-black/10 shadow-2xl" />
                             )}
                         </motion.div>
                    </div>
                </div>
                
                <div className="mt-20 flex flex-col md:flex-row items-end justify-between gap-10">
                     <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-2xl md:text-3xl font-editorial font-light italic max-w-2xl leading-relaxed"
                    >
                        "{store.description || "The intersection of street style and high-end couture. Curated for the modern disruptor."}"
                     </motion.p>
                     <motion.button 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                        onClick={() => document.getElementById('runway')?.scrollIntoView({ behavior: 'smooth' })}
                        className="h-20 px-12 bg-[#fb7185] text-white text-xs font-black uppercase tracking-widest flex items-center gap-6 group hover:translate-x-2 transition-transform shadow-2xl shadow-[#fb7185]/40"
                    >
                        Enter The Runway <ArrowUpRight size={20} />
                    </motion.button>
                </div>
            </div>

            {/* Section: Trending Runway */}
            <main id="runway" className="px-8 md:px-16 py-40 bg-white">
                <div className="flex items-center gap-10 mb-32 overflow-hidden border-y-2 border-black/5 py-10">
                    <motion.div 
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-10 whitespace-nowrap"
                    >
                        <div className="text-[10vw] font-black text-stroke select-none uppercase">TRENDING_RUNWAY_COLLECTION_2026 //</div>
                        <div className="text-[10vw] font-black select-none uppercase">NEW_ARRIVALS //</div>
                        <div className="text-[10vw] font-black text-stroke select-none uppercase">TRENDING_RUNWAY_COLLECTION_2026 //</div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-40 gap-x-20">
                    {products.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (idx % 3) * 0.1 }}
                            className={`flex flex-col ${idx % 2 === 1 ? 'lg:mt-32' : ''}`}
                        >
                            <Link href={`/store/${storeId}/products/${p.id}`} className="group relative flex flex-col">
                                <div className="relative aspect-[3/4] overflow-hidden bg-[#fff1f2] grayscale group-hover:grayscale-0 transition-all duration-700 rounded-3xl">
                                    <Image src={p.images?.[0] || ''} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-[#fb7185]/10 mix-blend-multiply opacity-50" />
                                    <div className="absolute bottom-10 right-10 flex flex-col gap-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100 z-10">
                                         <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(p, 1); }} className="h-14 w-14 bg-white text-[#1e1b1b] rounded-full flex items-center justify-center hover:bg-[#fb7185] hover:text-white transition-all shadow-xl"><Plus size={20} /></motion.button>
                                         <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => e.preventDefault()} className="h-14 w-14 bg-white text-[#1e1b1b] rounded-full flex items-center justify-center hover:bg-[#fb7185] hover:text-white transition-all shadow-xl"><Heart size={20} /></motion.button>
                                    </div>
                                </div>
                                <div className="mt-12 space-y-4 px-4">
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-30">
                                        <span>LOOK_{idx + 1}</span>
                                        <div className="h-px flex-1 bg-black/10" />
                                    </div>
                                    <h4 className="text-4xl font-black uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform">{p.name}</h4>
                                    <p className="text-2xl font-editorial font-light italic text-[#fb7185]">{store.settings?.currency || 'Rs'} {p.price.toLocaleString()}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Fashion Footer */}
            <footer className="bg-[#1e1b1b] text-white pt-40 pb-20 px-8 md:px-16 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-40">
                    <div className="space-y-12">
                        <h4 className="text-[15vw] font-black text-white/5 leading-[0.8] uppercase tracking-tighter select-none">{store.name}</h4>
                        <div className="space-y-6">
                            <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30">Our Mission</p>
                            <p className="text-xl font-editorial italic max-w-sm leading-relaxed text-white/70">Redefining the silhouettes of tomorrow through the collective consciousness of today.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-end space-y-20">
                        <div className="grid grid-cols-2 gap-20 text-xs font-black uppercase tracking-widest">
                             <div className="space-y-6">
                                <p className="opacity-30 tracking-[0.4em]">Connect</p>
                                <div className="flex flex-col gap-4">
                                     <Link href="#" className="hover:text-[#fb7185] transition-colors">Instagram</Link>
                                     <Link href="#" className="hover:text-[#fb7185] transition-colors">Twitter</Link>
                                     <Link href="#" className="hover:text-[#fb7185] transition-colors">TikTok</Link>
                                </div>
                             </div>
                             <div className="space-y-6">
                                <p className="opacity-30 tracking-[0.4em]">Contact</p>
                                <div className="flex flex-col gap-4">
                                     <p className="text-white/50">{store.contactEmail || 'studio@fashion.co'}</p>
                                     <p className="text-white/50">{store.address || 'Berlin // Sector 04'}</p>
                                </div>
                             </div>
                        </div>
                        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">&copy; 2026 {store.name} // POWERED_BY_CREATEVENDOR</p>
                            <div className="flex gap-10 opacity-10 font-black italic text-[10px]">
                                <span>MC</span> <span>VISA</span> <span>AE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

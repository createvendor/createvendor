'use client';

import React from 'react';
import { Store, Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, PackageX, MapPin, Phone, Mail, Facebook, Instagram, Globe, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PluginManager } from '@/components/storefront/PluginManager';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateProps {
  store: Store;
  products: Product[];
  categories: any[];
  brands: any[];
  branches: any[];
  content: Record<string, string>;
}

export default function DefaultTemplate({ store, products, categories, brands, branches, content }: TemplateProps) {
    const { items, setIsCartOpen, addItem } = useCart();
    const storeId = store.id;

    const primaryColor = store.appearance?.primaryColor || '#6366f1';
    const textOverPrimary = store.appearance?.textOverPrimaryColor || '#FFFFFF';
    const borderRadius = store.appearance?.borderRadius === 'none' ? '0' :
        store.appearance?.borderRadius === 'rounded-xl' ? '1.5rem' :
            store.appearance?.borderRadius === 'rounded-full' ? '9999px' : '0.75rem';
    const fontFamily = store.appearance?.fontFamily || 'Inter';

    const featuredProducts = products.filter(p => p.isFeatured);
    const regularProducts = products.filter(p => !p.isFeatured);

    return (
        <div
            className="min-h-screen transition-colors duration-500"
            style={{
                backgroundColor: store.appearance?.backgroundColor || '#f9fafb',
                ['--primary' as any]: primaryColor,
                ['--primary-text' as any]: textOverPrimary,
                fontFamily: `${fontFamily}, sans-serif`
            }}
        >
             <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700;800;900&family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap');
            `}</style>
            <PluginManager plugins={store.plugins} />

            {/* Store Header */}
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/95 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm border-gray-100"
            >
                <div className="w-full px-4 sm:px-12 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href={`/store/${storeId}`} className="flex items-center space-x-2 group">
                            {store.appearance?.logoUrl ? (
                                <Image src={store.appearance.logoUrl} alt={store.name} width={40} height={40} className="object-contain" />
                            ) : (
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="h-10 w-10 flex items-center justify-center bg-gray-950 text-white font-black italic rounded-xl shadow-lg"
                                >
                                    {store.name.charAt(0).toUpperCase()}
                                </motion.div>
                            )}
                            <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase hidden sm:block group-hover:tracking-wider transition-all duration-300">{store.name}</h1>
                        </Link>
                        <nav className="hidden lg:flex items-center space-x-4 ml-8 border-l border-gray-100 pl-8">
                             {categories.slice(0, 6).map((cat, i) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                >
                                    <Link href={`/store/${storeId}/categories/${cat.id}`} className="text-[11px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-all">
                                        {cat.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCartOpen(true)} 
                            className="relative p-3 bg-gray-50 text-gray-900 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <AnimatePresence>
                                {items.length > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 h-5 w-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        {items.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </nav>
                </div>
            </motion.header>

            {/* Hero Section */}
            <div className="relative overflow-hidden min-h-[60vh] flex items-center justify-center px-6">
                <motion.div 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-gray-900"
                >
                    {store.appearance?.bannerUrl ? (
                        <Image src={store.appearance.bannerUrl} alt="Banner" fill className="object-cover brightness-[0.7] opacity-90" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-pink-500 opacity-80" />
                    )}
                </motion.div>
                <div className="max-w-4xl mx-auto space-y-8 relative z-10 text-center">
                    <motion.span 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full border border-white/20"
                    >
                        Official Store
                    </motion.span>
                    <motion.h2 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl uppercase"
                    >
                        {store.name}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-xl text-white/90 max-w-2xl mx-auto italic"
                    >
                        {store.description || "Premium quality retail experience."}
                    </motion.p>
                    <motion.button 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} 
                        className="bg-white text-black px-12 py-6 rounded-full font-black uppercase tracking-widest transition-all shadow-2xl"
                    >
                        Shop Now
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <main id="products" className="max-w-[1400px] mx-auto px-6 sm:px-12 py-24 space-y-32">
                {featuredProducts.length > 0 && (
                    <section>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-16 border-b pb-10 flex items-end justify-between"
                        >
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 uppercase">Featured</h3>
                                <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mt-2">Handpicked for you</p>
                            </div>
                        </motion.div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {featuredProducts.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i % 4) * 0.1 }}
                                >
                                    <ProductItem p={p} store={store} addItem={addItem} />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 border-b pb-10 flex items-end justify-between"
                    >
                        <h3 className="text-4xl font-black text-gray-900 uppercase">Our Collection</h3>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {products.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 4) * 0.1 }}
                            >
                                <ProductItem p={p} store={store} addItem={addItem} />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t py-20 px-6 sm:px-12">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link href={`/store/${storeId}`} className="flex items-center space-x-2">
                             {store.appearance?.logoUrl ? (
                                <Image src={store.appearance.logoUrl} alt={store.name} width={32} height={32} className="object-contain" unoptimized />
                            ) : (
                                <div className="h-8 w-8 flex items-center justify-center bg-gray-950 text-white font-black italic rounded-lg text-xs">
                                    {store.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="font-black text-sm uppercase tracking-tighter">{store.name}</span>
                        </Link>
                        {content.footer ? (
                            <div className="text-[12px] text-gray-500 max-w-sm whitespace-pre-wrap leading-relaxed">{content.footer}</div>
                        ) : (
                            <p className="text-[10px] font-black text-gray-400 lowercase tracking-[0.2em]">&copy; {new Date().getFullYear()} POWERED BY CREATE VENDOR</p>
                        )}
                        {content.footer && <p className="text-[9px] font-black text-gray-300 lowercase tracking-[0.2em] mt-2">&copy; {new Date().getFullYear()} POWERED BY CREATE VENDOR</p>}
                    </div>

                    {/* Social Links */}
                    {store.settings?.socialLinks && store.settings.socialLinks.length > 0 && (
                        <div className="flex items-center gap-6">
                            {store.settings.socialLinks.map((link: any, i: number) => {
                                const platform = link.platform.toLowerCase();
                                return (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                                        {platform.includes('facebook') ? <Facebook className="h-5 w-5" /> :
                                         platform.includes('instagram') ? <Instagram className="h-5 w-5" /> :
                                         platform.includes('phone') ? <Phone className="h-5 w-5" /> :
                                         platform.includes('mail') || platform.includes('email') ? <Mail className="h-5 w-5" /> :
                                         <Globe className="h-5 w-5" />}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}

function ProductItem({ p, store, addItem }: { p: Product, store: Store, addItem: any }) {
    const currency = store.settings?.currency || 'Rs';
    return (
        <Link href={`/store/${store.id}/products/${p.id}`} className="group relative flex flex-col h-full">
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 transition-all duration-700 group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-gray-200">
                {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="h-full w-full bg-gray-100 flex items-center justify-center"><ShoppingBag className="h-10 w-10 text-gray-200" /></div>}
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(p, 1); }} 
                    className="absolute bottom-6 right-6 bg-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-gray-950 hover:text-white"
                >
                    <Plus className="h-6 w-6" />
                </motion.button>
            </div>
            <div className="mt-6 px-2">
                <h4 className="font-black text-gray-900 uppercase tracking-tighter truncate group-hover:text-primary transition-colors">{p.name}</h4>
                <p className="text-xl font-black text-gray-900 mt-2">{currency} {p.price?.toLocaleString()}</p>
            </div>
        </Link>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Store, Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Instagram, Facebook, Layout, Image as ImageIcon, ChevronRight, Mail, Search, X, CheckCircle2, MapPin, Smartphone, RefreshCw, Send, Check, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { PluginManager } from '@/components/storefront/PluginManager';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface TemplateProps {
    store: Store;
    products: Product[];
    categories: any[];
    brands: any[];
    branches: any[];
    activePageId?: 'home' | 'checkout' | 'search' | 'contact' | 'product_detail';
}

// Testimonial Carousel Section Component
const TestimonialCarousel = ({ testimonials, speed = 15 }: { testimonials: any[], speed?: number }) => {
    const list = [...testimonials, ...testimonials, ...testimonials]; // Triple for infinite effect

    if (!testimonials.length) return null;

    return (
        <div className="w-full relative overflow-hidden py-4 px-1">
            {/* Smooth Edge Fades */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none hidden md:block" />

            <motion.div
                key={speed + testimonials.length} // Restart on speed or count change
                className="flex gap-6"
                animate={{
                    x: ["0%", "-33.333%"], // Move by exactly one full list length (tripled)
                }}
                transition={{
                    duration: testimonials.length * (31 - speed) * 0.4, // Faster speed for the shorter distance
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{ width: "max-content" }}
            >
                {list.map((t, i) => (
                    <div
                        key={i}
                        className="w-[260px] md:w-[310px] shrink-0 bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 flex flex-col group cursor-grab active:cursor-grabbing"
                    >
                        <div className="relative h-44 w-full">
                            <Image src={t.image || 'https://via.placeholder.com/100'} alt={t.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" unoptimized />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 px-2 py-1 rounded-lg text-[9px] font-black border border-white shadow-sm">
                                [{t.rating || 5}]
                            </div>
                        </div>
                        <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                            <p className="text-[12px] font-semibold text-gray-400 leading-relaxed italic tracking-tight">"{t.quote}"</p>
                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-bold text-gray-950 tracking-tight">{t.name}</h4>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t.role || 'VERIFIED BUYER'}</p>
                                </div>
                                <span className="text-[8px] font-black text-gray-200 uppercase tracking-widest">{t.date || 'FEB 2026'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// Internal Countdown Logic Component
const CountdownTimer = ({ targetDate, targetTime, theme = 'light' }: { targetDate: string, targetTime: string, theme?: 'light' | 'dark' }) => {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const calculate = () => {
            const localTarget = targetDate && targetTime ? `${targetDate}T${targetTime}:00` : targetDate ? `${targetDate}T00:00:00` : null;
            if (!localTarget) return { d: 0, h: 0, m: 0, s: 0 };

            const target = new Date(localTarget);
            const now = new Date();
            const diff = target.getTime() - now.getTime();

            if (isNaN(target.getTime()) || diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };

            return {
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                m: Math.floor((diff / 1000 / 60) % 60),
                s: Math.floor((diff / 1000) % 60)
            };
        };

        setTimeLeft(calculate());
        const timer = setInterval(() => {
            setTimeLeft(calculate());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, targetTime]);

    if (!timeLeft) return null;

    const isDark = theme === 'dark';

    return (
        <div className="flex gap-4">
            {[
                { val: timeLeft.d, lbl: 'Days' },
                { val: timeLeft.h, lbl: 'Hours' },
                { val: timeLeft.m, lbl: 'Minutes' },
                { val: timeLeft.s, lbl: 'Seconds' }
            ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center justify-center min-w-[60px] md:min-w-[70px] h-[70px] md:h-[80px] rounded-xl shadow-sm border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                    <span className={`text-[20px] md:text-[24px] font-semibold leading-none ${isDark ? 'text-white' : 'text-gray-800'}`}>{String(item.val).padStart(2, '0')}</span>
                    <span className={`text-[8px] md:text-[9px] font-medium uppercase tracking-widest mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.lbl}</span>
                </div>
            ))}
        </div>
    );
};

// Dedicated Countdown 3 Component to safely manage hooks
const Countdown3Renderer = ({ block, storeId }: { block: any, storeId: string }) => {
    const [activeImg, setActiveImg] = useState(0);
    const images = [block.settings.image1, block.settings.image2].filter(Boolean);

    useEffect(() => {
        if (images.length < 2) return;
        const interval = setInterval(() => {
            setActiveImg(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="w-full bg-black border-y border-gray-800 py-16 md:py-24 px-6 md:px-20 lg:px-32 flex items-center justify-center overflow-hidden">
            <div className="w-full relative flex flex-col md:flex-row items-center gap-16 md:gap-24">
                <div className="w-full md:w-1/2 flex flex-col space-y-10 z-10">
                    {block.settings.badge && (
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] w-10 bg-gray-600" />
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.4em]">{block.settings.badge}</span>
                        </div>
                    )}
                    <div className="space-y-6">
                        <h2 className="text-[38px] md:text-[54px] lg:text-[64px] font-semibold text-white leading-[1.05] tracking-tight max-w-2xl">{block.settings.title}</h2>
                        <p className="text-gray-400 text-[15px] md:text-[17px] italic font-medium leading-relaxed max-w-lg opacity-80">{block.settings.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <CountdownTimer targetDate={block.settings.date} targetTime={block.settings.time} theme="dark" />
                    </div>

                    <div className="pt-4">
                        <Link href={block.settings.buttonUrl || '#'}>
                            <button className="bg-white text-black px-12 py-5 rounded-none text-[13px] font-semibold uppercase tracking-widest hover:bg-gray-100 transition-all border border-white min-w-[200px]">
                                {block.settings.buttonText}
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="w-full md:w-1/2 relative h-[350px] md:h-[550px] lg:h-[650px] flex items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={activeImg}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {images[activeImg] && <Image src={images[activeImg]} alt={`Slide ${activeImg + 1}`} fill className="object-contain" unoptimized />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Elite Insights Slider Component (Local State for Live Site)
const InsightsSlider = ({ block, updateBlockSetting }: { block: any, updateBlockSetting?: (id: string, key: string, val: any) => void }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const testimonials = block.settings.testimonials || [];
    const len = testimonials.length;

    if (!len) return null;

    return (
        <div className="bg-black py-10 md:py-16 px-6 md:px-20 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
                {/* Text Content */}
                <div className="w-full md:w-1/2 space-y-10 md:space-y-16 relative z-10">
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-5xl lg:text-5xl text-white font-medium italic tracking-tight">{block.settings.title || 'Authentic Insights'}</h2>
                        <p className="text-gray-500 text-[12px] md:text-[13px] font-medium tracking-widest uppercase">{block.settings.subtitle || 'OUR BLOGS'}</p>
                    </div>

                    <div className="min-h-[180px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                <p className="text-[20px] md:text-[28px] text-white font-medium leading-[1.3] tracking-tighter">
                                    "{testimonials[activeIdx]?.quote || 'No quote available.'}"
                                </p>
                                <div className="pt-6 border-t border-white/10">
                                    <h4 className="text-white text-[15px] md:text-[18px] font-bold">{testimonials[activeIdx]?.name || 'John Doe'}</h4>
                                    <p className="text-gray-500 text-[11px] md:text-[13px] uppercase tracking-widest font-bold mt-1">{testimonials[activeIdx]?.role || 'VERIFIED BUYER'}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Simple Arrows */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => setActiveIdx((activeIdx - 1 + len) % len)}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
                        >
                            <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={() => setActiveIdx((activeIdx + 1) % len)}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
                        >
                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Image Content */}
                <div className="w-full md:w-1/2 relative">
                    <div className="aspect-square w-full max-w-[500px] mx-auto relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIdx}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                <Image src={testimonials[activeIdx]?.image || 'https://via.placeholder.com/800'} alt="Insight" fill className="object-cover" unoptimized />
                                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function VisualTemplate({ store, products, categories, activePageId, updateBlockSetting }: TemplateProps & { updateBlockSetting?: (id: string, key: string, val: any) => void }) {
    const { items, setIsCartOpen, cartTotal, clearCart } = useCart();
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [activeHero39Bg, setActiveHero39Bg] = useState<string>('https://i.ibb.co/932pzNhm/fourth.png');
    const [activeCard9, setActiveCard9] = useState<number | null>(null);

    // Checkout States
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [submittingCheckout, setSubmittingCheckout] = useState(false);
    const [checkoutOrderId, setCheckoutOrderId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [formData, setFormData] = useState({
        email: '', firstName: '', lastName: '', address: '', city: '', state: '', zipCode: '', phone: '',
    });

    // Contact States
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSent, setContactSent] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '', email: '', subject: '', message: ''
    });

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
            alert('Please fill in all required fields');
            return;
        }
        setContactLoading(true);
        try {
            await addDoc(collection(db, 'contactMessages'), {
                ...contactForm,
                storeId,
                isRead: false,
                status: 'PENDING',
                createdAt: serverTimestamp()
            });
            setContactSent(true);
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Error submitting contact form:", error);
            alert('Failed to send message. Please try again.');
        } finally {
            setContactLoading(false);
        }
    };

    const storeId = store.id;
    const layoutKey = activePageId === 'home' || !activePageId ? 'visualLayout' : `visualLayout_${activePageId}`;
    let blocks = (store as any)[layoutKey] || [];
    // SMART FILTER: Isolate page-specific components
    if (activePageId !== 'checkout') {
        blocks = blocks.filter((b: any) => b.type !== 'checkout_1');
    }

    if (blocks.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-300 font-medium text-xs tracking-widest gap-2">
                <span>VISUAL ENGINE READY</span>
                <span className="text-[10px] opacity-50 uppercase">Page: {activePageId || 'Home'}</span>
                <span className="text-[10px] opacity-50 uppercase">Key: {layoutKey}</span>
                <span className="text-[10px] opacity-50 uppercase">Blocks Found: {blocks.length}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-blue-500 selection:text-white font-sans antialiased text-gray-900 overflow-x-hidden">
            <PluginManager plugins={store.plugins} />

            {/* Clean Professional Header */}
            <nav className="h-16 flex items-center justify-between px-8 md:px-12 bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-50">
                <Link href={`/store/${storeId}`} className="flex items-center gap-6">
                    <div className="h-8 w-8 relative shrink-0">
                        {store.appearance?.logoUrl ? (
                            <Image src={store.appearance.logoUrl} alt={store.name} fill className="object-contain" unoptimized />
                        ) : (
                            <div className="h-full w-full bg-black text-white flex items-center justify-center font-bold text-[10px] rounded-lg">
                                {store.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="text-[13px] font-bold tracking-tight uppercase leading-none">{store.name}</span>
                </Link>

                <div className="hidden lg:flex items-center gap-10">
                    {[
                        { label: 'Home', path: '' },
                        { label: 'Shop', path: '/shop' },
                        { label: 'Brands', path: '/brands' },
                        { label: 'Contact', path: '/contact' }
                    ].map(item => (
                        <Link key={item.label} href={`/store/${storeId}${item.path}`} className={`text-[11px] font-semibold uppercase tracking-[0.1em] transition-all ${activePageId === item.label.toLowerCase() ? 'text-black border-b border-black pb-0.5' : 'text-gray-400 hover:text-black'}`}>
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Search size={18} className="text-gray-400 cursor-pointer" />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsCartOpen(true)}
                        className="relative group p-2 rounded-full hover:bg-gray-50 transition-all"
                    >
                        <ShoppingBag size={18} strokeWidth={1.5} className="text-gray-400 group-hover:text-black" />
                        {items.length > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{items.length}</span>}
                    </motion.button>
                </div>
            </nav>

            {/* Dynamic Content Engine */}
            <main>
                {blocks.map((block: any, idx: number) => (
                    <section key={block.id || idx}>
                        {block.type === 'hero' && (
                            <div className="flex flex-col md:flex-row bg-white w-full border-b border-gray-100 min-h-[500px] md:min-h-[600px]">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 relative overflow-hidden order-2 md:order-1"
                                >
                                    <div className="relative w-full h-full min-h-[300px] md:min-h-[500px]">
                                        <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Hero-furniture.png'} alt="Hero" fill className="object-contain" unoptimized />
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 md:pr-24 space-y-4 md:space-y-6 order-1 md:order-2"
                                >
                                    <span className="text-[14px] md:text-[16px] font-semibold text-gray-500">{block.settings.shortTitle || 'Sustainable Furniture'}</span>
                                    <h1 className="text-4xl md:text-[54px] font-bold tracking-tight text-gray-900 leading-[1.1]">{block.settings.title || 'Quality Furniture for Every Room'}</h1>
                                    <p className="text-gray-500 text-[15px] md:text-[17px] pt-2 max-w-lg leading-relaxed">{block.settings.description || 'From living rooms to bedrooms, our high-quality furniture collections offer something for every space.'}</p>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6">
                                        <Link href={block.settings.firstButtonUrl || `/store/${storeId}/search`}>
                                            <button className="bg-black text-white px-8 py-3.5 rounded-full text-[13px] md:text-[15px] font-semibold hover:bg-gray-800 transition-all">
                                                {block.settings.firstButtonText || 'Explore Now'}
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => setActiveVideo(block.settings.youtubeUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ')}
                                            className="flex items-center gap-3 text-black text-[13px] md:text-[15px] font-semibold hover:opacity-70 transition-all"
                                        >
                                            <div className="h-12 w-12 bg-white shadow-xl shadow-black/5 rounded-full flex items-center justify-center text-black border border-gray-50 pl-1">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                            {block.settings.secondButtonText || 'Watch Now'}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {block.type === 'hero_12' && (
                            <div className="w-full min-h-[600px] lg:min-h-[800px] bg-black relative flex items-center justify-center overflow-hidden py-16">
                                {/* Background Image / Overlay */}
                                <div className="absolute inset-0 z-0">
                                    <Image src={block.settings.bgImageUrl || 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5c455494-eee9-40e3-9575-8d2fea84d21a_1600w.webp'} alt="bg" fill className="object-cover opacity-40 mix-blend-luminosity" unoptimized />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
                                </div>

                                <div className="w-full px-6 md:px-12 lg:px-20 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-[650px] pt-12">
                                                
                                    {/* Left Content */}
                                    <div className="w-full lg:w-[40%] flex flex-col items-start gap-8 z-20">
                                        {block.settings.topBadge && (
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                                                <ShoppingBag size={14} className="text-gray-500" />
                                                {block.settings.topBadge}
                                            </div>
                                        )}
                                        <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold text-white leading-[1.05] tracking-tight whitespace-pre-line mr-20">
                                            {block.settings.title?.replace(/ /g, '\n') || 'Payments\ntool for\nsoftware\ncompanies'}
                                        </h1>
                                        <div className="pt-2">
                                            <Link href={block.settings.buttonUrl || '#'}>
                                                <button className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-white text-[12px] font-bold px-8 py-3.5 rounded-full flex items-center gap-3 hover:bg-gray-800 transition-all shadow-2xl">
                                                    {block.settings.buttonText || 'Get Started'} <ArrowRight size={14} className="opacity-70" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Center Main Image (Absolute relative to the parent so it overlaps everything behind the right cards) */}
                                    <div className="hidden lg:block absolute w-[55%] h-[140%] left-[25%] top-[50%] -translate-y-[50%] z-10 pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                        <Image src={block.settings.imageUrl || 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png'} alt="Product" fill className="object-contain" unoptimized />
                                    </div>

                                    {/* Right Cards */}
                                    <div className="w-full lg:w-[32%] flex flex-col gap-6 relative z-20">
                                        {/* Card 1 */}
                                        <div className="bg-[#111111]/80 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 shadow-2xl">
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">{block.settings.card1Heading || 'WHY CHOOSE US'}</h4>
                                            <div className="space-y-6">
                                                {[1, 2, 3].map(i => {
                                                    const icon = block.settings[`card1Icon${i}`];
                                                    const title = block.settings[`card1Title${i}`];
                                                    const desc = block.settings[`card1Desc${i}`];
                                                    if (!title) return null;
                                                    return (
                                                        <div key={i} className="flex items-start gap-5 group">
                                                            <div className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900/50 flex items-center justify-center text-gray-400 text-[11px] font-bold group-hover:border-gray-500 group-hover:bg-gray-800 transition-colors shrink-0 uppercase">
                                                                {icon || ''}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-white text-[14px] font-bold tracking-tight">{title}</p>
                                                                <p className="text-gray-500 text-[12px] leading-snug tracking-tight pr-6">{desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Card 2 */}
                                        <div className="bg-[#111111]/80 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/5 shadow-2xl">
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5">{block.settings.card2Heading || 'NEW ARRIVALS'}</h4>
                                            <div className="relative w-full h-[140px] rounded-xl overflow-hidden border border-white/5 bg-black flex items-center justify-center group">
                                                <div className="absolute inset-0 z-0">
                                                    <Image src={block.settings.card2ImageUrl || 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png'} alt="Card Image" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity scale-110" unoptimized />
                                                </div>
                                                <div className="border border-white/20 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded relative z-10 shadow-lg group-hover:scale-105 transition-transform">
                                                    {block.settings.card2Text || 'COMING SOON'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                                
                                </div>
                            </div>
                        )}

                        {block.type === 'featured_products' && (
                            <div className="py-24 px-8 md:px-20 bg-white">
                                <div className="max-w-7xl mx-auto space-y-16">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-50 pb-10 gap-6">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold tracking-tight text-black uppercase decoration-blue-500/20 underline underline-offset-8">{block.settings.title || 'Featured'}</h3>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.2em]">Verified High-End Collection</p>
                                        </div>
                                        <button className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest group text-gray-400 hover:text-black transition-all">
                                            Explore All <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                        {products.slice(0, block.settings.count || 4).map((p, i) => (
                                            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group">
                                                <Link href={`/store/${storeId}/products/${p.id}`} className="space-y-6 block text-center">
                                                    <div className="aspect-square relative overflow-hidden bg-gray-50 rounded-2xl border border-gray-50 transition-all group-hover:border-blue-500/20 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/5">
                                                        <Image src={p.images[0] || ''} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                                        <div className="absolute top-4 right-4 h-10 w-10 bg-white shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                            <ShoppingBag size={14} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-[13px] font-bold text-black uppercase tracking-tight">{p.name}</h4>
                                                        <p className="text-sm font-semibold text-blue-500">{store.settings?.currency || 'Rs'} {p.price.toLocaleString()}</p>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.type === 'countdown' && (
                            <div className="flex flex-col md:flex-row bg-white w-full border-b border-gray-100 py-16 px-6 md:px-24 min-h-[400px]">
                                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-[28px] md:text-[34px] font-bold tracking-tight text-gray-900 leading-tight">{block.settings.title}</h2>
                                        <p className="text-gray-400 text-[14px] max-w-sm">{block.settings.description}</p>
                                    </div>

                                    <CountdownTimer targetDate={block.settings.date} targetTime={block.settings.time} />

                                    <Link href={block.settings.buttonUrl || `/store/${storeId}/search`}>
                                        <button className="bg-black text-white px-8 py-3.5 rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-all w-max flex items-center gap-3 group">
                                            {block.settings.buttonText}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                                <div className="w-full md:w-1/2 flex items-center justify-center mt-10 md:mt-0 relative overflow-hidden h-[300px] md:h-[400px]">
                                    <Image src={block.settings.imageUrl} alt="Countdown" fill className="object-contain" unoptimized />
                                </div>
                            </div>
                        )}

                        {block.type === 'sales_1' && (
                            <div className="w-full py-16 px-6 md:px-24 bg-white border-b border-gray-100 overflow-visible">
                                <div className="w-full bg-[#008C8C] rounded-2xl flex flex-col md:flex-row relative min-h-[300px] mt-10">
                                    <div className="w-full md:w-1/2 h-full relative flex items-center justify-center -translate-y-16">
                                        <div className="relative w-full h-[350px]">
                                            <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Object.png'} alt="Sales 1" fill className="object-contain drop-shadow-2xl" unoptimized />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 p-8 md:p-12 relative z-20 md:pl-0">
                                        <h2 className="text-[32px] font-bold text-white leading-tight">{block.settings.title || 'To get 30% off?'}</h2>
                                        <p className="text-white/90 text-[14px] max-w-sm leading-relaxed">{block.settings.description || "Sign up our newsletter today and get 10% off your very first online order with us"}</p>
                                        <div className="pt-4">
                                            <Link href={block.settings.buttonUrl || `/store/${storeId}/search`}>
                                                <button className="bg-white text-[#008C8C] px-8 py-3 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-all w-max shadow-lg">
                                                    {block.settings.buttonText || 'Buy Now'}
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.type === 'sales_2' && (
                            <div className="flex flex-col md:flex-row bg-[#FAFAFA] w-full border-b border-gray-50 py-16 px-6 md:px-24 min-h-[400px]">
                                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 md:pr-10">
                                    <h2 className="text-[36px] font-bold tracking-tight text-gray-900 leading-tight">{block.settings.title || 'To get 30% off?'}</h2>
                                    <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm">{block.settings.description || "Sign up our newsletter today and get 10% off your very first online order with us"}</p>
                                    <div className="pt-4">
                                        <Link href={block.settings.buttonUrl || `/store/${storeId}/search`}>
                                            <button className="bg-transparent border-b-2 border-black text-black px-0 py-1 text-[14px] font-bold hover:opacity-70 transition-all rounded-none outline-none">
                                                {block.settings.buttonText || 'Buy Now'}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 flex items-center justify-center mt-10 md:mt-0 relative overflow-hidden h-[300px]">
                                    <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Group-9475.png'} alt="Sales 2" fill className="object-contain" unoptimized />
                                </div>
                            </div>
                        )}

                        {block.type === 'countdown_7' && (
                            <div className="flex flex-col md:flex-row bg-[#EAEAEA] w-full border-b border-gray-100 py-16 px-6 md:px-24 min-h-[400px]">
                                <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start space-y-4">
                                    <div className="flex items-center gap-4">
                                        {['00\nDAYS', '00\nHOURS', '00\nMINUTES', '00\nSECONDS'].map((lbl, i) => (
                                            <div key={i} className="flex flex-col items-center justify-center min-w-[50px] md:min-w-[60px]">
                                                <span className="text-[32px] md:text-[40px] font-medium text-gray-800 tracking-wider font-light leading-none">{lbl.split('\n')[0]}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">{lbl.split('\n')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col justify-center mt-10 md:mt-0 md:pl-20 md:border-l border-gray-300">
                                    <h2 className="text-[32px] font-medium text-gray-900 mb-2">{block.settings.title || 'Our Blogs'}</h2>
                                    <p className="text-gray-600 text-[14px] mb-6">{block.settings.description || "Get Selected items with good price"}</p>
                                    <Link href={block.settings.buttonUrl || `/store/${storeId}/search`}>
                                        <button className="bg-black text-white px-8 py-3 rounded-md text-[13px] font-semibold w-max hover:bg-gray-800 transition-all">
                                            {block.settings.buttonText || 'Shop Now'}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}



                        {block.type === 'countdown_6' && (
                            <div className="w-full bg-white border-b border-gray-100 flex flex-col md:flex-row min-h-[420px]">
                                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                                    <h2 className="text-[32px] font-medium text-gray-800 mb-10">{block.settings.title || 'Hurry Up Sale Ends In'}</h2>
                                    <div className="flex items-center gap-4 md:gap-8 mb-12">
                                        {['00\nDays', '00\nHours', '00\nMinutes', '00\nSeconds'].map((lbl, i) => (
                                            <div key={i} className="flex flex-col items-center justify-center">
                                                <span className="text-[36px] md:text-[48px] font-semibold text-gray-800 leading-none tabular-nums">{lbl.split('\n')[0]}</span>
                                                <span className="text-[11px] text-gray-400 font-medium mt-2 uppercase tracking-wider">{lbl.split('\n')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Link href={block.settings.buttonUrl || `/store/${storeId}/search`}>
                                        <button className="bg-black text-white px-8 py-4 rounded-full text-[13px] font-semibold w-max hover:bg-gray-800 transition-all flex items-center gap-3 group">
                                            {block.settings.buttonText || 'Get This Offer'}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </button>
                                    </Link>
                                </div>
                                <div className="w-full md:w-1/2 relative overflow-hidden min-h-[320px] md:min-h-[420px]">
                                    <Image src={block.settings.imageUrl || 'https://m.media-amazon.com/images/I/61FMFn+4WEL._AC_UF1000,1000_QL80_.jpg'} alt="Promo" fill className="object-cover" unoptimized />
                                    {block.settings.badgeText && (
                                        <div className="absolute top-8 left-8 z-10 w-20 h-20 bg-black text-white rounded-full flex items-center justify-center rotate-[-15deg] shadow-lg">
                                            <span className="text-[13px] font-black uppercase tracking-wider">{block.settings.badgeText}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {block.type === 'hero_39' && (
                            <div className="relative w-full min-h-[640px] border-b border-gray-100 overflow-hidden">
                                {/* Background */}
                                <div className="absolute inset-0 z-0 bg-[#C8C0B4]">
                                    <Image
                                        src={activeHero39Bg || block.settings.bgImageUrl || 'https://i.ibb.co/932pzNhm/fourth.png'}
                                        alt="Background"
                                        fill
                                        className="object-contain object-center transition-all duration-700"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/5" />
                                </div>

                                {/* Center row: title+button LEFT, description RIGHT — vertically centered */}
                                <div className="absolute inset-0 z-10 flex items-center justify-between px-8 md:px-14 pb-20">
                                    {/* Title + button on LEFT */}
                                    <div className="flex flex-col items-start gap-5">
                                        <h2 className="text-[22px] md:text-[28px] font-light text-white whitespace-nowrap drop-shadow-sm">
                                            {block.settings.title || 'Hurry Up Sale Ends In'}
                                        </h2>
                                        <Link href={block.settings.buttonUrl || `/store/${storeId}/search`}>
                                            <button className="bg-white text-black pl-6 pr-2 py-2 rounded-full text-[13px] font-semibold hover:bg-gray-100 transition-all flex items-center gap-3 group shadow-md">
                                                {block.settings.buttonText || 'Get This Offer'}
                                                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-gray-200">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-45">
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        <polyline points="12 5 19 12 12 19"></polyline>
                                                    </svg>
                                                </div>
                                            </button>
                                        </Link>
                                    </div>

                                    {/* Description on RIGHT */}
                                    <div className="max-w-[180px] md:max-w-[220px]">
                                        <p className="text-white/90 text-[12px] md:text-[13px] font-normal leading-relaxed text-right drop-shadow-sm">
                                            {block.settings.description || 'Crafted for women who embrace both tradition and trend.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom: thumbnails */}
                                <div className="absolute bottom-6 left-0 right-0 z-10 flex items-end justify-center gap-2 md:gap-3 px-4">
                                    {[block.settings.thumb1, block.settings.thumb2, block.settings.thumb3, block.settings.thumb4, block.settings.thumb5].map((thumb, i) => {
                                        const isActive = activeHero39Bg === thumb;
                                        return thumb ? (
                                            <div
                                                key={i}
                                                onClick={() => setActiveHero39Bg(thumb)}
                                                className={`relative w-20 h-28 md:w-24 md:h-32 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 shadow-md
                                                    ${isActive
                                                        ? 'border-2 border-white scale-110 -translate-y-3 shadow-2xl'
                                                        : 'border border-white/30 opacity-70 hover:opacity-100 hover:-translate-y-1 hover:border-white/60'
                                                    }`}
                                            >
                                                <Image src={thumb} alt={`Thumbnail ${i + 1}`} fill className="object-cover" unoptimized />
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {block.type === 'how_it_works_2' && (
                            <div className="w-full bg-white border-b border-gray-100 py-20 px-8 md:px-24 flex flex-col md:flex-row min-h-[460px]">
                                {/* Left: large heading */}
                                <div className="w-full md:w-1/2 flex flex-col justify-center pr-0 md:pr-20 mb-12 md:mb-0">
                                    <h2 className="text-[38px] md:text-[52px] font-semibold tracking-tight text-gray-900 leading-tight">
                                        {block.settings.heading || 'Winter Clearance Sale'}
                                    </h2>
                                </div>
                                {/* Right: numbered steps */}
                                <div className="w-full md:w-1/2 flex flex-col justify-center gap-8 md:border-l md:border-gray-100 pl-0 md:pl-20">
                                    {[1, 2, 3].map(n => (
                                        <div key={n} className="flex items-start gap-5">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-black text-white text-[12px] font-bold flex items-center justify-center">{n}</div>
                                                {n < 3 && <div className="w-px flex-1 min-h-[32px] bg-gray-200 mt-2" />}
                                            </div>
                                            <div className="pb-2">
                                                <p className="text-[15px] font-semibold text-gray-800">{block.settings[`step${n}Title`] || `Step ${n}`}</p>
                                                <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-sm">{block.settings[`step${n}Desc`] || ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {block.type === 'trusted_by_4' && (
                            <div className="w-full bg-white border-b border-gray-100 py-20 px-8 md:px-24 flex flex-col items-center">
                                <h2 className="text-[28px] md:text-[34px] font-semibold text-gray-900 text-center mb-4">
                                    {block.settings.title || 'Trusted Partners'}
                                </h2>
                                <p className="text-[14px] text-gray-500 text-center max-w-lg leading-relaxed mb-14">
                                    {block.settings.description || 'Trusted by leading brands and satisfied customers worldwide, we deliver quality products you can rely on.'}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
                                    {['logo1', 'logo2', 'logo3', 'logo4'].map(key => block.settings[key] ? (
                                        <div key={key} className="relative h-10 w-32 shrink-0">
                                            <Image src={block.settings[key]} alt="Partner Logo" fill className="object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300" unoptimized />
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        )}

                        {block.type === 'trusted_by_2' && (
                            <div className="py-12 bg-white border-y border-gray-50 overflow-hidden relative">
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @keyframes marquee {
                                        0% { transform: translateX(0); }
                                        100% { transform: translateX(-50%); }
                                    }
                                    .marquee-container {
                                        display: flex;
                                        animation: marquee 30s linear infinite;
                                        width: max-content;
                                    }
                                `}} />
                                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 px-8 max-w-7xl mx-auto">
                                    {(block.settings?.title) && (
                                        <div className="shrink-0 text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                            {block.settings.title}
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-hidden relative grayscale opacity-30">
                                        <div className="marquee-container gap-16">
                                            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((n, i) => {
                                                const logoUrl = block.settings?.[`logo${n}`] || `https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-${n}.png`;
                                                return (
                                                    <div key={i} className="h-10 flex items-center justify-center shrink-0 min-w-[120px]">
                                                        <Image
                                                            src={logoUrl}
                                                            alt="Partner"
                                                            width={120}
                                                            height={40}
                                                            className="h-6 md:h-8 w-auto object-contain"
                                                            unoptimized
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
                                        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.type === 'product_showcase_9' && (
                            <div className="w-full bg-white border-b border-gray-100 flex flex-col md:flex-row min-h-[540px]">
                                {/* Left: product image area */}
                                <div className="w-full md:w-1/2 relative bg-gray-50 min-h-[400px] md:min-h-[540px] flex flex-col items-center justify-end overflow-hidden">
                                    {block.settings.badge && (
                                        <div className="absolute top-8 left-8 z-10 bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                            {block.settings.badge}
                                        </div>
                                    )}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={block.settings.imageUrl || 'https://img.freepik.com/premium-photo/pair-headpho%E2%80%A6e-band-that-says-number-3_984237-83953.jpg?w=1480'}
                                            alt={block.settings.imageName || 'Product'}
                                            fill
                                            className="object-contain p-10"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="relative z-10 w-full text-center pb-8">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">{block.settings.productTitle || 'Wireless Over-Ear Headphones'}</p>
                                        <h3 className="text-[22px] font-bold text-gray-900 mt-1">{block.settings.imageName || 'Aurora X-500'}</h3>
                                    </div>
                                </div>
                                {/* Right: feature specs */}
                                <div className="w-full md:w-1/2 flex flex-col justify-center gap-0 px-10 md:px-16 py-12">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className="flex flex-col gap-1 py-6 border-b border-gray-100 last:border-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{block.settings[`feat${n}Tag`] || ''}</span>
                                            <p className="text-[17px] font-bold text-gray-900 mt-0.5">{block.settings[`feat${n}Title`] || ''}</p>
                                            <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{block.settings[`feat${n}Desc`] || ''}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {block.type === 'product_highlights_9' && (() => {
                            const feats = [1, 2, 3, 4].map(n => ({
                                img: block.settings[`feat${n}Img`] || '',
                                title: block.settings[`feat${n}Title`] || `Feature ${n}`,
                                desc: block.settings[`feat${n}Desc`] || '',
                            }));
                            return (
                                <div className="w-full bg-[#F8F8F8] border-b border-gray-100 px-6 md:px-16 py-14">
                                    {/* Header row */}
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
                                        <div className="flex flex-col gap-3">
                                            {block.settings.badge && (
                                                <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-[11px] font-semibold text-gray-600 w-max shadow-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                                                    {block.settings.badge}
                                                </div>
                                            )}
                                            <h2 className="text-[36px] md:text-[52px] font-black text-gray-900 uppercase leading-none tracking-tight">
                                                {block.settings.heading || 'PREMIUM HEADPHONES'}
                                            </h2>
                                        </div>
                                        <p className="text-[13px] text-gray-500 leading-relaxed max-w-[260px] text-right md:pt-16">
                                            {block.settings.description || 'Each product is crafted with care to provide unmatched quality, comfort, and usability for our customers.'}
                                        </p>
                                    </div>

                                    {/* Accordion cards */}
                                    <div className="flex gap-3 h-[460px] md:h-[520px]" onMouseLeave={() => setActiveCard9(null)}>
                                        {feats.map((feat, i) => {
                                            const isActive = activeCard9 === i;
                                            const isCollapsed = activeCard9 !== null && !isActive;
                                            return (
                                                <div
                                                    key={i}
                                                    onMouseEnter={() => setActiveCard9(i)}
                                                    className="relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out"
                                                    style={{ flex: isActive ? 4 : isCollapsed ? 0.6 : 1, minWidth: 0 }}
                                                >
                                                    {feat.img ? (
                                                        <Image src={feat.img} alt={feat.title} fill className="object-contain bg-white transition-all duration-500" unoptimized />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                                                    )}
                                                    {/* Dark gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                                    {/* Number */}
                                                    <div className="absolute top-5 left-5 text-white/60 text-[11px] font-black tracking-widest">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </div>
                                                    {/* Content */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                                                        <h4
                                                            className="font-bold text-white leading-tight transition-all duration-300"
                                                            style={{ fontSize: isActive ? '20px' : '13px' }}
                                                        >
                                                            {feat.title}
                                                        </h4>
                                                        <p
                                                            className="text-white/80 text-[12px] leading-relaxed mt-2 transition-all duration-300 overflow-hidden"
                                                            style={{ maxHeight: isActive ? '80px' : '0px', opacity: isActive ? 1 : 0 }}
                                                        >
                                                            {feat.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                        {block.type === 'countdown_3' && <Countdown3Renderer block={block} storeId={store.id} />}
                        {block.type === 'countdown_2' && (
                            <div className="w-full bg-white border-b border-gray-100 py-10 px-0 flex items-center justify-center">
                                <div className="w-full bg-white flex flex-col md:flex-row min-h-[380px] relative p-8 md:p-12">
                                    <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 z-10 px-4 md:px-8">
                                        {block.settings.badge && (
                                            <div className="inline-flex items-center gap-2 text-[10px] font-semibold text-blue-500 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                {block.settings.badge}
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <h2 className="text-[28px] md:text-[34px] font-bold text-gray-900 leading-tight">{block.settings.title}</h2>
                                            <p className="text-[14px] md:text-[15px] font-medium text-gray-400">{block.settings.subTitle}</p>
                                        </div>
                                        <p className="text-gray-400 text-[13px] leading-relaxed max-w-sm font-normal">{block.settings.description}</p>

                                        <CountdownTimer targetDate={block.settings.date} targetTime={block.settings.time} />

                                        <div className="pt-2">
                                            <Link
                                                href={block.settings.buttonUrl || '#'}
                                                className="bg-black text-white px-7 py-3 rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-gray-800 transition-all w-max flex items-center gap-3 group"
                                            >
                                                {block.settings.buttonText}
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-1/2 relative mt-12 md:mt-0 flex items-center justify-center px-4">
                                        <div className="relative w-full h-[280px] md:h-[320px]">
                                            <Image src={block.settings.imageUrl} alt="Product" fill className="object-contain" unoptimized />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.type === 'not_found_11' && (
                            <div className="w-full bg-black min-h-screen py-32 flex flex-col items-center justify-center px-10">
                                <h1 className="text-[140px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 mb-8 drop-shadow-2xl">404</h1>
                                <p className="text-white/60 text-[15px] text-center max-w-sm mb-12">{block.settings.message || "This page you are looking for might have been moved or doesn't exist."}</p>
                                <div className="flex gap-4">
                                    <Link href={block.settings.homeUrl || '/'}>
                                        <button className="bg-white text-black px-8 py-3 rounded-md font-bold text-[14px] hover:bg-gray-100 transition-colors">{block.settings.homeText || 'Go Home'}</button>
                                    </Link>
                                    <button onClick={() => window.history.back()} className="bg-transparent border border-white/20 text-white px-8 py-3 rounded-md font-bold text-[14px] hover:bg-white/10 transition-colors">{block.settings.backText || 'Back'}</button>
                                </div>
                            </div>
                        )}

                        {block.type === 'not_found_3' && (
                            <div className="w-full bg-[#fcf9f2] min-h-screen py-32 border-b-[8px] border-gray-900 flex flex-col items-center justify-center p-10 relative overflow-hidden">
                                <div className="border-2 border-gray-900 rounded-full px-4 py-1.5 text-[12px] font-bold bg-white shadow-[3px_3px_0px_#000] mb-12 uppercase tracking-[0.2em]">{block.settings.badge || 'ERROR_CODE_404'}</div>
                                <h1 className="text-[120px] md:text-[180px] font-black text-[#0f3b2e] leading-none mb-6 drop-shadow-[4px_4px_0px_#fff]">404</h1>
                                <h2 className="text-[32px] md:text-[40px] font-bold text-gray-900 mb-4">{block.settings.homeText === 'Go Home' ? 'Page Not Found' : 'Error'}</h2>
                                <p className="text-gray-600 text-[16px] text-center max-w-md mb-12 leading-relaxed">{block.settings.message || "The page you're looking for doesn't exist or has been moved."}</p>
                                <div className="flex gap-4">
                                    <Link href={block.settings.homeUrl || '/'}>
                                        <button className="bg-black text-white px-8 py-3.5 rounded-xl font-bold text-[14px] shadow-[3px_3px_0px_#000] hover:translate-y-1 hover:shadow-[0px_0px_0px_#000] transition-all">{block.settings.homeText || 'Go Home'}</button>
                                    </Link>
                                    <button onClick={() => window.history.back()} className="bg-white border-2 border-gray-900 text-gray-900 px-8 py-3.5 rounded-xl font-bold text-[14px] shadow-[3px_3px_0px_#000] hover:translate-y-1 hover:shadow-[0px_0px_0px_#000] transition-all">{block.settings.backText || 'Go Back'}</button>
                                </div>
                            </div>
                        )}



                        {block.type === 'not_found_5' && (
                            <div className="w-full bg-[#1b1b1f] min-h-[80vh] py-32 flex flex-col items-center justify-center p-10 relative overflow-hidden">
                                <h1 className="text-[150px] md:text-[300px] font-black text-white/5 leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">404</h1>
                                <p className="text-white font-bold text-[24px] md:text-[32px] mb-12 z-10">{block.settings.message || 'Nothing to see here.'}</p>
                                <Link href={block.settings.homeUrl || '/'}>
                                    <button className="bg-white text-black px-8 py-3.5 rounded-2xl font-bold text-[14px] shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:bg-gray-100 transition-all z-10">{block.settings.homeText || 'Go Home'}</button>
                                </Link>
                                <div className="mt-16 md:mt-24 relative w-24 h-24 md:w-32 md:h-32 z-10">
                                    <Image src={block.settings.imageUrl || 'https://cdn-icons-png.flaticon.com/512/1674/1674773.png'} alt="Mascot" fill className="object-contain" unoptimized />
                                </div>
                            </div>
                        )}

                        {block.type === 'not_found_6' && (
                            <div className="w-full bg-gradient-to-br from-[#eef2f6] to-[#d8e0e8] min-h-[80vh] py-32 flex flex-col items-center justify-center p-10 relative overflow-hidden">
                                <h1 className="text-[180px] md:text-[280px] font-black text-white leading-none drop-shadow-xl opacity-80 mix-blend-overlay">404</h1>
                                <h2 className="text-[24px] md:text-[36px] font-black text-[#2b4c65] uppercase tracking-[0.4em] md:-mt-16 -mt-10 mb-8 drop-shadow-sm">{block.settings.subtitle || 'LOST IN SPACE'}</h2>
                                <p className="text-[#517a95] text-[15px] md:text-[18px] text-center max-w-xl mb-12 leading-relaxed font-medium">{block.settings.message || "The coordinates you entered don't exist in this dimension. Check the URL or head back to the docking station."}</p>
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                    <Link href={block.settings.homeUrl || '/'}>
                                        <button className="bg-white text-[#2b4c65] px-10 py-3.5 rounded-full font-black text-[13px] md:text-[14px] shadow-[6px_6px_16px_rgba(0,0,0,0.1),-6px_-6px_16px_rgba(255,255,255,0.9)] hover:shadow-inner transition-all uppercase tracking-[0.2em]">{block.settings.homeText || 'HOME'}</button>
                                    </Link>
                                    <button onClick={() => window.history.back()} className="bg-[#eef2f6] text-[#517a95] px-10 py-3.5 rounded-full font-black text-[13px] md:text-[14px] shadow-[6px_6px_16px_rgba(0,0,0,0.1),-6px_-6px_16px_rgba(255,255,255,0.9)] hover:shadow-inner transition-all uppercase tracking-[0.2em]">{block.settings.backText || 'BACK'}</button>
                                </div>
                            </div>
                        )}                         {block.type === 'checkout_1' && (
                            <div className="w-full bg-[#f8f9fa] min-h-screen py-16 px-6 lg:px-12 font-sans text-[#2d3436]">
                                {checkoutSuccess ? (
                                    <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm px-10">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-4 uppercase tabular-nums">Order Confirmed!</h2>
                                        <p className="text-gray-500 mb-8 font-medium">Your order <span className="text-black font-bold">#{checkoutOrderId.substring(0, 8).toUpperCase()}</span> has been placed.</p>
                                        <Link href={`/store/${storeId}`}>
                                            <button className="bg-[#2d3436] text-white px-8 py-3 rounded font-bold text-xs uppercase hover:bg-black transition-all">Go Home</button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="max-w-6xl mx-auto">
                                        <h1 className="text-2xl font-bold mb-10">{block.settings.title || 'Checkout'}</h1>
                                        <div className="flex flex-col lg:flex-row gap-12">
                                            <div className="flex-1 space-y-8">
                                                <form className="space-y-8" onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    if (!paymentMethod) return alert('Select payment method');
                                                    setSubmittingCheckout(true);
                                                    try {
                                                        const orderId = Math.random().toString(36).substr(2, 9);
                                                        setCheckoutOrderId(orderId);
                                                        setCheckoutSuccess(true);
                                                        clearCart();
                                                    } catch (e) { alert('Checkout failed'); }
                                                    finally { setSubmittingCheckout(false); }
                                                }}>
                                                    <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
                                                        <h2 className="text-sm font-bold mb-8 border-b border-gray-100 pb-3">{block.settings.step1 || 'Shipping Information'}</h2>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 ml-1">Full Name *</label>
                                                                <input required className="w-full h-10 border border-gray-200 rounded px-4 text-xs font-medium focus:border-gray-900 outline-none transition-all" value={formData.firstName + ' ' + formData.lastName} onChange={e => {
                                                                    const [first, ...rest] = e.target.value.split(' ');
                                                                    setFormData({ ...formData, firstName: first || '', lastName: rest.join(' ') || '' });
                                                                }} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 ml-1">Email</label>
                                                                <input type="email" required className="w-full h-10 border border-gray-200 rounded px-4 text-xs font-medium focus:border-gray-900 outline-none transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 ml-1">City/District *</label>
                                                                <input required className="w-full h-10 border border-gray-200 rounded px-4 text-xs font-medium focus:border-gray-900 outline-none transition-all" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 ml-1">Mobile Number *</label>
                                                                <input required className="w-full h-10 border border-gray-200 rounded px-4 text-xs font-medium focus:border-gray-900 outline-none transition-all" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2 space-y-1">
                                                                <label className="text-[10px] font-bold text-gray-500 ml-1">Address *</label>
                                                                <input required className="w-full h-10 border border-gray-200 rounded px-4 text-xs font-medium focus:border-gray-900 outline-none transition-all" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button type="submit" disabled={submittingCheckout || items.length === 0} className="w-full bg-[#2d3436] text-white h-14 rounded font-bold text-sm hover:bg-black transition-all disabled:opacity-50">
                                                        {submittingCheckout ? 'Processing...' : (block.settings.buttonText || 'Place Order')}
                                                    </button>
                                                </form>
                                            </div>

                                            <div className="w-full lg:w-[380px] space-y-6">
                                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                                    <h2 className="text-sm font-bold mb-6">{block.settings.step2 || 'Order Summary'}</h2>
                                                    {items.length === 0 ? (
                                                        <div className="py-10 text-center space-y-4">
                                                            <p className="text-xs text-gray-400 font-medium">No products in your cart</p>
                                                            <Link href={`/store/${storeId}`}>
                                                                <button className="bg-blue-600 text-white px-4 py-2 rounded text-[10px] font-bold shadow-sm hover:bg-blue-700">Continue Shopping</button>
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                                            {items.map((item, i) => (
                                                                <div key={i} className="flex gap-4 items-center">
                                                                    <div className="h-12 w-12 relative bg-gray-50 rounded border border-gray-100 overflow-hidden shrink-0">
                                                                        <Image src={item.product.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} fill className="object-cover" unoptimized />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[11px] font-bold text-gray-900 truncate uppercase">{item.product.name}</p>
                                                                        <p className="text-[10px] text-gray-400 font-medium">QTY: {item.quantity}</p>
                                                                    </div>
                                                                    <div className="text-[11px] font-bold tabular-nums">R {(item.product.price * item.quantity).toFixed(2)}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="pt-6 border-t border-gray-100 space-y-2">
                                                        <div className="flex justify-between text-[11px] font-medium text-gray-500"><span>Subtotal</span><span>R {cartTotal.toFixed(2)}</span></div>
                                                        {block.settings.showLogistics && <div className="flex justify-between text-[11px] font-medium text-gray-500"><span>Shipping</span><span className="text-emerald-500">FREE</span></div>}
                                                        <div className="flex justify-between pt-4 text-sm font-bold border-t border-gray-50 mt-4 tabular-nums"><span>Total</span><span>R {cartTotal.toFixed(2)}</span></div>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                                    <h2 className="text-sm font-bold mb-4">{block.settings.step3 || 'Payment Method'}</h2>
                                                    <div className="space-y-2">
                                                        {['cod', 'fonepay', 'qr'].map(m => (
                                                            <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={`w-full p-4 rounded-lg border transition-all flex items-center gap-4 ${paymentMethod === m ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === m ? 'border-blue-500' : 'border-gray-300'}`}>
                                                                    {paymentMethod === m && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                                                </div>
                                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                                                    {m === 'cod' ? 'Cash on Delivery' : m === 'fonepay' ? 'Fonepay Direct' : 'Scan Payment QR'}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {block.type === 'contact_1' && (
                            <div className="w-full bg-white min-h-[500px] p-6 lg:p-12 font-sans border-b border-gray-100 flex flex-col md:flex-row gap-12 lg:gap-20 max-w-7xl mx-auto">
                                <div className="flex-1 space-y-10">
                                    <div className="space-y-4">
                                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{block.settings.title || 'Contact Us'}</h1>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-md">{block.settings.subtitle || 'If you would like to know more about our policies, you can consult our Terms and Conditions.'}</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><MapPin size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Address</p>
                                                <p className="text-[13px] font-bold text-gray-800">{block.settings.address || 'Kirtipur'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Smartphone size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                                                <p className="text-[13px] font-bold text-gray-800">{block.settings.phone || '9786559060'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Mail size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                                                <p className="text-[13px] font-bold text-gray-800">{block.settings.email || 'hello@zalient.shop'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><RefreshCw size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Open Hours</p>
                                                <p className="text-[13px] font-bold text-gray-800">{block.settings.openHours || 'Monday - Friday: 10:00 AM - 5:00 PM'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 max-w-xl">
                                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-2xl shadow-sm space-y-8">
                                        <h2 className="text-xl font-bold text-gray-900">{block.settings.formTitle || 'Send Us a Message'}</h2>

                                        {contactSent ? (
                                            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                                    <Check size={32} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-lg font-bold text-gray-900">Message Sent!</p>
                                                    <p className="text-xs text-gray-400 font-medium">Thank you for reaching out. We'll get back to you shortly.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setContactSent(false)}
                                                    className="text-xs font-bold text-blue-600 hover:underline pt-4"
                                                >
                                                    Send another message
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Your Name</label>
                                                    <input
                                                        required
                                                        placeholder="Ex: John Doe"
                                                        value={contactForm.name}
                                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                        className="w-full h-11 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-black focus:bg-white transition-all shadow-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        placeholder="Ex: hello@zalient.shop"
                                                        value={contactForm.email}
                                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                        className="w-full h-11 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-black focus:bg-white transition-all shadow-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Subject</label>
                                                    <input
                                                        required
                                                        placeholder="How can we help?"
                                                        value={contactForm.subject}
                                                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                                        className="w-full h-11 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-black focus:bg-white transition-all shadow-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Message</label>
                                                    <textarea
                                                        required
                                                        placeholder="Write your message here..."
                                                        value={contactForm.message}
                                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                        className="w-full min-h-[120px] bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-[13px] font-medium outline-none focus:border-black focus:bg-white transition-all resize-none shadow-none"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={contactLoading}
                                                    className="w-full bg-black text-white h-12 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mt-4"
                                                >
                                                    {contactLoading ? 'Sending...' : (block.settings.buttonText || 'Send Message')}
                                                    {!contactLoading && <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.type === 'testimonial_1' && (
                            <div className="py-12 md:py-20 bg-white px-6 md:px-12 border-b border-gray-50 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
                                <div className="w-full md:w-[30%] shrink-0 space-y-6 pt-10 text-center md:text-left">
                                    <div className="space-y-4">
                                        <h2 className="text-[22px] md:text-[26px] font-bold text-gray-950 tracking-tighter uppercase font-mono">[{block.settings.title || 'OUR TESTIMONIALS'}]</h2>
                                        <p className="text-[14px] md:text-[15px] text-gray-400 font-medium leading-relaxed max-w-xs tracking-tight mx-auto md:mx-0">{block.settings.subtitle || 'See what our community has to say about their journey.'}</p>
                                    </div>
                                    <div className="w-12 h-1 bg-black rounded-full mx-auto md:mx-0" />
                                </div>
                                <div className="w-full md:w-[70%] -mr-12 md:-mr-32">
                                    <TestimonialCarousel testimonials={block.settings.testimonials || []} speed={block.settings.speed} />
                                </div>
                            </div>
                        )}

                        {block.type === 'testimonial_2' && (
                            <InsightsSlider block={block} updateBlockSetting={updateBlockSetting} />
                        )}

                        {block.type === 'newsletter' && (
                            <div className="py-32 bg-gray-50 text-center px-10 border-y border-gray-100">
                                <div className="max-w-xl mx-auto space-y-8">
                                    <h3 className="text-3xl font-bold tracking-tight text-black">{block.settings.title}</h3>
                                    <p className="text-sm text-gray-400 max-w-sm mx-auto">{block.settings.subtitle}</p>
                                    <div className="flex h-12 max-w-sm mx-auto shadow-sm">
                                        <input placeholder="Your email address" className="flex-1 bg-white border border-gray-200 border-r-0 px-6 text-xs font-semibold focus:outline-none focus:border-blue-500 rounded-l-lg" />
                                        <button className="px-8 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-r-lg hover:bg-blue-600 transition-all">Submit</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.type === 'footer' && (
                            <footer className="py-20 bg-white px-8 md:px-12 border-t border-gray-100">
                                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                                    <div className="space-y-4 text-center md:text-left">
                                        <span className="text-sm font-bold uppercase tracking-widest text-black">{store.name}</span>
                                        <div className="flex gap-6 justify-center md:justify-start">
                                            <Instagram size={18} className="text-gray-300 hover:text-pink-500 transition-colors cursor-pointer" />
                                            <Facebook size={18} className="text-gray-300 hover:text-blue-500 transition-colors cursor-pointer" />
                                            <Mail size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="flex gap-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="hover:text-black cursor-pointer">Archive</span>
                                        <span className="hover:text-black cursor-pointer">Shipping</span>
                                        <span className="hover:text-black cursor-pointer">Support</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">© {new Date().getFullYear()} CV CORE PLATFORM</p>
                                </div>
                            </footer>
                        )}

                        {/* Branch 1 — white, two-column layout */}
                        {block.type === 'sales_3' && (
                            <div className="w-full py-16 px-6 md:px-16 lg:px-24 bg-white">
                                <div className="w-full bg-black rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                                    {/* Badge */}
                                    {block.settings.badgeText && (
                                        <div className="absolute top-0 right-0 bg-white text-black font-black text-[18px] md:text-[22px] italic tracking-tight px-8 py-5 rounded-bl-[2.5rem] shadow-sm z-20">
                                            {block.settings.badgeText}
                                        </div>
                                    )}
                                                
                                    {/* Text Content */}
                                    <div className="flex-1 text-white z-10 space-y-6 md:pr-10">
                                        <h2 className="text-[36px] md:text-[48px] lg:text-[56px] font-bold tracking-tight leading-none text-white whitespace-pre-wrap">
                                            {block.settings.title || 'To get 30% off?'}
                                        </h2>
                                        <p className="text-gray-300 text-[14px] md:text-[16px] max-w-md leading-relaxed font-medium">
                                            {block.settings.description || 'Sign up our newsletter today and get 10% off your very first online order with us'}
                                        </p>
                                        <div className="pt-2">
                                            <Link href={block.settings.buttonUrl || '#'}>
                                                <button className="bg-transparent border border-white text-white px-8 py-3.5 rounded-full text-[12px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors w-max">
                                                    {block.settings.buttonText || 'GET NOW'}
                                                </button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className="w-full md:w-[320px] lg:w-[400px] flex items-center justify-center relative z-10">
                                        <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl p-6">
                                            <div className="relative w-full h-full">
                                                <Image 
                                                    src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Group-9477-2.png'} 
                                                    alt="Sale image" 
                                                    fill 
                                                    className="object-contain"
                                                    style={{ transform: `translateY(${block.settings.imagePosition ? `${block.settings.imagePosition}px` : '0px'})` }}
                                                    unoptimized 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Branch 1 — white, two-column layout */}
                        {block.type === 'branch_1' && (
                            <section className="py-16 px-6 md:px-16 lg:px-24 bg-white">
                                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                                    <div className="flex-1">
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">LOCATIONS</p>
                                        <h2 className="text-[26px] font-semibold text-gray-900 mb-3 leading-tight">{block.settings.title || 'Our Branches'}</h2>
                                        <p className="text-[14px] text-gray-500 leading-relaxed mb-10">{block.settings.description || 'Visit us at any of our convenient locations.'}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {block.settings.branches && block.settings.branches.length > 0 ? block.settings.branches.map((b: any, i: number) => (
                                                <div key={i} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                    <p className="text-[14px] font-semibold text-gray-900 mb-2">{b.name}</p>
                                                    {b.address && <p className="text-[13px] text-gray-500 flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" /> {b.address}</p>}
                                                    {b.phone && <p className="text-[13px] text-gray-500 flex items-center gap-2 mt-1.5"><Smartphone size={13} className="shrink-0 text-gray-400" /> {b.phone}</p>}
                                                    {b.email && <p className="text-[13px] text-gray-500 flex items-center gap-2 mt-1.5"><Mail size={13} className="shrink-0 text-gray-400" /> {b.email}</p>}
                                                    {b.hours && <p className="text-[13px] text-gray-500 flex items-center gap-2 mt-1.5"><Clock size={13} className="shrink-0 text-gray-400" /> {b.hours}</p>}
                                                </div>
                                            )) : (
                                                <div className="col-span-2 py-12 text-center">
                                                    <MapPin size={28} className="mx-auto text-gray-200 mb-3" />
                                                    <p className="text-[13px] text-gray-400">We're expanding! Check back soon for our new locations.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {block.settings.showMap && (
                                        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-sm min-h-[350px]" style={{ height: `${block.settings.mapHeight || 450}px` }}>
                                            {block.settings.mapUrl ? (
                                                <iframe src={block.settings.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-3">
                                                    <MapPin size={32} className="text-gray-200" />
                                                    <p className="text-[13px] text-gray-400">Add Google Maps embed URL in the editor</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Branch 2 — warm background, map below header */}
                        {block.type === 'branch_2' && (
                            <section className="py-16 px-6 md:px-16 lg:px-24 bg-[#fdf8f4]">
                                <div className="text-center max-w-2xl mx-auto mb-10">
                                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">LOCATIONS</p>
                                    <h2 className="text-[26px] font-semibold text-gray-900 mb-3 leading-tight">{block.settings.title || 'Our Branches'}</h2>
                                    <p className="text-[14px] text-gray-500 leading-relaxed">{block.settings.description || 'Visit us at any of our convenient locations.'}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                                    {block.settings.branches && block.settings.branches.length > 0 ? block.settings.branches.map((b: any, i: number) => (
                                        <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                                            <p className="text-[14px] font-semibold text-gray-900 mb-2">{b.name}</p>
                                            {b.address && <p className="text-[13px] text-gray-500 flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" /> {b.address}</p>}
                                            {b.phone && <p className="text-[13px] text-gray-500 flex items-center gap-2 mt-1.5"><Smartphone size={13} className="shrink-0 text-gray-400" /> {b.phone}</p>}
                                            {b.email && <p className="text-[13px] text-gray-500 flex items-center gap-2 mt-1.5"><Mail size={13} className="shrink-0 text-gray-400" /> {b.email}</p>}
                                            {b.hours && <p className="text-[13px] text-gray-500 flex items-center gap-2 mt-1.5"><Clock size={13} className="shrink-0 text-gray-400" /> {b.hours}</p>}
                                        </div>
                                    )) : (
                                        <div className="col-span-3 py-12 text-center">
                                            <MapPin size={28} className="mx-auto text-gray-200 mb-3" />
                                            <p className="text-[13px] text-gray-400">We're expanding! Check back soon for our new locations.</p>
                                        </div>
                                    )}
                                </div>
                                {block.settings.showMap && (
                                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm w-full" style={{ height: `${block.settings.mapHeight || 450}px` }}>
                                        {block.settings.mapUrl ? (
                                            <iframe src={block.settings.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                        ) : (
                                            <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-3">
                                                <MapPin size={32} className="text-gray-200" />
                                                <p className="text-[13px] text-gray-400">Add Google Maps embed URL in the editor</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {block.type === 'footer_12' && (
                            <footer className="pt-20 pb-10 bg-[#f9fafb] px-6 md:px-16 lg:px-24">
                                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24 mb-16">
                                    {/* Logo Column */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                        {block.settings.logoUrl || store.logo ? (
                                             <div className="relative h-12 w-32 mb-4">
                                                 <Image src={block.settings.logoUrl || store.logo} alt={store.name} fill className="object-contain" unoptimized />
                                             </div>
                                         ) : (
                                             <div className="text-2xl font-black text-black tracking-tighter mb-4 uppercase">{store.name}</div>
                                         )}
                                        <p className="text-gray-400 text-[12px] font-medium leading-relaxed max-w-xs">{store.description || 'Your boutique destination for premium products.'}</p>
                                    </div>

                                    {/* Legal Column */}
                                    <div className="flex flex-col items-center md:items-start space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[1px] h-4 bg-gray-300" />
                                            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{block.settings.legalTitle || 'LEGAL'}</span>
                                        </div>
                                        <div className="flex flex-col items-center md:items-start gap-4">
                                            <div className="group flex items-center gap-2 cursor-pointer transition-all hover:translate-x-1">
                                                <ArrowRight size={10} className="text-gray-400" />
                                                <span className="text-[13px] font-medium text-gray-500 group-hover:text-black">Privacy Policy</span>
                                            </div>
                                            <div className="group flex items-center gap-2 cursor-pointer transition-all hover:translate-x-1">
                                                <ArrowRight size={10} className="text-gray-400" />
                                                <span className="text-[13px] font-medium text-gray-500 group-hover:text-black">Terms & Conditions</span>
                                            </div>
                                            <div className="group flex items-center gap-2 cursor-pointer transition-all hover:translate-x-1">
                                                <ArrowRight size={10} className="text-gray-400" />
                                                <span className="text-[13px] font-medium text-gray-500 group-hover:text-black">Return Policy</span>
                                            </div>
                                            <div className="group flex items-center gap-2 cursor-pointer transition-all hover:translate-x-1">
                                                <ArrowRight size={10} className="text-gray-400" />
                                                <span className="text-[13px] font-medium text-gray-500 group-hover:text-black">Refund Policy</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Column */}
                                    <div className="flex flex-col items-center md:items-start space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[1px] h-4 bg-gray-300" />
                                            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{block.settings.contactTitle || 'CONTACT US'}</span>
                                        </div>
                                        <div className="space-y-4 text-center md:text-left">
                                            <div className="flex items-center gap-3 justify-center md:justify-start group">
                                                <Mail size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                                                <span className="text-[13px] font-medium text-gray-500">{block.settings.email || 'hello@createvendor.com'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 justify-center md:justify-start group">
                                                <Smartphone size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                                                <span className="text-[13px] font-medium text-gray-500">{block.settings.phone || '+977 9828138995'}</span>
                                            </div>
                                            {block.settings.showPan && (
                                                <div className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mt-4">
                                                    PAN/VAT: {block.settings.panNumber || '140881501'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Social Column */}
                                    <div className="flex flex-col items-center md:items-start space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[1px] h-4 bg-gray-300" />
                                            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{block.settings.socialTitle || 'FOLLOW US'}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {block.settings.fbUrl && (
                                                <a href={block.settings.fbUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                                                    <Facebook size={20} />
                                                </a>
                                            )}
                                            {block.settings.igUrl && (
                                                <a href={block.settings.igUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                                                    <Instagram size={20} />
                                                </a>
                                            )}
                                            {block.settings.ttUrl && (
                                                <a href={block.settings.ttUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                                                   <div className="w-5 h-5 rounded-sm border-2 border-current flex items-center justify-center text-[10px] font-black">T</div>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {block.settings.copyrightText || `© ${new Date().getFullYear()} ${store.name}. All rights reserved.`}
                                    </div>
                                    {block.settings.showMadeWith && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Made with</span>
                                            <span className="text-[10px] font-black text-black">CREATE VENDOR</span>
                                        </div>
                                    )}
                                </div>
                            </footer>
                        )}
                    </section>
                ))}
            </main>

            {/* Video Modal Popup */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                        onClick={() => setActiveVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-4 right-4 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-10"
                            >
                                <X size={20} />
                            </button>
                            {(() => {
                                const getYoutubeId = (url: string) => {
                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                    const match = url.match(regExp);
                                    return (match && match[2].length === 11) ? match[2] : null;
                                };
                                const ytId = getYoutubeId(activeVideo);
                                if (ytId) {
                                    return (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                            className="w-full h-full border-0 bg-black"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                }
                                return <video src={activeVideo} controls autoPlay className="w-full h-full object-contain bg-black" />;
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                body { overflow-x: hidden; }
                ::selection { background: #3B82F6; color: #fff; }
            ` }} />
        </div>
    );
}

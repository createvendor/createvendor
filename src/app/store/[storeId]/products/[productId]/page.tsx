'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Product, Store, Review } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft, ShoppingBag, PackageX, Minus, Plus, CreditCard,
    Heart, Star, ShieldCheck, RefreshCw, Truck, ChevronDown,
    Image as ImageIcon, X, ChevronLeft, ChevronRight, Eye,
    CheckCircle, Zap, Shield, RotateCcw, DollarSign, Home, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStoreContext } from '@/context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.storeId as string;
    const productId = params?.productId as string;
    const { addItem, items, setIsCartOpen } = useCart();

    const { store, products, loading: contextLoading } = useStoreContext();
    const product = products.find(p => p.id === productId) || null;
 
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [zoomActive, setZoomActive] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [extraInputs, setExtraInputs] = useState<Record<string, string>>({});
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Set default variants and inputs
    useEffect(() => {
        if (product) {
            if (product.variants && Array.isArray(product.variants)) {
                const defaults: Record<string, string> = {};
                product.variants.forEach(v => {
                    if (v.options && v.options.length > 0) {
                        defaults[v.name] = v.options[0];
                    }
                });
                setSelectedVariants(defaults);
            }
            if (product.extraFields) {
               const inputDefaults: Record<string, string> = {};
               product.extraFields.forEach(f => { inputDefaults[f.label] = ''; });
               setExtraInputs(inputDefaults);
            }
        }
    }, [product]);

    // Handle price/stock update based on variants
    const getDynamicPricing = () => {
        if (!product) return { price: 0, stock: 0 };
        let price = product.price;
        let stock = product.stock;

        if (Object.keys(selectedVariants).length > 0 && product.variantList) {
            const variantEntry = product.variantList.find(v => 
                Object.entries(selectedVariants).every(([k, val]) => v.options[k] === val)
            );
            if (variantEntry) {
                price = variantEntry.price ?? price;
                stock = variantEntry.stock ?? stock;
            }
        }
        return { price, stock };
    };

    const { price: displayPrice, stock: currentStock } = getDynamicPricing();

    // Auto-sliding effect
    useEffect(() => {
        if (!product?.images || product.images.length <= 1 || isGalleryOpen || zoomActive) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [product?.images, isGalleryOpen, zoomActive]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (contextLoading) return;
            try {
                const qReviews = query(
                    collection(db, 'reviews'),
                    where('productId', '==', productId),
                    where('isApproved', '==', true)
                );
                const reviewsSnap = await getDocs(qReviews);
                const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
                setReviews(reviewsData);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchReviews();
        }
    }, [productId, contextLoading]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoomActive) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product || !store) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
                <PackageX className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Product Not Found</h1>
                <p className="text-gray-500 mb-8 italic">This product might have been removed or doesn't exist.</p>
                <button onClick={() => router.back()} className="text-primary font-black uppercase tracking-widest hover:underline text-[10px]">
                    Go Back
                </button>
            </div>
        );
    }

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store || !product || !reviewForm.name || !reviewForm.comment) return;
        setIsSubmittingReview(true);
        try {
            const newReview: Review = {
                storeId: store.id,
                productId: product.id,
                rating: reviewForm.rating,
                name: reviewForm.name,
                comment: reviewForm.comment,
                isApproved: true,
            };
            const docRef = await addDoc(collection(db, 'reviews'), {
                ...newReview,
                createdAt: serverTimestamp()
            });
            setReviews([{ ...newReview, id: docRef.id, createdAt: new Date() } as Review, ...reviews]);
            setIsReviewOpen(false);
            setReviewForm({ name: '', rating: 5, comment: '' });
        } catch (error) {
            console.error(error);
            alert("Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleAddToCart = () => {
        if (!product || currentStock === 0) return;
        
        // Ensure required extra fields are filled
        const missingFields = product.extraFields?.filter(f => f.required && !extraInputs[f.label]);
        if (missingFields && missingFields.length > 0) {
            alert(`Please fill out required field: ${missingFields[0].label}`);
            return;
        }

        addItem(product, quantity, selectedVariants, extraInputs);
        setIsCartOpen(true);
    };

    const handleBuyNow = () => {
        if (!product || currentStock === 0) return;
        addItem(product, quantity, selectedVariants, extraInputs);
        router.push(`/store/${store.id}/checkout`);
    };

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
    const rawAvg = parseFloat(avgRating);
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating as keyof typeof ratingCounts]++;
    });

    const currency = store.settings?.currency || 'Rs';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0, opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary selection:text-white">
            {/* Elite Responsive Header */}
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/70 backdrop-blur-2xl border-b sticky top-0 z-[60] border-gray-100"
            >
                <div className="w-full mx-auto px-6 lg:px-16 h-24 flex items-center justify-between">
                    <Link href={`/store/${store.id}`} className="flex items-center space-x-4 transition-transform active:scale-95 group">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="h-12 w-12 bg-white flex items-center justify-center rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden relative"
                        >
                            {store.appearance?.logoUrl ? (
                                <Image src={store.appearance.logoUrl} alt={store.name} fill className="object-contain p-2" unoptimized />
                            ) : (
                                <div className="h-full w-full bg-gray-950 text-white flex items-center justify-center font-black italic">
                                    {store.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </motion.div>
                        <h1 className="text-xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors">{store.name}</h1>
                    </Link>
                    <div className="flex items-center space-x-10">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsCartOpen(true)}
                            className="relative group p-2 transition-transform"
                        >
                            <ShoppingBag className="h-7 w-7 text-gray-900 group-hover:text-primary transition-colors" />
                            <AnimatePresence>
                                {items.length > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 h-6 w-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white shadow-2xl"
                                    >
                                        {items.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            <motion.main 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[1600px] 2xl:max-w-screen-2xl mx-auto px-6 lg:px-12 py-8"
            >
                {/* Breadcrumbs */}
                <motion.nav variants={itemVariants} className="flex items-center space-x-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-10">
                    <Link href={`/store/${store.id}`} className="hover:text-primary flex items-center gap-1.5"><Home className="h-3 w-3" /> Home</Link>
                    <ChevronRightIcon className="h-3 w-3" />
                    <span className="hover:text-primary cursor-pointer">{product.categoryId || 'Products'}</span>
                    <ChevronRightIcon className="h-3 w-3" />
                    <span className="text-gray-900">{product.name}</span>
                </motion.nav>

                {/* Product Section: Top Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24">

                    {/* Left Column: Gallery (7 Columns) */}
                    <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8">
                        <div
                            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] group cursor-zoom-in border border-gray-100"
                            onMouseEnter={() => setZoomActive(true)}
                            onMouseLeave={() => setZoomActive(false)}
                            onMouseMove={handleMouseMove}
                            onClick={() => setIsGalleryOpen(true)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.6, ease: "circOut" }}
                                    className="relative w-full h-full"
                                >
                                    {product.images?.[currentImageIndex] ? (
                                        <Image
                                            src={product.images[currentImageIndex]}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-8 md:p-16"
                                            referrerPolicy="no-referrer"
                                            priority
                                            quality={100}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-100 italic font-black uppercase tracking-widest">No Imagery</div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Ultra HD Zoom Overlay */}
                            {zoomActive && product.images?.[currentImageIndex] && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        backgroundImage: `url(${product.images[currentImageIndex]})`,
                                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                        backgroundSize: '400%',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                />
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <motion.button
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${currentImageIndex === idx ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                    >
                                        <Image src={img} alt="Thumb" fill className="object-cover p-2" />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column: Information & Actions (5 Columns) */}
                    <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col pt-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                    <span className="text-sm font-bold text-primary uppercase tracking-widest">{product.categoryId || 'Premium'}</span>
                                </motion.div>
                                <h1 className="text-3xl lg:text-5xl font-black text-gray-950 tracking-tight leading-[1.1]">
                                    {product.name}
                                </h1>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <span className="text-4xl font-black text-gray-950 tracking-tighter">{currency} {displayPrice?.toLocaleString()}</span>
                                    {product.compareAtPrice > displayPrice && (
                                        <span className="text-xl font-bold text-gray-300 line-through tracking-tight">{currency} {product.compareAtPrice.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {(currentStock ?? 0) > 0 ? (
                                        <>
                                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-sm border border-emerald-100">In Stock</span>
                                            {(currentStock ?? 0) <= 5 && (
                                                <motion.span 
                                                    animate={{ opacity: [1, 0.5, 1] }} 
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-sm border border-orange-100 flex items-center gap-1.5"
                                                >
                                                    <Zap className="h-3 w-3 fill-current" /> Selling out fast
                                                </motion.span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-sm border border-red-100">Out of Stock</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-8 pt-6 border-t border-gray-50">
                                {/* Product Variants */}
                                {product.variants && product.variants.map((variant, vIdx) => (
                                    <div key={vIdx} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{variant.name}</p>
                                            <AnimatePresence mode="wait">
                                                <motion.span 
                                                    key={selectedVariants[variant.name]}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-[10px] font-black text-primary uppercase tracking-widest"
                                                >
                                                    Selected: {selectedVariants[variant.name]}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {variant.options.map((opt, i) => (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    key={i}
                                                    onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: opt }))}
                                                    className={`px-6 py-3 rounded-xl border-2 text-[10px] font-bold transition-all ${selectedVariants[variant.name] === opt ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                                                >
                                                    {opt}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {product.extraFields && product.extraFields.length > 0 && (
                                    <div className="space-y-6 pt-6 border-t border-gray-50 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Additional Information Required</p>
                                        <div className="space-y-4">
                                            {product.extraFields.map((field, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <label className="text-[11px] font-bold text-gray-600 block px-1">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    {field.type === 'longtext' ? (
                                                        <textarea 
                                                            value={extraInputs[field.label] || ''}
                                                            onChange={e => setExtraInputs(prev => ({ ...prev, [field.label]: e.target.value }))}
                                                            className="w-full h-32 bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-sm"
                                                            placeholder={`Enter ${field.label}...`}
                                                        />
                                                    ) : (
                                                        <input 
                                                            type={field.type === 'number' ? 'number' : 'text'}
                                                            value={extraInputs[field.label] || ''}
                                                            onChange={e => setExtraInputs(prev => ({ ...prev, [field.label]: e.target.value }))}
                                                            className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-5 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                                                            placeholder={`Enter ${field.label}...`}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quant and Cart */}
                                <div className="flex items-center gap-3 pt-6">
                                    <div className="h-16 w-32 bg-white rounded-2xl border border-gray-200 flex items-center justify-between px-4 shadow-sm text-gray-800 shrink-0">
                                        <motion.button whileTap={{ scale: 0.8 }} disabled={product.stock === 0} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-primary active:scale-95 disabled:opacity-50"><Minus className="h-4 w-4" /></motion.button>
                                        <motion.span key={quantity} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-black">{quantity}</motion.span>
                                        <motion.button whileTap={{ scale: 0.8 }} disabled={product.stock === 0 || quantity >= product.stock} onClick={() => setQuantity(quantity + 1)} className="hover:text-primary active:scale-95 disabled:opacity-50"><Plus className="h-4 w-4" /></motion.button>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleAddToCart}
                                        disabled={currentStock === 0}
                                        className="h-16 w-16 bg-gray-950 text-white rounded-2xl shadow-xl hover:bg-primary transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingBag className="h-6 w-6" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleBuyNow}
                                        disabled={currentStock === 0}
                                        className="h-16 flex-1 bg-yellow-400 text-gray-950 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Zap className="h-4 w-4 fill-current" />
                                        Buy Now
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Section: Detailed Overview */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="pt-20 border-t border-gray-100 mt-12"
                >
                    <div className="max-w-[1000px] mx-auto space-y-16">
                        <div className="space-y-4">
                            <div className="h-1 w-12 bg-primary"></div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Detailed Product Overview</h2>
                        </div>

                        <div className={`relative transition-all duration-1000 ${isDescriptionExpanded ? 'max-h-none' : 'max-h-[800px] overflow-hidden'}`}>
                            {/* Hero Image in Description */}
                            {product.images?.[0] && (
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="relative w-full aspect-video rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-gray-100 bg-gray-50"
                                >
                                    <Image src={product.images[0]} alt="Overview" fill className="object-contain p-12 transition-transform duration-1000 hover:scale-110" />
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
                                </motion.div>
                            )}

                            <div className="space-y-12">
                                <div className={`prose prose-stone prose-xl max-w-none ${isDescriptionExpanded ? '' : 'line-clamp-6'}`}>
                                    <p className="text-4xl font-black text-gray-950 tracking-tighter leading-tight mb-8">
                                        The absolute pinnacle of performance and design in our collection.
                                    </p>
                                    <div className="text-gray-500 leading-relaxed font-bold whitespace-pre-line text-lg italic">
                                        {product.description}
                                    </div>
                                </div>

                                {isDescriptionExpanded && product.description && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 pt-12 border-t border-gray-100"
                                    >
                                        {product.description.split('\n').filter(l => l.includes(':')).map((line, i) => {
                                            const [key, ...val] = line.split(':');
                                            return (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex justify-between items-center border-b border-gray-100/50 pb-5"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{key.trim()}</span>
                                                    <span className="text-sm font-black text-gray-950">{val.join(':').trim()}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>

                            {!isDescriptionExpanded && (
                                <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-20">
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsDescriptionExpanded(true)}
                                        className="bg-gray-950 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/10 transition-all flex items-center gap-4 group"
                                    >
                                        <span>Read Full Report</span>
                                        <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                                    </motion.button>
                                </div>
                            )}
                        </div>

                        {isDescriptionExpanded && (
                            <div className="flex justify-center mt-12">
                                <motion.button
                                    whileHover={{ y: -5 }}
                                    onClick={() => setIsDescriptionExpanded(false)}
                                    className="text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-primary transition-colors group"
                                >
                                    <ChevronDown className="h-4 w-4 rotate-180 group-hover:-translate-y-1 transition-transform" />
                                    Minimize Specifications
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Product Specifications & Payment Partners */}
                <div className="pt-20 border-t border-gray-100 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Features Section */}
                        {product.features?.list && product.features.list.length > 0 && (
                            <div className="space-y-8 pt-20 border-t border-gray-100 animate-in fade-in duration-1000">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{product.features.title || 'Product Highlights'}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {product.features.list.map((item, i) => (
                                        <motion.div 
                                            key={i} 
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="flex items-center gap-4 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 group hover:bg-gray-950 hover:text-white transition-all duration-500 shadow-sm"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 group-hover:bg-white/10 shrink-0 shadow-sm">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-tight leading-tight">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-20">
                            <div className="h-1 w-12 bg-primary"></div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Technical Attributes</h2>
                        </div>
                        
                        <div className="space-y-8">
                            {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                                product.specifications.map((group, gIdx) => (
                                    <motion.div 
                                        key={gIdx} 
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-gray-50/50 rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm p-12 space-y-10"
                                    >
                                        <div className="flex items-center gap-6 border-b border-gray-100 pb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                                <ImageIcon size={24} />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-950 tracking-tighter uppercase">{group.title}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
                                            {group.fields.map((f, fIdx) => (
                                                <div key={fIdx} className="flex justify-between items-center border-b border-gray-100/50 pb-5 last:border-0 md:last:border-b">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{f.title}</span>
                                                    <span className="text-sm font-black text-gray-950">{f.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                    {(() => {
                                        const specLines = product.description?.split('\n').filter(l => l.includes(':')) || [];
                                        if (specLines.length === 0) {
                                            return <div className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 italic">No additional metadata registered</div>;
                                        }
                                        return specLines.map((line, i) => {
                                            const [key, ...val] = line.split(':');
                                            return (
                                                <div key={i} className={`flex flex-col sm:flex-row py-6 px-10 border-b border-gray-100 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/50'} last:border-0`}>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 w-full sm:w-1/3 mb-1 sm:mb-0">{key.trim()}</span>
                                                    <span className="text-sm font-black text-gray-950 w-full sm:w-2/3">{val.join(':').trim()}</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Payment Partners */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Authorized Payments</h2>
                        </div>
                        <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-12 flex flex-col items-center gap-8 justify-center shadow-sm">
                            <div className="flex items-center gap-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-help">
                                <span className="text-red-600 font-black text-2xl tracking-tighter italic">fone<span className="text-black">pay</span></span>
                                <span className="text-purple-700 font-black text-2xl tracking-tighter">khalti</span>
                            </div>
                            <div className="h-px w-full bg-gray-200" />
                            <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-help">
                                <span className="text-emerald-500 font-black text-2xl tracking-tighter flex items-center gap-1"><Zap className="h-6 w-6 fill-current" />Sewa</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Ratings & Reviews */}
                <div className="pt-20 border-t border-gray-100 mt-20 space-y-12">
                    <motion.h2 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-black uppercase tracking-tighter text-gray-900"
                    >
                        Community Sentiment
                    </motion.h2>
                    <div className="flex flex-col lg:flex-row gap-12 border-b border-gray-100 pb-12">
                        {/* Summary */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="lg:w-1/3 bg-gray-900 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl"
                        >
                            <h3 className="text-7xl font-black text-white tracking-tighter">{avgRating}</h3>
                            <div className="flex text-white/10 gap-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-6 w-6 ${i < Math.round(rawAvg) ? 'text-yellow-400 fill-current' : 'fill-current'}`} />)}
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-40">{totalReviews} Verified Ratings</p>
                        </motion.div>
                        {/* Progress Bars */}
                        <div className="lg:w-2/3 space-y-4 flex flex-col justify-center">
                            {[5, 4, 3, 2, 1].map((stars, i) => (
                                <motion.div 
                                    key={stars} 
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-6"
                                >
                                    <div className="flex items-center gap-2 w-16 text-xs font-black text-gray-400 justify-end uppercase tracking-widest">
                                        {stars} <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: totalReviews > 0 ? `${(ratingCounts[stars as keyof typeof ratingCounts] / totalReviews) * 100}%` : '0%' }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-gray-950 rounded-full"
                                        />
                                    </div>
                                    <div className="w-12 text-right text-[10px] font-black text-gray-300 uppercase tracking-widest">{ratingCounts[stars as keyof typeof ratingCounts]}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12 pb-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Share your experience</h3>
                                <p className="text-sm font-bold text-gray-400 italic">Insights help our community grow stronger.</p>
                            </div>
                            {!isReviewOpen && (
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsReviewOpen(true)} 
                                    className="px-10 py-5 bg-white border-4 border-gray-900 rounded-2xl font-black text-[10px] text-gray-900 uppercase tracking-[0.3em] hover:bg-gray-950 hover:text-white transition-all shadow-xl"
                                >
                                    Register Feedback
                                </motion.button>
                            )}
                        </div>

                        <AnimatePresence>
                            {isReviewOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-inner space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center gap-12">
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Level of Approval</label>
                                                <div className="flex gap-4">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <motion.button
                                                            whileHover={{ scale: 1.2 }}
                                                            whileTap={{ scale: 0.8 }}
                                                            type="button"
                                                            key={s}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star className={`h-8 w-8 transition-colors ${s <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Identifier / Alias</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={reviewForm.name}
                                                    onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                                                    className="w-full px-8 py-5 rounded-2xl bg-white border border-gray-100 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/5 outline-none font-bold text-sm transition-all shadow-sm"
                                                    placeholder="e.g. Maverick"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">The Narrative</label>
                                            <textarea
                                                required
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                className="w-full px-8 py-6 rounded-3xl bg-white border border-gray-100 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/5 outline-none min-h-[160px] font-bold text-sm leading-relaxed transition-all shadow-sm"
                                                placeholder="Enumerate your findings..."
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                type="submit"
                                                disabled={isSubmittingReview}
                                                className="px-12 py-5 rounded-2xl font-black text-[10px] text-white bg-gray-950 uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50"
                                            >
                                                {isSubmittingReview ? 'Processing...' : 'Broadcast Review'}
                                            </motion.button>
                                            <button
                                                type="button"
                                                onClick={() => setIsReviewOpen(false)}
                                                className="px-8 py-5 rounded-2xl font-black text-[10px] text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.length === 0 ? (
                                <div className="md:col-span-2 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100 p-24 text-center">
                                    <Eye className="h-12 w-12 text-gray-100 mx-auto mb-6" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic">No transmission data available</p>
                                </div>
                            ) : (
                                reviews.map((rev, idx) => (
                                    <motion.div 
                                        key={rev.id || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        viewport={{ once: true }}
                                        className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-900/5 space-y-6 hover:shadow-2xl transition-all duration-500 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-400 text-xs shadow-inner">
                                                    {rev.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-black text-sm uppercase tracking-tighter text-gray-900 group-hover:text-primary transition-colors">{rev.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">
                                                {rev.createdAt?.seconds
                                                    ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString()
                                                    : new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 text-yellow-500">
                                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-current' : 'text-gray-100'}`} />)}
                                        </div>
                                        <p className="text-gray-600 font-bold text-sm leading-relaxed italic line-clamp-4">{rev.comment}</p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.main>

            {/* Premium Full-Screen Interactive Gallery */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col pt-24"
                    >
                        <button
                            onClick={() => setIsGalleryOpen(false)}
                            className="absolute top-10 right-10 h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all z-[110] shadow-2xl"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="flex-1 flex items-center justify-center p-8 md:p-32 relative overflow-hidden">
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + (product.images?.length || 0)) % (product.images?.length || 1)); }}
                                className="absolute left-12 h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center hover:scale-125 transition-all shadow-3xl z-50 disabled:hidden active:scale-95"
                                disabled={product.images?.length === 1}
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>

                            <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ x: 200, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -200, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="w-full h-full flex items-center justify-center"
                                >
                                    {product.images?.[currentImageIndex] && (
                                        <div className="relative w-full h-full max-w-[1200px]">
                                            <Image
                                                src={product.images[currentImageIndex]}
                                                alt="Elite Gallery"
                                                fill
                                                className="object-contain"
                                                quality={100}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % (product.images?.length || 1)); }}
                                className="absolute right-12 h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center hover:scale-125 transition-all shadow-3xl z-50 disabled:hidden active:scale-95"
                                disabled={product.images?.length === 1}
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </div>

                        <div className="h-40 flex items-center justify-center gap-6 px-16 overflow-x-auto bg-gray-50/50">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-28 h-28 rounded-[3rem] flex-shrink-0 overflow-hidden border-2 transition-all duration-700 bg-white ${currentImageIndex === idx ? 'border-primary ring-[12px] ring-primary/10 scale-110 shadow-3xl' : 'border-transparent opacity-20 shadow-none hover:opacity-100 hover:scale-105'}`}
                                >
                                    <Image src={img} alt="Gallery Thumb" fill className="object-cover p-3" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Elite Footer */}
            <footer className="bg-gray-50/50 border-t border-gray-100 py-32 px-12 text-center mt-32 rounded-t-[5rem]">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="flex justify-center items-center space-x-4">
                        <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center font-black italic">V</div>
                        <span className="text-2xl font-black uppercase tracking-tighter">{store.name}</span>
                    </div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.6em] mb-12">&copy; {new Date().getFullYear()} &bull; POWERED BY CREATEVENDOR.SHOP</p>
                    <div className="flex justify-center gap-12 text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">
                        <Link href={`/store/${store.id}/privacy`} className="hover:text-primary transition-colors">Digital Privacy</Link>
                        <Link href={`/store/${store.id}/terms`} className="hover:text-primary transition-colors">Protocol Terms</Link>
                        <Link href={`/store/${store.id}/contact`} className="hover:text-primary transition-colors">Access Hubs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

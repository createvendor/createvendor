'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
    X,
    Save,
    Monitor,
    Tablet,
    Smartphone,
    Link2,
    Layers,
    FileText,
    GripVertical,
    Search,
    Type,
    Square,
    ImageIcon,
    Minus,
    Maximize2,
    Layout,
    Plus,
    Trash2,
    AlignCenter,
    AlignLeft,
    AlignRight,
    ShoppingBag,
    Mail,
    ChevronUp,
    RefreshCw,
    MoreVertical,
    ChevronRight,
    ArrowRight,
    MapPin,
    HelpCircle,
    FileCode,
    Tag,
    Users,
    MousePointer2,
    Settings,
    Palette,
    Circle,
    CheckCircle2,
    Eye,
    Box,
    CreditCard,
    Grid,
    CloudUpload,
    Facebook,
    Instagram,
    Twitter,
    Clock
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

// Testimonial Carousel Section Component
const TestimonialCarousel = ({ testimonials, speed = 15 }: { testimonials: any[], speed?: number }) => {
    const list = [...testimonials, ...testimonials, ...testimonials]; // Triple for infinite effect
    if (!testimonials.length) return null;
    return (
        <div className="w-full relative overflow-hidden py-4">
            <motion.div
                key={speed + testimonials.length} // Force re-animation on speed change
                className="flex gap-6"
                animate={{ x: ["0%", "-33.333%"] }}
                transition={{ duration: testimonials.length * (31 - speed) * 0.4, repeat: Infinity, ease: "linear" }}
                style={{ width: "max-content" }}
            >
                {list.map((t, i) => (
                    <div key={i} className="w-[240px] md:w-[280px] shrink-0 bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col group">
                        <div className="relative h-40 w-full">
                            <Image src={t.image || 'https://via.placeholder.com/100'} alt={t.name} fill className="object-cover" unoptimized />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 px-2 py-1 rounded-lg text-[8px] font-black border border-white">
                                [{t.rating || 5}]
                            </div>
                        </div>
                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                            <p className="text-[11px] font-semibold text-gray-400 leading-relaxed italic tracking-tight">"{t.quote}"</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold text-gray-950 tracking-tight">{t.name}</h4>
                                    <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest">{t.role || 'VERIFIED BUYER'}</p>
                                </div>
                                <span className="text-[7px] font-black text-gray-200 uppercase tracking-widest">{t.date || 'FEB 2026'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// Types
interface VisualBlock {
    id: string;
    type: string;
    name: string;
    settings: Record<string, any>;
}

const PREMADE_COMPONENTS = [
    { type: 'hero', name: 'Hero Section With Video Popup', defaultSettings: { shortTitle: 'Sustainable Furniture', title: 'Quality Furniture for Every Room', description: 'From living rooms to bedrooms...', firstButtonText: 'Explore Now', firstButtonUrl: '/shop', watchButtonIcon: 'play', secondButtonText: 'Watch Now', youtubeUrl: 'https://', imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Hero-furniture.png' } },
    { type: 'countdown_7', name: 'Countdown Timer - 7', previewImage: 'https://cdn.zalient.shop/components/1774593808451_2d4aaf018e31a817.webp', defaultSettings: { title: 'Our Blogs', description: 'Get Selected items with good price', buttonText: 'Shop Now', buttonUrl: '#', imageUrl: 'https://cdn.zalient.shop/components/1774593808451_2d4aaf018e31a817.webp' } },
    { type: 'countdown_6', name: 'Countdown Timer - 6', previewImage: 'https://cdn.zalient.shop/components/1774341995302_01b245ad5bbdebf9.webp', defaultSettings: { title: 'Hurry Up Sale Ends In', buttonText: 'Get This Offer', buttonUrl: '#', badgeText: 'OFFER', imageUrl: 'https://cdn.zalient.shop/components/1774341995302_01b245ad5bbdebf9.webp' } },
    { type: 'hero_12', name: 'Hero Section 12', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/heros/hero-12.png', defaultSettings: { topBadge: 'NEW COLLECTION 2026', title: 'Payments tool for software companies', buttonText: 'Get Started', buttonUrl: '#', bgImageUrl: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5c455494-eee9-40e3-9575-8d2fea84d21a_1600w.webp', imageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png', card1Heading: 'WHY CHOOSE US', card1Icon1: 'A', card1Title1: 'Free Shipping', card1Desc1: 'On every order. everywhere', card1Icon2: 'S', card1Title2: 'Easy returns', card1Desc2: '30-day money-back guarantee', card1Icon3: 'P', card1Title3: 'Sustainably made', card1Desc3: 'Eco-friendly materials', card2Heading: 'NEW ARRIVALS', card2ImageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png', card2Text: 'COMING SOON' } },
    { type: 'hero_39', name: 'Hero Section 39', defaultSettings: { title: 'Hurry Up Sale Ends In', description: 'Crafted for women who embrace both tradition and trend.', buttonText: 'Get This Offer', buttonUrl: '#', bgImageUrl: 'https://i.ibb.co/7x2gLc4x/back.png', imageUrl: 'https://cdn.zalient.shop/components/1774416264251_9b44248432fbaffe.webp', thumb1: 'https://i.ibb.co/SZnRftL/first.png', thumb2: 'https://i.ibb.co/21DsPjxy/second.png', thumb3: 'https://i.ibb.co/WvY0dbrs/third.png', thumb4: 'https://i.ibb.co/932pzNhm/fourth.png', thumb5: 'https://i.ibb.co/Zpdfpdb2/fifth.png' } },
    { type: 'how_it_works_2', name: 'How It Works 2', previewImage: 'https://ik.imagekit.io/createvendor/how%20it%20works-1.png', defaultSettings: { heading: 'Winter Clearance Sale', step1Title: 'Browse Products', step1Desc: 'Explore our wide range of products across categories like groceries, electronics, fashion, and more.', step2Title: 'Add to Cart', step2Desc: 'Select your favorite items and add them to your cart. Check offers, choose quantities, and customize options.', step3Title: 'Place Order & Enjoy', step3Desc: 'Proceed to checkout, select your delivery address, and pay securely. Sit back and relax while we deliver.', imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/8.png' } },
    { type: 'trusted_by_4', name: 'Trusted By 4', previewImage: 'https://ik.imagekit.io/createvendor/trusted%20by.png', defaultSettings: { title: 'Trusted Partners', description: 'Trusted by leading brands and satisfied customers worldwide, we deliver quality products you can rely on.', logo1: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-4.png', logo2: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-6.png', logo3: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/7.png', logo4: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/8.png', imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-4.png' } },
    { type: 'trusted_by_2', name: 'Trusted By 2', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/trusted-by/trusted-by-2.png', defaultSettings: { title: 'Trusted by 4500+ companies worldwide', logo1: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-6.png', logo2: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-7.png', logo3: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/7.png', logo4: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/8.png', logo5: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-4.png' } },
    { type: 'product_showcase_9', name: 'Product Showcase 9', defaultSettings: { badge: 'PREMIUM HEADPHONES', imageName: 'Aurora X-500', productTitle: 'Wireless Over-Ear Headphones', imageUrl: 'https://img.freepik.com/premium-photo/pair-headpho%E2%80%A6e-band-that-says-number-3_984237-83953.jpg?w=1480', feat1Tag: 'HIGH FIDELITY SOUND', feat1Title: 'Immersive Audio Experience', feat1Desc: 'Equipped with 50mm drivers and advanced noise-cancellation for rich, clear, and immersive sound in every note.', feat2Tag: 'WIRELESS FREEDOM', feat2Title: 'Bluetooth 5.3 Connectivity', feat2Desc: 'Seamless connection with all devices, low latency for gaming, and up to 40 hours of battery life on a single charge.', feat3Tag: 'COMFORT & DESIGN', feat3Title: 'Ergonomic Over-Ear Fit', feat3Desc: 'Soft memory foam ear cushions and lightweight design for long listening sessions without fatigue.', feat4Tag: 'SMART CONTROLS', feat4Title: 'Touch & Voice Integration', feat4Desc: 'Intuitive touch controls for play/pause, skip tracks, and volume, plus voice assistant compatibility for hands-free use.' } },
    { type: 'product_highlights_9', name: 'Product Highlights 9', previewImage: 'https://ik.imagekit.io/createvendor/heightlight%209.png', defaultSettings: { badge: 'Product Highlights', heading: 'PREMIUM HEADPHONES', description: 'Each product is crafted with care to provide unmatched quality, comfort, and usability for our customers.', feat1Title: 'Premium Quality', feat1Desc: 'Made from high-quality materials to ensure durability, comfort, and long-lasting performance.', feat1Img: 'https://i.ibb.co/ycL1Wt67/feature-1.avif', feat2Title: 'Eco-Friendly', feat2Desc: 'Environmentally conscious materials and sustainable production methods reduce our carbon footprint.', feat2Img: 'https://i.ibb.co/QFvCJKvX/featurenext.jpg', feat3Title: 'Customizable', feat3Desc: 'Choose colors, sizes, and designs to create a product that perfectly suits your style.', feat3Img: 'https://i.ibb.co/HfSdCFhH/anotehr.jpg', feat4Title: 'Warranty Included', feat4Desc: 'Every purchase comes with our exclusive warranty and responsive customer support team.', feat4Img: 'https://i.ibb.co/Td2BwYJ/ecology-tooth-brush-comb.jpg' } },
    { type: 'countdown', name: 'Countdown Timer - 5', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/timer/timer-1.png', defaultSettings: { title: 'Featured Products', description: "Grab the best deals before they're gone!", buttonText: 'Buy Now', buttonUrl: '#', date: 'Jan 11, 2026', time: '', imageUrl: 'https://api.zalient.shop/assets/ui-icons/components/timer/timer-1.png' } },
    { type: 'sales_1', name: 'Sales 1', defaultSettings: { title: 'To get 30% off?', description: 'Sign up our newsletter today and get 10% off your very first online order with us', buttonText: 'Buy Now', buttonUrl: '#', imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Object.png' } },
    { type: 'sales_2', name: 'Sales 2', defaultSettings: { title: 'To get 30% off?', description: 'Sign up our newsletter today and get 10% off your very first online order with us', buttonText: 'Buy Now', buttonUrl: '#', imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Group-9475.png' } },
    { type: 'sales_3', name: 'Sales 3', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/sales/sales-3.png', defaultSettings: { title: 'To get 30% off?', description: 'Sign up our newsletter today and get 10% off your very first online order with us', badgeText: 'WOW!', imagePosition: '0', buttonText: 'GET NOW', buttonUrl: '#', imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Group-9477-2.png' } },
    { type: 'not_found_11', name: 'Not Found 11', previewImage: 'https://ik.imagekit.io/createvendor/note%20found%2011.png', defaultSettings: { message: "This page you are looking for might have been moved or doesn't exist.", homeUrl: '/', homeText: 'Go Home', backText: 'Back' } },
    { type: 'not_found_3', name: 'Not Found 3', previewImage: 'https://ik.imagekit.io/createvendor/note%20found%203.png', defaultSettings: { badge: 'ERROR_CODE_404', message: "The page you're looking for doesn't exist or has been moved.", homeUrl: '/', homeText: 'Go Home', backText: 'Go Back' } },
    { type: 'not_found_5', name: 'Not Found 5', previewImage: 'https://ik.imagekit.io/createvendor/note%20found%205.png', defaultSettings: { message: 'Nothing to see here.', homeUrl: '/', homeText: 'Go Home', imageUrl: 'https://cdn-icons-png.flaticon.com/512/1674/1674773.png' } },
    { type: 'not_found_6', name: 'Not Found 6', previewImage: 'https://ik.imagekit.io/createvendor/note%20found%206.png', defaultSettings: { subtitle: 'LOST IN SPACE', message: "The coordinates you entered don't exist in this dimension. Check the URL or head back to the docking station.", homeUrl: '/', homeText: 'HOME', backText: 'BACK' } },
    { type: 'countdown_2', name: 'Countdown Timer 2', previewImage: 'https://ik.imagekit.io/createvendor/timer-2.png', defaultSettings: { badge: 'Limited time offer', title: 'Summer Sale', subTitle: 'Up to 30% OFF', description: "Grab the best deals before they're gone!", buttonText: 'Buy Now - 30% OFF', buttonUrl: '#', date: 'Jan 1, 2026', time: '12:00', imageUrl: 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png' } },
    { type: 'countdown_3', name: 'Countdown Timer 3', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/timer/timer-3.png', defaultSettings: { badge: 'LIMITED EDITION', title: 'The Autumn Essentials kit', description: '"Grab the best deals before they\'re gone!"', buttonText: 'BUY NOW - 30% OFF', buttonUrl: '#', date: 'Jan 1, 2026', time: '12:00', image1: 'https://media.wired.com/photos/68c090e880d4121aa5a6c04c/4:3/w_640,c_limit/iPhone17-Pro-and-ProMAX-Gear-DSC_5918.jpg', image2: 'https://www.bgr.com/img/gallery/samsung-galaxy-s26-ultra-price-release-date/intro-1773078529.jpg' } },
    { type: 'checkout_1', name: 'Premium Checkout', previewImage: 'https://ik.imagekit.io/createvendor/checkout-1.png?updatedAt=1774625087607', defaultSettings: { title: 'Checkout', step1: 'Contact Information', step2: 'Shipping Essentials', step3: 'Secure Payment', buttonText: 'Authorize Payment', showLogistics: true } },
    { type: 'contact_1', name: 'Contact Form', previewImage: 'https://ik.imagekit.io/createvendor/contact-1.png', defaultSettings: { title: 'Contact Us', subtitle: 'Feel free to reach out to our team with any questions or feedback.', formTitle: 'Send Us a Message', address: 'Kirtipur, Kathmandu, Nepal', phone: '+977 986559060', email: 'hello@createvendor.com', openHours: 'Monday - Friday: 10:00 AM - 5:00 PM', addressIcon: 'location', phoneIcon: 'call', emailIcon: 'message', hoursIcon: 'clock', buttonText: 'Send Message' } },
    { type: 'testimonial_1', name: 'Testimonials', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/testimonials/testimonial-1.png', defaultSettings: { title: 'What Our Clients Say', subtitle: 'REVIEWS', speed: 15, testimonials: [{ name: 'John Doe', role: 'CEO, TechCorp', quote: 'This is an amazing product! Highly recommended.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces', rating: 5, date: 'Dec 2025' }, { name: 'Sophia Lee', role: 'Fashion Blogger', quote: 'Great quality and excellent customer service.', image: 'https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg', rating: 5, date: 'Jan 2026' }, { name: 'Rajesh Sharma', role: 'Home Interior Designer', quote: 'The product quality exceeded my expectations.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces', rating: 5, date: 'Feb 2026' }] } },
    { type: 'testimonial_2', name: 'Insights Slider', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/testimonials/testimonial-4.png', defaultSettings: { title: 'Authentic Insights', subtitle: 'OUR BLOGS', testimonials: [{ name: 'John Doe', role: 'CEO, TechCorp', quote: 'This is an amazing product! Highly recommended.', image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/477cc240-09a0-4a31-afc6-f701a13e30d8_800w.webp' }, { name: 'Sophia Lee', role: 'Verified Buyer', quote: 'The quality perfectly matches my style.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces' }, { name: 'Michael Smith', role: 'Tech Enthusiast', quote: 'A truly game-changing experience for our team.', image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop&crop=faces' }, { name: 'Anna J.', role: 'Designer', quote: 'Modern, sleek, and incredibly functional.', image: 'https://i.ibb.co/RpStGhqm/IMG-5251-Original.jpg' }] } },
    { type: 'footer_12', name: 'Footer 12', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/footers/footer-12.png', defaultSettings: { showMadeWith: true, showSocial: true, showPan: true, panNumber: '140881501', legalTitle: 'LEGAL', contactTitle: 'CONTACT US', socialTitle: 'FOLLOW US', copyrightText: '© 2026 Your Store. All rights reserved.', email: 'hello@createvendor.com', phone: '+977 9828138995', logoUrl: '', fbUrl: '', igUrl: '', ttUrl: '' } },
    { type: 'branch_1', name: 'Branches 1', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/branches/branches-1.png', defaultSettings: { title: 'Our Branches', description: 'Visit us at any of our convenient locations. We\'re here to serve you!', mapUrl: '', mapHeight: '400', showMap: true, branches: [{ name: 'Main Branch', address: 'Kirtipur, Kathmandu', phone: '9827801575', hours: 'Mon - Sun: 9:00 AM - 8:00 PM' }] } },
    { type: 'branch_2', name: 'Branches 2', previewImage: 'https://api.zalient.shop/assets/ui-icons/components/branches/branches-2.png', defaultSettings: { title: 'Our Branches', description: 'Visit us at any of our convenient locations. We\'re here to serve you!', mapUrl: '', mapHeight: '450', showMap: true, branches: [{ name: 'Main Branch', address: 'Kirtipur, Kathmandu', phone: '9827801575', hours: 'Mon - Sun: 9:00 AM - 8:00 PM' }] } }
];


interface PageConfig {
    id: string;
    name: string;
    path: string;
    type: string;
}

interface ReusableBlock {
    id: string;
    name: string;
    type: string;
    isActive?: boolean;
}

export default function VisualEditorPage() {
    const rawParams = useParams();
    const storeId = rawParams?.storeId as string;
    const router = useRouter();
    const { showToast } = useToast();

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [store, setStore] = useState<any>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [blocks, setBlocks] = useState<VisualBlock[]>([]);
    const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [activeSidebarTab, setActiveSidebarTab] = useState<'pages' | 'blocks' | 'components'>('blocks');
    const [activePageId, setActivePageId] = useState('home');
    const [activeReusableBlockId, setActiveReusableBlockId] = useState('minimal_card');
    const [isComponentBrowserOpen, setIsComponentBrowserOpen] = useState(false);
    const [browserCategory, setBrowserCategory] = useState('New');

    // Brand Settings State
    const [brandColor, setBrandColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [manualOverride, setManualOverride] = useState(false);
    const [brandFont, setBrandFont] = useState('Poppins');

    const pages: PageConfig[] = [
        { id: 'layout', name: 'Layout', path: 'Main/Layout', type: 'system' },
        { id: 'home', name: 'Home Page', path: '/', type: 'main' },
        { id: 'search', name: 'Search Page', path: '/search', type: 'main' },
        { id: 'checkout', name: 'Checkout Page', path: '/checkout', type: 'main' },
        { id: 'contact', name: 'Contact Page', path: '/contact', type: 'content' },
        { id: 'product_detail', name: 'Product Details Page', path: '/products/[id]', type: 'detail' },
    ];

    const reusableBlocks: ReusableBlock[] = [
        { id: 'minimal_card', name: 'Product Card - Minimal ca...', type: 'PRODUCT CARD' },
        { id: 'mobile_view', name: 'Product Card - Like Mobile View', type: 'PRODUCT CARD' },
        { id: 'minimalistic', name: 'Minimalistic Product Card', type: 'PRODUCT CARD' },
        { id: 'dark_hero', name: 'Dark Hero Product Card', type: 'PRODUCT CARD' },
        { id: 'immersive', name: 'Product Card - Immersive Portr...', type: 'PRODUCT CARD' },
        { id: '3d_hover', name: 'Product Card - 3D Hover Minimal', type: 'PRODUCT CARD' },
        { id: 'horizon', name: 'Product Card - Minimal Horizon...', type: 'PRODUCT CARD' },
        { id: 'sleek', name: 'Product Card - Sleek Shop Card', type: 'PRODUCT CARD' },
        { id: 'classic', name: 'Product Card - Classic', type: 'PRODUCT CARD' },
    ];

    useEffect(() => {
        const fetchStore = async () => {
            if (!storeId) return;
            try {
                const snap = await getDoc(doc(db, 'stores', storeId));
                if (snap.exists()) {
                    const data = snap.data();
                    setStore({ id: snap.id, ...data });
                    const layoutKey = activePageId === 'home' || !activePageId ? 'visualLayout' : `visualLayout_${activePageId}`;
                    const pageBlocks = (data[layoutKey] && data[layoutKey].length > 0) ? data[layoutKey] : (activePageId === 'home' ? [
                        {
                            id: 'h1', type: 'hero', name: 'Hero Section With Video Popup', settings: {
                                shortTitle: 'Sustainable Furniture',
                                title: 'Quality Furniture for Every Room',
                                description: 'From living rooms to bedrooms, our high-quality furniture collections offer something for every space.',
                                firstButtonText: 'Explore Now',
                                firstButtonUrl: '/shop',
                                watchButtonIcon: 'play',
                                secondButtonText: 'Watch Now',
                                youtubeUrl: 'https://www.youtube.com/embed/',
                                imageUrl: 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Hero-furniture.png'
                            }
                        },
                        { id: 'p1', type: 'featured_products', name: 'Featured Products', settings: { title: 'Featured', count: 4 } },
                        { id: 'f1', type: 'footer', name: 'Main Footer', settings: {} }
                    ] : []);
                    setBlocks(pageBlocks);
                    if (data.appearance?.brandColor) setBrandColor(data.appearance.brandColor);
                    if (data.appearance?.brandFont) setBrandFont(data.appearance.brandFont);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, [storeId, activePageId]); // Added activePageId to dependencies

    const handleSave = async () => {
        setSaving(true);
        try {
            const storeRef = doc(db, 'stores', storeId);
            const layoutKey = activePageId === 'home' || !activePageId ? 'visualLayout' : `visualLayout_${activePageId}`;
            await updateDoc(storeRef, {
                [layoutKey]: JSON.parse(JSON.stringify(blocks)),
                updatedAt: serverTimestamp(),
                'appearance.brandColor': brandColor,
                'appearance.brandFont': brandFont,
                lastVisualUpdate: serverTimestamp(),
                template: 'visual'
            });
            showToast(`Saved ${blocks.length} blocks to ${layoutKey}`, 'success');
        } catch (err) {
            showToast('Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (comp: any) => {
        const newBlock: VisualBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type: comp.type,
            name: comp.name,
            settings: comp.defaultSettings || {}
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const updateBlockSetting = (id: string, key: string, value: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, settings: { ...b.settings, [key]: value } } : b));
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white text-gray-400 italic">Synchronizing Workspace...</div>;

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div className="h-screen flex flex-col bg-[#F3F4F6] text-[#333] font-sans overflow-hidden">
            {/* Top Navigation */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-[100] shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-black p-1"><X size={18} /></button>
                    <div className="h-7 w-7 bg-black rounded flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white italic">Z</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">Visual Editor</span>
                    <div className="h-4 w-px bg-gray-200 mx-2" />
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Editing: {pages.find(p => p.id === activePageId)?.name || 'Home Page'}</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center h-8 bg-gray-50 border border-gray-200 rounded-full px-4 gap-2 min-w-[350px] justify-center text-[11px] text-gray-400">
                    <Link2 size={12} />
                    <span className="font-normal truncate">https://{storeId}.zalient.shop{pages.find(p => p.id === activePageId)?.path === '/' ? '' : pages.find(p => p.id === activePageId)?.path}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-100 rounded-lg bg-white p-0.5">
                        <button onClick={() => setViewport('desktop')} className={`px-3 py-1.5 rounded-md ${viewport === 'desktop' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}><Monitor size={14} /></button>
                        <button onClick={() => setViewport('tablet')} className={`px-3 py-1.5 rounded-md ${viewport === 'tablet' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}><Tablet size={14} /></button>
                        <button onClick={() => setViewport('mobile')} className={`px-3 py-1.5 rounded-md ${viewport === 'mobile' ? 'bg-gray-100 text-black' : 'text-gray-400'}`}><Smartphone size={14} /></button>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="h-10 px-6 bg-[#3B82F6] text-white text-[11px] font-bold rounded-md hover:bg-blue-600 flex items-center gap-2 transition-all">
                        {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={14} />} Save Design
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-30">
                    <div className="flex items-center border-b border-gray-100 p-2 gap-1 bg-gray-50/50">
                        {[{ id: 'components', icon: <Layers size={12} /> }, { id: 'pages', icon: <FileText size={12} /> }, { id: 'blocks', icon: <Grid size={12} /> }].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSidebarTab(tab.id as any)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeSidebarTab === tab.id ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.icon} {tab.id}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeSidebarTab === 'blocks' && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-2 transition-all duration-300">
                                <div className="p-4 border-b border-gray-50 bg-gray-50/20">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">REUSABLE BLOCKS</span>
                                    <span className="text-[9px] text-gray-400 font-medium tracking-tight">Apply presets everywhere</span>
                                </div>
                                <div className="p-4 bg-gray-50/50 text-[10px] font-black text-gray-300 uppercase tracking-widest">PRODUCT CARD</div>
                                <div className="p-3 space-y-1">
                                    {reusableBlocks.map((block) => (
                                        <button
                                            key={block.id}
                                            onClick={() => setActiveReusableBlockId(block.id)}
                                            className={`w-full group flex items-center gap-3 p-3 rounded-lg border transition-all ${activeReusableBlockId === block.id ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' : 'bg-white border-transparent hover:bg-gray-50 text-gray-500'}`}
                                        >
                                            <div className={`h-8 w-8 rounded flex items-center justify-center border ${activeReusableBlockId === block.id ? 'bg-white border-[#BFDBFE] text-blue-500' : 'bg-gray-100 border-gray-100'}`}>
                                                <Settings size={14} />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="text-[11px] font-bold truncate tracking-tight">{block.name}</p>
                                                <p className="text-[9px] opacity-70 truncate tracking-tight">{activeReusableBlockId === block.id ? 'Active' : 'Click to activate'}</p>
                                            </div>
                                            {activeReusableBlockId === block.id && <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSidebarTab === 'pages' && (
                            <div className="p-4 space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STORE PAGES</span>
                                    <Plus size={14} className="text-gray-300" />
                                </div>
                                {pages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => setActivePageId(page.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${activePageId === page.id ? 'bg-blue-50 border-blue-100 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <FileText size={14} className={activePageId === page.id ? 'text-blue-500' : 'text-gray-300'} />
                                        <div className="text-left">
                                            <p className="text-[11px] font-bold tracking-tight">{page.name}</p>
                                            <p className="text-[9px] opacity-50 tracking-tight">{page.path}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeSidebarTab === 'components' && (
                            <div className="p-4 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                <button onClick={() => setIsComponentBrowserOpen(true)} className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                                    <span className="text-xl leading-none -mt-0.5">✧</span> Browse All Components
                                </button>
                                <div>
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                                        <span>PREMADE BLOCKS</span>
                                        <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PREMADE_COMPONENTS.map((comp, i) => (
                                            <button
                                                key={i}
                                                onClick={() => addBlock(comp)}
                                                className="flex flex-col items-center justify-center p-3 h-24 bg-white border border-gray-100 rounded-lg hover:border-blue-500 hover:bg-blue-50/10 transition-all group shadow-sm hover:shadow"
                                            >
                                                <div className="w-full flex-1 mb-2 bg-gray-50 rounded flex items-center justify-center border border-gray-100 group-hover:border-blue-200 overflow-hidden">
                                                    {comp.type === 'hero' && <div className="h-4 w-full bg-blue-100 mx-2 rounded-sm relative"><div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-50"></div></div>}
                                                    {comp.type === 'countdown' && <div className="h-4 w-full bg-gray-200 mx-2 flex gap-1 items-center px-1"><div className="h-2 w-2 bg-white rounded-full"></div></div>}
                                                    {comp.type === 'sales_1' && <div className="h-6 w-full bg-teal-500 mx-2 rounded-sm" />}
                                                    {comp.type === 'sales_2' && <div className="h-6 w-full bg-gray-100 mx-1 border border-gray-200" />}
                                                </div>
                                                <span className="text-[9px] text-gray-500 font-bold tracking-tight text-center leading-tight">{comp.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto bg-[#E5E7EB] relative flex flex-col items-center p-12 custom-scrollbar">
                    <div className={`bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col transition-all duration-500 ${viewport === 'mobile' ? 'w-[375px] h-[667px]' : viewport === 'tablet' ? 'w-[768px] h-[1024px]' : 'w-full max-w-5xl min-h-[90vh]'} mb-20 relative`}>
                        <header className="h-16 px-10 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white shadow-sm z-10">
                            <div className="flex items-center gap-10">
                                <div className="h-8 w-8 bg-black rounded flex items-center justify-center text-white font-bold italic text-xs">{store?.name?.charAt(0)}</div>
                                <span className="font-bold text-sm tracking-tighter uppercase">{store?.name}</span>
                            </div>
                            <div className="hidden md:flex gap-8 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                <span className="text-black border-b-2 border-black pb-1">Home</span>
                                <span>Shop</span><span>Archive</span><span>Contact</span>
                            </div>
                            <div className="flex gap-6 items-center text-gray-400"><Search size={18} /><ShoppingBag size={18} /></div>
                        </header>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                            {/* BLOCK RENDERER - ACTUAL VISUAL PREVIEW */}
                            {blocks.map((block) => (
                                <div
                                    key={block.id}
                                    onClick={() => setSelectedBlockId(block.id)}
                                    className={`relative group cursor-pointer border-2 transition-all ${selectedBlockId === block.id ? 'border-blue-500 bg-blue-50/5' : 'border-transparent hover:border-blue-100 hover:bg-gray-50/30'}`}
                                >
                                    {/* Action Bar */}
                                    {selectedBlockId === block.id && (
                                        <div className="absolute -top-10 left-0 bg-blue-500 text-white flex items-center gap-4 px-3 py-1.5 rounded-t-lg shadow-lg z-50">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{block.name}</span>
                                            <div className="h-3 w-px bg-white/20 mx-1" />
                                            <button onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))} className="hover:text-red-300"><Trash2 size={12} /></button>
                                        </div>
                                    )}

                                    {/* Component Logic */}
                                    {block.type === 'hero' && (
                                        <div className="flex bg-white w-full border-b border-gray-100 min-h-[500px]">
                                            <div className="w-1/2 flex items-center justify-center p-12 relative overflow-hidden">
                                                <div className="relative w-full h-full min-h-[400px]">
                                                    <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Hero-furniture.png'} alt="Hero" fill className="object-contain" unoptimized />
                                                </div>
                                            </div>
                                            <div className="w-1/2 flex flex-col justify-center p-12 pr-24 space-y-4">
                                                <span className="text-[14px] font-semibold text-gray-500">{block.settings.shortTitle || 'Sustainable Furniture'}</span>
                                                <h1 className="text-[42px] font-bold tracking-tight text-gray-900 leading-[1.1]">{block.settings.title || 'Quality Furniture for Every Room'}</h1>
                                                <p className="text-gray-500 text-[15px] pt-2 max-w-lg leading-relaxed">{block.settings.description || 'From living rooms to bedrooms, our high-quality furniture collections offer something for every space.'}</p>
                                                <div className="flex items-center gap-6 pt-6">
                                                    <button className="bg-black text-white px-8 py-3.5 rounded-full text-[13px] font-semibold hover:bg-gray-800 transition-all">
                                                        {block.settings.firstButtonText || 'Explore Now'}
                                                    </button>
                                                    <button className="flex items-center gap-3 text-black text-[13px] font-semibold hover:opacity-70 transition-all">
                                                        <div className="h-12 w-12 bg-white shadow-xl shadow-black/5 rounded-full flex items-center justify-center text-black border border-gray-50 pl-1">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                                        </div>
                                                        {block.settings.secondButtonText || 'Watch Now'}
                                                    </button>
                                                </div>
                                            </div>
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
                                                        <button className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-white text-[12px] font-bold px-8 py-3.5 rounded-full flex items-center gap-3 hover:bg-gray-800 transition-all shadow-2xl">
                                                            {block.settings.buttonText || 'Get Started'} <ArrowRight size={14} className="opacity-70" />
                                                        </button>
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
                                        <div className="py-20 px-16 bg-gray-50/30">
                                            <div className="mb-8">
                                                <p className="text-[14px] text-gray-500 font-medium">Please choose 3 products to display in the grid.</p>
                                            </div>
                                            <div className="border border-gray-200 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center bg-white min-h-[200px]">
                                                <h3 className="text-[13px] font-semibold text-gray-900 mb-1">Featured Products will appear here</h3>
                                                <p className="text-[12px] text-gray-500">but you dont have any featured products yet.</p>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'countdown' && (
                                        <div className="flex flex-col md:flex-row bg-white w-full border-b border-gray-100 py-16 px-12 md:px-24 min-h-[400px]">
                                            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                                                <div className="space-y-2">
                                                    <h2 className="text-[32px] font-bold tracking-tight text-gray-900">{block.settings.title || 'Featured Products'}</h2>
                                                    <p className="text-gray-500 text-[14px]">{block.settings.description || "Grab the best deals before they're gone!"}</p>
                                                </div>
                                                <div className="flex items-center gap-4 py-4">
                                                    {['00\nDays', '00\nHours', '00\nMinutes', '00\nSeconds'].map((lbl, i) => (
                                                        <div key={i} className="flex flex-col items-center justify-center px-4 py-2 bg-white shadow-sm border border-gray-100 rounded-lg min-w-[60px]">
                                                            <span className="text-2xl font-bold text-gray-900 leading-none">{lbl.split('\n')[0]}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase mt-1">{lbl.split('\n')[1]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="bg-black text-white px-8 py-3 rounded-md text-[13px] font-semibold w-max hover:bg-gray-800 transition-all">
                                                    {block.settings.buttonText || 'Buy Now'}
                                                </button>
                                            </div>
                                            <div className="w-full md:w-1/2 flex items-center justify-center mt-10 md:mt-0 relative overflow-hidden h-[300px]">
                                                <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Group-9477-2.png'} alt="Countdown" fill className="object-contain" unoptimized />
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'sales_1' && (
                                        <div className="w-full py-16 px-12 md:px-24 bg-white border-b border-gray-100 overflow-visible">
                                            <div className="w-full bg-[#008C8C] rounded-2xl flex flex-col md:flex-row relative min-h-[300px] mt-10">
                                                <div className="w-full md:w-1/2 h-full relative border flex items-center justify-center -translate-y-16">
                                                    <div className="relative w-full h-[350px]">
                                                        <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Object.png'} alt="Sales 1" fill className="object-contain drop-shadow-2xl" unoptimized />
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 p-12 relative z-20 pl-0">
                                                    <h2 className="text-[32px] font-bold text-white">{block.settings.title || 'To get 30% off?'}</h2>
                                                    <p className="text-white/90 text-[14px] max-w-sm leading-relaxed">{block.settings.description || "Sign up our newsletter today and get 10% off your very first online order with us"}</p>
                                                    <div className="pt-4">
                                                        <button className="bg-white text-[#008C8C] px-8 py-3 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-all w-max shadow-lg">
                                                            {block.settings.buttonText || 'Buy Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'sales_2' && (
                                        <div className="flex flex-col md:flex-row bg-[#FAFAFA] w-full border-b border-gray-50 py-16 px-12 md:px-24 min-h-[400px]">
                                            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 pr-10">
                                                <h2 className="text-[36px] font-bold tracking-tight text-gray-900">{block.settings.title || 'To get 30% off?'}</h2>
                                                <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm">{block.settings.description || "Sign up our newsletter today and get 10% off your very first online order with us"}</p>
                                                <div className="pt-4">
                                                    <button className="bg-transparent border-b-2 border-black text-black px-0 py-1 text-[14px] font-bold hover:opacity-70 transition-all rounded-none outline-none">
                                                        {block.settings.buttonText || 'Buy Now'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/2 flex items-center justify-center mt-10 md:mt-0 relative overflow-hidden h-[300px]">
                                                <Image src={block.settings.imageUrl || 'https://kitpapa.net/couchly/wp-content/uploads/2024/07/Group-9475.png'} alt="Sales 2" fill className="object-contain" unoptimized />
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'countdown_7' && (
                                        <div className="flex flex-col md:flex-row bg-[#EAEAEA] w-full border-b border-gray-100 py-16 px-12 md:px-24 min-h-[400px]">
                                            <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start space-y-4">
                                                <div className="flex items-center gap-4">
                                                    {['00\nDAYS', '00\nHOURS', '00\nMINUTES', '00\nSECONDS'].map((lbl, i) => (
                                                        <div key={i} className="flex flex-col items-center justify-center min-w-[60px]">
                                                            <span className="text-[32px] md:text-[40px] font-medium text-gray-800 tracking-wider font-light leading-none">{lbl.split('\n')[0]}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">{lbl.split('\n')[1]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/2 flex flex-col justify-center mt-10 md:mt-0 md:pl-20 md:border-l border-gray-300">
                                                <h2 className="text-[32px] font-medium text-gray-900 mb-2">{block.settings.title || 'Our Blogs'}</h2>
                                                <p className="text-gray-600 text-[14px] mb-6">{block.settings.description || "Get Selected items with good price"}</p>
                                                <button className="bg-black text-white px-8 py-3 rounded-md text-[13px] font-semibold w-max hover:bg-gray-800 transition-all">
                                                    {block.settings.buttonText || 'Shop Now'}
                                                </button>
                                            </div>
                                        </div>
                                    )}


                                    {block.type === 'countdown_6' && (
                                        <div className="w-full py-16 px-12 md:px-24 bg-[#FAFAFA] border-b border-gray-100 flex items-center justify-center">
                                            <div className="w-full max-w-6xl bg-[#F4F4F4] rounded-xl flex flex-col md:flex-row relative min-h-[350px] shadow-sm overflow-hidden p-[2px]">
                                                <div className="w-full md:w-1/2 bg-white rounded-l-[10px] p-12 pr-6 flex flex-col justify-center">
                                                    <h2 className="text-[28px] font-medium text-gray-800 mb-8">{block.settings.title || 'Hurry Up Sale Ends In'}</h2>
                                                    <div className="flex items-center gap-4 mb-10">
                                                        {['00\nDays', '00\nHours', '00\nMinutes', '00\nSeconds'].map((lbl, i) => (
                                                            <div key={i} className="flex flex-col items-center justify-center min-w-[50px]">
                                                                <span className="text-[28px] font-semibold text-gray-800 leading-none">{lbl.split('\n')[0]}</span>
                                                                <span className="text-[12px] text-gray-500 font-medium mt-2">{lbl.split('\n')[1]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button className="bg-black text-white px-8 py-3.5 rounded-full text-[13px] font-semibold w-max hover:bg-gray-800 transition-all flex items-center gap-2 group">
                                                        {block.settings.buttonText || 'Get This Offer'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                                <div className="w-full md:w-1/2 relative bg-white rounded-r-[10px] p-4 pl-0">
                                                    <div className="w-full h-full relative rounded-xl overflow-hidden min-h-[300px]">
                                                        <Image src={block.settings.imageUrl || 'https://m.media-amazon.com/images/I/71R2oE+ZJGL._AC_SY879_.jpg'} alt="Promo" fill className="object-cover" unoptimized />
                                                    </div>
                                                    {block.settings.badgeText && (
                                                        <div className="absolute top-8 -left-6 z-10 w-20 h-20 bg-black text-white rounded-full flex items-center justify-center rotate-[-15deg] shadow-lg">
                                                            <svg className="absolute inset-0 w-full h-full text-black"><path d="M40 0l5 10 10-5 5 10 10-5 5 10 10-5 5 10-5 10 10 5-10 5 10 5-10 5 10 5-10 5 5 10-10-5-5 10-10-5-5 10L40 80l-5-10-10 5-5-10-10 5-5-10-10 5-5-10 5-10-10-5 10-5-10-5 10-5-10-5 10-5-5-10 10 5 5-10 10 5 5-10L40 0z" fill="currentColor" /></svg>
                                                            <span className="text-[13px] font-black uppercase tracking-wider relative z-20">{block.settings.badgeText}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'hero_39' && (
                                        <div className="relative w-full min-h-[600px] border-b border-gray-100 flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 z-0">
                                                <Image src={block.settings.bgImageUrl || 'https://zap-main.myshopify.com/cdn/shop/files/01-promo-02.webp?v=1765556467&width=800'} alt="Background" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/10" />
                                            </div>

                                            <div className="relative z-10 w-full max-w-7xl px-12 pt-16 flex flex-col justify-between h-full min-h-[600px]">
                                                <div className="flex justify-between w-full relative">
                                                    <div className="w-1/3 flex flex-col items-start translate-y-16">
                                                        <h2 className="text-[32px] md:text-[40px] font-bold text-white leading-tight drop-shadow-md">{block.settings.title || 'Hurry Up Sale Ends In'}</h2>
                                                    </div>
                                                    <div className="w-1/3 flex flex-col items-end pt-32">
                                                        <p className="text-white text-[13px] font-medium leading-relaxed text-right drop-shadow-md max-w-xs">{block.settings.description || 'Crafted for women who embrace both tradition and trend, each piece tells a story of refined taste and contemporary charm'}</p>
                                                    </div>
                                                </div>

                                                <div className="absolute left-[30%] top-1/2 -translate-x-1/2 translate-y-10 z-20">
                                                    <button className="bg-white text-black pl-6 pr-2 py-2 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-all flex items-center gap-4 group shadow-md">
                                                        {block.settings.buttonText || 'Get This Offer'}
                                                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-gray-200">
                                                            <ArrowRight size={14} className="-rotate-45" />
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="flex items-end justify-center gap-4 pb-10 mt-auto pt-32 relative z-20">
                                                    {[block.settings.thumb1, block.settings.thumb2, block.settings.thumb3, block.settings.thumb4, block.settings.thumb5].map((thumb, i) => (
                                                        <div key={i} className={`relative w-28 h-36 rounded-2xl overflow-hidden border border-white/40 cursor-pointer transition-all hover:-translate-y-2 hover:border-white shadow-lg flex-shrink-0 ${i === 2 ? 'relative z-10 -translate-y-4 shadow-2xl border-white scale-105' : 'opacity-80 hover:opacity-100'}`}>
                                                            {thumb && <Image src={thumb} alt="Thumbnail" fill className="object-cover" unoptimized />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'how_it_works_2' && (
                                        <div className="w-full bg-white border-b border-gray-100 py-16 px-12 md:px-24 flex flex-col md:flex-row min-h-[420px]">
                                            <div className="w-full md:w-1/2 flex flex-col justify-center pr-0 md:pr-16 mb-10 md:mb-0">
                                                <h2 className="text-[36px] md:text-[48px] font-semibold tracking-tight text-gray-900 leading-tight">{block.settings.heading || 'Winter Clearance Sale'}</h2>
                                            </div>
                                            <div className="w-full md:w-1/2 flex flex-col justify-center gap-8 border-l border-gray-100 pl-0 md:pl-16">
                                                {[1, 2, 3].map(n => (
                                                    <div key={n} className="flex items-start gap-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-7 h-7 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">{n}</div>
                                                            {n < 3 && <div className="w-px h-8 bg-gray-200 mt-2" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-gray-800">{block.settings[`step${n}Title`] || `Step ${n}`}</p>
                                                            <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{block.settings[`step${n}Desc`] || ''}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'testimonial_1' && (
                                        <div className="py-12 px-12 bg-white border-b border-gray-100 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
                                            <div className="w-full md:w-1/3 text-left space-y-6 pt-10">
                                                <div className="space-y-4">
                                                    <h2 className="text-[22px] font-bold text-gray-950 tracking-tighter uppercase font-mono">[{block.settings.title || 'OUR TESTIMONIALS'}]</h2>
                                                    <p className="text-[13px] text-gray-400 font-medium leading-relaxed max-w-xs">{block.settings.subtitle || 'See what our community has to say about their journey.'}</p>
                                                </div>
                                                <div className="w-12 h-1 bg-black rounded-full" />
                                            </div>

                                            <div className="w-full md:w-2/3 -mr-12 md:-mr-32">
                                                <TestimonialCarousel testimonials={block.settings.testimonials || []} speed={block.settings.speed} />
                                            </div>
                                        </div>
                                    )}                                    {block.type === 'testimonial_2' && (
                                        <div className="bg-black py-12 px-12 overflow-hidden">
                                            <div className="flex flex-col md:flex-row items-center gap-16">
                                                <div className="w-full md:w-1/2 space-y-10">
                                                    <div className="space-y-2">
                                                        <h2 className="text-4xl text-white font-medium italic tracking-tight">{block.settings.title || 'Authentic Insights'}</h2>
                                                        <p className="text-gray-500 text-[12px] font-bold tracking-widest uppercase">{block.settings.subtitle || 'OUR BLOGS'}</p>
                                                    </div>

                                                    <div className="min-h-[160px] flex flex-col justify-center">
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={block.settings.localActiveIdx || 0}
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -5 }}
                                                                className="space-y-6"
                                                            >
                                                                <p className="text-[24px] text-white font-medium leading-[1.2] tracking-tighter">
                                                                    "{block.settings.testimonials?.[block.settings.localActiveIdx || 0]?.quote || 'No review available.'}"
                                                                </p>
                                                                <div className="pt-4 border-t border-white/10">
                                                                    <h4 className="text-white text-[16px] font-bold">{block.settings.testimonials?.[block.settings.localActiveIdx || 0]?.name || 'John Doe'}</h4>
                                                                    <p className="text-gray-500 text-[11px] uppercase tracking-widest font-bold mt-1">{block.settings.testimonials?.[block.settings.localActiveIdx || 0]?.role || 'VERIFIED BUYER'}</p>
                                                                </div>
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                const len = block.settings.testimonials?.length || 1;
                                                                const next = ((block.settings.localActiveIdx || 0) - 1 + len) % len;
                                                                updateBlockSetting(block.id, 'localActiveIdx', next);
                                                            }}
                                                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                                        >
                                                            <ChevronRight size={18} className="rotate-180" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const len = block.settings.testimonials?.length || 1;
                                                                const next = ((block.settings.localActiveIdx || 0) + 1) % len;
                                                                updateBlockSetting(block.id, 'localActiveIdx', next);
                                                            }}
                                                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-1/2">
                                                    <div className="aspect-square relative rounded-3xl overflow-hidden max-w-[450px] mx-auto">
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={block.settings.localActiveIdx || 0}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="absolute inset-0"
                                                            >
                                                                <Image
                                                                    src={block.settings.testimonials?.[block.settings.localActiveIdx || 0]?.image || 'https://via.placeholder.com/600'}
                                                                    alt="Insight"
                                                                    fill
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay" />
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'trusted_by_4' && (
                                        <div className="w-full bg-white border-b border-gray-100 py-16 px-12 md:px-24 flex flex-col items-center">
                                            <h2 className="text-[28px] font-semibold text-gray-900 text-center mb-3">{block.settings.title || 'Trusted Partners'}</h2>
                                            <p className="text-[13px] text-gray-500 text-center max-w-lg mb-12">{block.settings.description || 'Trusted by leading brands and satisfied customers worldwide.'}</p>
                                            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                                                {['logo1', 'logo2', 'logo3', 'logo4'].map(key => block.settings[key] && (
                                                    <div key={key} className="relative h-10 w-32">
                                                        <Image src={block.settings[key]} alt="Logo" fill className="object-contain grayscale opacity-70" unoptimized />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'trusted_by_2' && (
                                        <div className="py-10 bg-white border-y border-gray-50 overflow-hidden relative">
                                            <style dangerouslySetInnerHTML={{
                                                __html: `
                                                @keyframes marquee_editor {
                                                    0% { transform: translateX(0); }
                                                    100% { transform: translateX(-50%); }
                                                }
                                                .marquee-container-editor {
                                                    display: flex;
                                                    animation: marquee_editor 30s linear infinite;
                                                    width: max-content;
                                                }
                                            `}} />
                                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 px-8 max-w-5xl mx-auto">
                                                {block.settings.title && (
                                                    <div className="shrink-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                        {block.settings.title}
                                                    </div>
                                                )}
                                                <div className="flex-1 overflow-hidden relative grayscale opacity-30">
                                                    <div className="marquee-container-editor gap-12">
                                                        {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((n, i) => {
                                                            const logoUrl = block.settings[`logo${n}`] || `https://kitpapa.net/couchly/wp-content/uploads/2024/07/Logo-${n}.png`;
                                                            return (
                                                                <div key={i} className="h-8 flex items-center justify-center shrink-0 min-w-[100px]">
                                                                    <Image
                                                                        src={logoUrl}
                                                                        alt="Partner"
                                                                        width={100}
                                                                        height={32}
                                                                        className="h-5 md:h-6 w-auto object-contain"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
                                                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'product_showcase_9' && (
                                        <div className="w-full bg-white border-b border-gray-100 flex flex-col md:flex-row min-h-[500px]">
                                            {/* Left: product image */}
                                            <div className="w-full md:w-1/2 relative bg-gray-50 min-h-[360px] md:min-h-[500px] flex flex-col items-center justify-end overflow-hidden">
                                                {block.settings.badge && (
                                                    <div className="absolute top-6 left-6 z-10 bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{block.settings.badge}</div>
                                                )}
                                                <div className="absolute inset-0">
                                                    <Image src={block.settings.imageUrl || 'https://img.freepik.com/premium-photo/pair-headpho%E2%80%A6e-band-that-says-number-3_984237-83953.jpg?w=1480'} alt="Product" fill className="object-contain p-8" unoptimized />
                                                </div>
                                                <div className="relative z-10 w-full text-center pb-6">
                                                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{block.settings.productTitle || 'Wireless Over-Ear Headphones'}</p>
                                                    <h3 className="text-[20px] font-bold text-gray-900">{block.settings.imageName || 'Aurora X-500'}</h3>
                                                </div>
                                            </div>
                                            {/* Right: features */}
                                            <div className="w-full md:w-1/2 flex flex-col justify-center gap-6 p-10 md:p-14">
                                                {[1, 2, 3, 4].map(n => (
                                                    <div key={n} className="flex flex-col gap-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{block.settings[`feat${n}Tag`] || ''}</span>
                                                        <p className="text-[15px] font-bold text-gray-900">{block.settings[`feat${n}Title`] || ''}</p>
                                                        <p className="text-[12px] text-gray-500 leading-relaxed">{block.settings[`feat${n}Desc`] || ''}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'product_highlights_9' && (
                                        <div className="w-full bg-[#F8F8F8] border-b border-gray-100 px-10 md:px-16 py-12">
                                            <div className="flex justify-between items-start mb-8 gap-4">
                                                <div className="flex flex-col gap-2">
                                                    {block.settings.badge && (
                                                        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-[10px] font-semibold text-gray-600 w-max">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                                                            {block.settings.badge}
                                                        </div>
                                                    )}
                                                    <h2 className="text-[28px] md:text-[40px] font-black text-gray-900 uppercase leading-none">{block.settings.heading || 'PREMIUM HEADPHONES'}</h2>
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed max-w-[220px] text-right pt-10">{block.settings.description || 'Each product is crafted with care.'}</p>
                                            </div>
                                            <div className="flex gap-2 h-[300px]">
                                                {[1, 2, 3, 4].map(n => (
                                                    <div key={n} className="relative rounded-2xl overflow-hidden flex-1 bg-gray-200">
                                                        {block.settings[`feat${n}Img`] && (
                                                            <Image src={block.settings[`feat${n}Img`]} alt={block.settings[`feat${n}Title`] || ''} fill className="object-contain bg-white" unoptimized />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                                        <div className="absolute top-3 left-3 text-white/60 text-[10px] font-black">{String(n).padStart(2, '0')}</div>
                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                                            <p className="text-white font-bold text-[11px] truncate">{block.settings[`feat${n}Title`] || `Feature ${n}`}</p>
                                                            <p className="text-white/70 text-[10px] truncate mt-0.5">{block.settings[`feat${n}Desc`] || ''}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'footer_12' && (
                                        <div className="py-12 px-12 bg-[#f9fafb]">
                                            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-200 pb-10">
                                                <div className="w-full">
                                                    {(block.settings.logoUrl || store.logo) ? (
                                                        <div className="relative h-10 w-24 mb-3">
                                                            <Image src={block.settings.logoUrl || store.logo} alt="Logo" fill className="object-contain" unoptimized />
                                                        </div>
                                                    ) : (
                                                        <div className="text-xl font-black mb-3 text-black uppercase">{store.name || 'LOGO'}</div>
                                                    )}
                                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Your store's identifier and primary branding.</p>
                                                </div>
                                                <div className="w-full space-y-4">
                                                    <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{block.settings.legalTitle || 'LEGAL'}</span>
                                                    </div>
                                                    <div className="space-y-2 text-gray-400">
                                                        {['Privacy Policy', 'Terms & Conditions', 'Return Policy'].map(t => (
                                                            <div key={t} className="flex items-center gap-2">
                                                                <ArrowRight size={8} />
                                                                <span className="text-[11px] font-medium">{t}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                 <div className="w-full space-y-4">
                                                     <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                                                         <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{block.settings.contactTitle || 'CONTACT US'}</span>
                                                     </div>
                                                     <div className="space-y-2 text-gray-400">
                                                         <div className="flex items-center gap-2 text-[11px] font-medium"><Mail size={12} /> {block.settings.email || 'hello@createvendor.com'}</div>
                                                         <div className="flex items-center gap-2 text-[11px] font-medium"><Smartphone size={12} /> {block.settings.phone || '+977 9828138995'}</div>
                                                         {block.settings.showPan && <div className="text-[10px] pt-2">PAN/VAT: {block.settings.panNumber || '140881501'}</div>}
                                                     </div>
                                                 </div>
                                                 <div className="w-full space-y-4">
                                                     <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                                                         <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{block.settings.socialTitle || 'FOLLOW US'}</span>
                                                     </div>
                                                     <div className="flex items-center gap-4 text-gray-400 pt-2">
                                                         {block.settings.fbUrl && <Facebook size={18} className="hover:text-black cursor-pointer transition-colors" />}
                                                         {block.settings.igUrl && <Instagram size={18} className="hover:text-black cursor-pointer transition-colors" />}
                                                         {block.settings.ttUrl && <div className="w-4 h-4 rounded-sm border-2 border-gray-400 hover:border-black flex items-center justify-center text-[8px] font-black cursor-pointer transition-all">T</div>}
                                                         {!block.settings.fbUrl && !block.settings.igUrl && !block.settings.ttUrl && <p className="text-[10px] italic">No social links added.</p>}
                                                     </div>
                                                 </div>
                                             </div>
                                            <div className="pt-6 flex justify-between items-center">
                                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">© 2026 STORE. ALL RIGHTS RESERVED.</span>
                                                {block.settings.showMadeWith && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Made with</span>
                                                        <span className="text-[9px] font-black text-black">CREATE VENDOR</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                     {(block.type === 'branch_1' || block.type === 'branch_2') && (() => {
                                        const isBg = block.type === 'branch_2';
                                        return (
                                            <div className={`py-12 px-10 ${isBg ? 'bg-[#fdf8f4]' : 'bg-white'}`}>
                                                <div className={isBg ? 'text-center mb-8' : 'flex flex-col md:flex-row gap-10 mb-8'}>
                                                    <div className={isBg ? 'max-w-xl mx-auto' : 'flex-1'}>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">LOCATIONS</p>
                                                        <h2 className="text-[18px] font-semibold text-gray-900 mb-2">{block.settings.title || 'Our Branches'}</h2>
                                                        <p className="text-[12px] text-gray-500 leading-relaxed">{block.settings.description || 'Visit us at any of our convenient locations.'}</p>
                                                    </div>
                                                    {block.settings.showMap && (
                                                        <div className={`${isBg ? 'w-full mt-6' : 'flex-1'} rounded-xl overflow-hidden border border-gray-100`} style={{ height: `${Math.min(parseInt(block.settings.mapHeight || '350'), 300)}px` }}>
                                                            {block.settings.mapUrl ? (
                                                                <iframe src={block.settings.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
                                                                    <MapPin size={22} className="text-gray-300" />
                                                                    <span className="text-[10px] text-gray-400">Add Google Maps embed URL in sidebar</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                    {(block.settings.branches && block.settings.branches.length > 0) ? block.settings.branches.slice(0, 4).map((b: any, i: number) => (
                                                        <div key={i} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                                                            <p className="text-[12px] font-semibold text-gray-800 mb-1">{b.name || 'Branch Name'}</p>
                                                            {b.address && <p className="text-[11px] text-gray-500 flex items-center gap-1.5"><MapPin size={10} /> {b.address}</p>}
                                                            {b.phone && <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1"><Smartphone size={10} /> {b.phone}</p>}
                                                            {b.hours && <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1"><Clock size={10} /> {b.hours}</p>}
                                                        </div>
                                                    )) : (
                                                        <div className="col-span-2 text-center py-8">
                                                            <MapPin size={18} className="mx-auto text-gray-300 mb-2" />
                                                            <p className="text-[11px] text-gray-400">No branches yet — add branches from Store Settings</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

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
                                                        <button className="bg-transparent border border-white text-white px-8 py-3.5 rounded-full text-[12px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
                                                            {block.settings.buttonText || 'GET NOW'}
                                                        </button>
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

                                    {block.type === 'countdown_2' && (
                                        <div className="w-full bg-white border-b border-gray-100 py-10 px-0 flex items-center justify-center">
                                            <div className="w-full flex flex-col md:flex-row min-h-[400px] relative p-8 md:p-12 border-y border-gray-50">
                                                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 z-10">
                                                    {block.settings.badge && (
                                                        <div className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                                            {block.settings.badge}
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <h2 className="text-[32px] md:text-[38px] font-bold text-gray-900 leading-tight tracking-tight">{block.settings.title || 'Summer Sale'}</h2>
                                                        <p className="text-[14px] md:text-[16px] font-bold text-gray-500 uppercase">{block.settings.subTitle || 'Up to 30% OFF'}</p>
                                                    </div>
                                                    <p className="text-gray-400 text-[13px] leading-relaxed max-w-sm">{block.settings.description || "Grab the best deals before they're gone!"}</p>

                                                    {/* Timer Grid */}
                                                    <div className="flex gap-3 py-2">
                                                        {['00\nDays', '00\nHours', '00\nMinutes', '00\nSeconds'].map((lbl, i) => (
                                                            <div key={i} className="flex flex-col items-center justify-center min-w-[60px] h-[70px] bg-white rounded-xl shadow-sm border border-gray-100">
                                                                <span className="text-[20px] font-bold text-gray-900 leading-none">{lbl.split('\n')[0]}</span>
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{lbl.split('\n')[1]}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button className="bg-black text-white px-8 py-3 rounded-lg text-[12px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all w-max flex items-center gap-3 group">
                                                        {block.settings.buttonText || 'Buy Now'}
                                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                                <div className="w-full md:w-1/2 relative mt-10 md:mt-0 flex items-center justify-center">
                                                    <div className="relative w-full h-[300px]">
                                                        <Image src={block.settings.imageUrl || 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png'} alt="Product" fill className="object-contain" unoptimized />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {block.type === 'countdown_3' && (
                                        <div className="w-full bg-black border-y border-gray-800 py-12 md:py-20 px-6 md:px-24 flex items-center justify-center overflow-hidden">
                                            <div className="w-full max-w-7xl relative border border-gray-800 p-8 md:p-14 rounded-sm flex flex-col md:flex-row items-center gap-12 md:gap-20">
                                                <div className="w-full md:w-1/2 flex flex-col space-y-8 z-10">
                                                    {block.settings.badge && (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-[1px] w-8 bg-gray-500" />
                                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3em]">{block.settings.badge}</span>
                                                        </div>
                                                    )}
                                                    <div className="space-y-4">
                                                        <h2 className="text-[28px] md:text-[34px] font-bold text-white leading-tight tracking-tight">{block.settings.title || 'The Autumn Essentials kit'}</h2>
                                                        <p className="text-gray-400 text-[14px] md:text-[15px] italic font-medium leading-relaxed max-w-md">{block.settings.description || '"Grab the best deals before they\'re gone!"'}</p>
                                                    </div>

                                                    <div className="flex gap-3 py-2">
                                                        {['00\nDays', '00\nHours', '00\nMinutes', '00\nSeconds'].map((lbl, i) => (
                                                            <div key={i} className="flex flex-col items-center justify-center min-w-[50px] h-[60px] bg-white/5 border border-white/10 rounded-xl shadow-sm">
                                                                <span className="text-[18px] font-bold text-white leading-none">{lbl.split('\n')[0]}</span>
                                                                <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-1">{lbl.split('\n')[1]}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button className="bg-white text-black px-10 py-4 rounded-sm text-[12px] font-semibold uppercase tracking-widest hover:bg-gray-100 transition-all border border-white w-max">
                                                        {block.settings.buttonText || 'BUY NOW - 30% OFF'}
                                                    </button>
                                                </div>

                                                <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] flex items-center justify-center">
                                                    <div className="relative w-full h-full">
                                                        <Image src={block.settings.image1 || 'https://media.wired.com/photos/68c090e880d4121aa5a6c04c/4:3/w_640,c_limit/iPhone17-Pro-and-ProMAX-Gear-DSC_5918.jpg'} alt="Slide 1" fill className="object-contain" unoptimized />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {block.type === 'not_found_11' && (
                                        <div className="w-full bg-black min-h-[400px] flex flex-col items-center justify-center p-10">
                                            <h1 className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-6 drop-shadow-2xl">404</h1>
                                            <p className="text-white/60 text-[13px] text-center max-w-sm mb-8">{block.settings.message || "This page you are looking for might have been moved or doesn't exist."}</p>
                                            <div className="flex gap-4">
                                                <button className="bg-white text-black px-6 py-2 rounded font-bold text-[12px]">{block.settings.homeText || 'Go Home'}</button>
                                                <button className="bg-transparent border border-white/20 text-white px-6 py-2 rounded font-bold text-[12px]">{block.settings.backText || 'Back'}</button>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'not_found_3' && (
                                        <div className="w-full bg-[#fcf9f2] min-h-[400px] border border-gray-900 rounded-[20px] flex flex-col items-center justify-center p-10 relative overflow-hidden shadow-[4px_4px_0px_#000] m-4 w-[calc(100%-32px)]">
                                            <div className="border-2 border-gray-900 rounded-full px-3 py-1 text-[10px] font-bold bg-white shadow-[2px_2px_0px_#000] mb-8 uppercase tracking-widest">{block.settings.badge || 'ERROR_CODE_404'}</div>
                                            <h1 className="text-[100px] font-black text-[#0f3b2e] leading-none mb-4 drop-shadow-[2px_2px_0px_#fff]">404</h1>
                                            <h2 className="text-[24px] font-bold text-gray-900 mb-2">{block.settings.homeText === 'Go Home' ? 'Page Not Found' : 'Error'}</h2>
                                            <p className="text-gray-600 text-[13px] text-center max-w-sm mb-8">{block.settings.message || "The page you're looking for doesn't exist or has been moved."}</p>
                                            <div className="flex gap-4">
                                                <button className="bg-black text-white px-6 py-2 rounded-lg font-bold text-[12px] shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:shadow-[0px_0px_0px_#000] transition-all">{block.settings.homeText || 'Go Home'}</button>
                                                <button className="bg-white border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-lg font-bold text-[12px] shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:shadow-[0px_0px_0px_#000] transition-all">{block.settings.backText || 'Go Back'}</button>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'not_found_5' && (
                                        <div className="w-full bg-[#1b1b1f] min-h-[350px] flex flex-col items-center justify-center p-10 relative">
                                            <h1 className="text-[120px] font-black text-white/5 leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">404</h1>
                                            <p className="text-white font-bold text-[18px] mb-8 z-10">{block.settings.message || 'Nothing to see here.'}</p>
                                            <button className="bg-white text-black px-6 py-2 rounded-xl font-bold text-[12px] shadow-[0_4px_14px_rgba(255,255,255,0.25)] hover:scale-105 transition-all z-10">{block.settings.homeText || 'Go Home'}</button>
                                            <div className="mt-8 relative w-16 h-16 z-10">
                                                <Image src={block.settings.imageUrl || 'https://cdn-icons-png.flaticon.com/512/1674/1674773.png'} alt="Mascot" fill className="object-contain" unoptimized />
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'not_found_6' && (
                                        <div className="w-full bg-gradient-to-br from-[#eef2f6] to-[#d8e0e8] min-h-[400px] flex flex-col items-center justify-center p-10 border-b border-white shadow-inner m-4 w-[calc(100%-32px)] rounded-xl relative overflow-hidden">
                                            <h1 className="text-[140px] font-black text-white leading-none drop-shadow-md opacity-70">404</h1>
                                            <h2 className="text-[20px] font-black text-[#2b4c65] uppercase tracking-[0.3em] -mt-10 mb-6 drop-shadow-sm">{block.settings.subtitle || 'LOST IN SPACE'}</h2>
                                            <p className="text-[#517a95] text-[12px] text-center max-w-md mb-8">{block.settings.message || "The coordinates you entered don't exist in this dimension. Check the URL or head back to the docking station."}</p>
                                            <div className="flex gap-4">
                                                <button className="bg-white text-[#2b4c65] px-8 py-2.5 rounded-2xl font-black text-[11px] shadow-[4px_4px_10px_rgba(0,0,0,0.1),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-inner transition-all uppercase tracking-wider">{block.settings.homeText || 'HOME'}</button>
                                                <button className="bg-[#eef2f6] text-[#517a95] px-8 py-2.5 rounded-2xl font-black text-[11px] shadow-[4px_4px_10px_rgba(0,0,0,0.1),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-inner transition-all uppercase tracking-wider">{block.settings.backText || 'BACK'}</button>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'checkout_1' && (
                                        <div className="w-full bg-[#f8f9fa] min-h-[500px] p-6 lg:p-10 font-sans text-[#2d3436]">
                                            <h1 className="text-2xl font-bold mb-8">{block.settings.title || 'Checkout'}</h1>
                                            <div className="flex flex-col lg:flex-row gap-8">
                                                <div className="flex-1 space-y-6">
                                                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                                                        <h2 className="text-sm font-bold mb-6 border-b pb-2">{block.settings.step1 || 'Shipping Information'}</h2>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Full Name *</label><div className="h-9 border border-gray-200 rounded px-3 bg-gray-50" /></div>
                                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Email</label><div className="h-9 border border-gray-200 rounded px-3 bg-gray-50" /></div>
                                                            </div>
                                                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Address *</label><div className="h-9 border border-gray-200 rounded px-3 bg-gray-50" /></div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">City *</label><div className="h-9 border border-gray-200 rounded px-3 bg-gray-50" /></div>
                                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-500">Mobile Number *</label><div className="h-9 border border-gray-200 rounded px-3 bg-gray-50" /></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full lg:w-[360px] space-y-6">
                                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                                        <h2 className="text-sm font-bold mb-4">{block.settings.step2 || 'Order Summary'}</h2>
                                                        <div className="space-y-3 py-4 border-y border-gray-100 mb-4">
                                                            <div className="flex justify-between text-xs font-medium"><span>Subtotal</span><span>R 0.00</span></div>
                                                            <div className="flex justify-between text-xs font-medium"><span>Shipping</span><span>R 0.00</span></div>
                                                            <div className="flex justify-between text-sm font-bold pt-2"><span>Total</span><span>R 0.00</span></div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</div>
                                                            <div className="p-3 border border-blue-100 bg-blue-50 rounded flex items-center gap-3">
                                                                <div className="w-3 h-3 rounded-full border-2 border-blue-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /></div>
                                                                <span className="text-xs font-medium">Cash on Delivery</span>
                                                            </div>
                                                        </div>
                                                        <button className="w-full bg-[#636e72] text-white py-3 rounded mt-6 text-[12px] font-bold hover:bg-[#2d3436] transition-all">
                                                            {block.settings.buttonText || 'Place Order'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'contact_1' && (
                                        <div className="w-full bg-white min-h-[500px] p-6 lg:p-12 font-sans border-b border-gray-100 flex flex-col md:flex-row gap-12 lg:gap-20">
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
                                                    <div className="space-y-4">
                                                        <div className="h-10 border-b border-gray-100 flex items-center px-1 text-[11px] font-medium text-gray-300 italic">Your Name (Required)</div>
                                                        <div className="h-10 border-b border-gray-100 flex items-center px-1 text-[11px] font-medium text-gray-300 italic">Your Email (Required)</div>
                                                        <div className="h-10 border-b border-gray-100 flex items-center px-1 text-[11px] font-medium text-gray-300 italic">Subject (Required)</div>
                                                        <div className="h-24 border border-gray-100 rounded-lg p-3 text-[11px] font-medium text-gray-300 italic">Your Message (Optional)</div>
                                                    </div>
                                                    <button className="w-full bg-black text-white py-3.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                                                        {block.settings.buttonText || 'Send Message'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'footer' && (
                                        <div className="w-full border-t border-gray-100 bg-gray-50/50 py-24 px-20 grid grid-cols-2 gap-20">
                                            <div className="space-y-6">
                                                <div className="h-10 w-10 bg-black rounded flex items-center justify-center text-white italic font-extrabold shadow-xl shadow-black/10">Z</div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Legal Information</p>
                                                    <div className="space-y-1.5 text-xs text-gray-500 font-medium transition-all">
                                                        <p className="hover:text-blue-500 cursor-pointer">Privacy Policy</p>
                                                        <p className="hover:text-blue-500 cursor-pointer">Terms & Conditions</p>
                                                        <p className="hover:text-blue-500 cursor-pointer">Refund Policy</p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-300 font-medium tracking-tight">© 2026 {store?.name} — All rights reserved.</p>
                                            </div>
                                            <div className="space-y-8 flex flex-col justify-center">
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Contact Support</p>
                                                <div className="space-y-5 text-xs text-gray-600 font-bold">
                                                    <div className="flex items-center gap-4 group cursor-pointer hover:text-blue-500"><div className="h-8 w-8 bg-white shadow-sm rounded-lg flex items-center justify-center"><MapPin size={14} className="group-hover:scale-110 transition-transform" /></div> Kathmandu HQ, Nepal</div>
                                                    <div className="flex items-center gap-4 group cursor-pointer hover:text-blue-500"><div className="h-8 w-8 bg-white shadow-sm rounded-lg flex items-center justify-center"><Mail size={14} className="group-hover:scale-110 transition-transform" /></div> hello@zalient.shop</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {blocks.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-30 text-center">
                                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6"><Plus size={32} /></div>
                                    <h3 className="text-lg font-bold">Your canvas is empty</h3>
                                    <p className="text-sm max-w-xs mx-auto mt-2">Start adding components from the sidebar to build your high-end storefront.</p>
                                </div>
                            )}

                            {/* Drop Zone Placeholder at bottom */}
                            <div className="h-32 flex items-center justify-center border-t border-dashed border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-200 hover:text-blue-300 hover:border-blue-100 transition-all cursor-pointer">
                                Drop components here to add more sections
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties/Brand Settings */}
                <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col shrink-0 z-30">
                    <header className="h-12 flex items-center px-4 border-b border-gray-100 bg-gray-50/50 justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-blue-500 text-white rounded text-[10px] font-bold flex items-center justify-center">H</span>
                            <span className="text-[11px] font-bold text-gray-800">
                                {selectedBlock ? selectedBlock.name : 'Global Brand Settings'}
                            </span>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar select-text cursor-auto">
                        {!selectedBlock ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Brand Color</label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl border border-gray-100 shadow-sm transition-all" style={{ backgroundColor: brandColor }} />
                                        <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="flex-1 h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-wider focus:ring-2 ring-blue-500/10 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contrast Mode</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-gray-400 font-bold">Manual</span>
                                            <button onClick={() => setManualOverride(!manualOverride)} className={`w-8 h-4 rounded-full transition-all relative ${manualOverride ? 'bg-blue-500' : 'bg-gray-100'}`}>
                                                <div className={`absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all shadow-sm ${manualOverride ? 'right-0.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl border border-gray-100 shadow-sm" style={{ backgroundColor: textColor }} />
                                        <input value={textColor} onChange={(e) => setTextColor(e.target.value)} disabled={!manualOverride} className="flex-1 h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold uppercase disabled:opacity-30 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Typography System</label>
                                    <select value={brandFont} onChange={(e) => setBrandFont(e.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold tracking-tight outline-none focus:ring-2 ring-blue-500/10 appearance-none">
                                        <option>Poppins</option><option>Inter</option><option>Montserrat</option><option>Playfair Display</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                {selectedBlock.type === 'hero' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Short Title</label>
                                            <input value={selectedBlock.settings.shortTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'shortTitle', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-24 outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[11px] font-semibold text-gray-400">First Button Text</label>
                                            <input value={selectedBlock.settings.firstButtonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'firstButtonText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">First Button URL</label>
                                            <input value={selectedBlock.settings.firstButtonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'firstButtonUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500 mb-2" />
                                            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mx-auto"><AlignLeft size={12} /> Select from list</button>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[11px] font-semibold text-gray-400">Watch Button Icon</label>
                                            <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded bg-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-6 w-6 bg-gray-100 rounded-lg flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
                                                    <div><p className="text-[11px] font-semibold text-gray-800 leading-tight">play</p><p className="text-[9px] text-gray-400 uppercase">iconoir / bold</p></div>
                                                </div>
                                                <button className="text-gray-400"><X size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Second Button Text</label>
                                            <input value={selectedBlock.settings.secondButtonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'secondButtonText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Youtube Video URL [EMBED URL]</label>
                                            <input value={selectedBlock.settings.youtubeUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'youtubeUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500 mb-2" />
                                            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mx-auto"><AlignLeft size={12} /> Select from list</button>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Image</label>
                                            <div className="relative h-28 w-full rounded-lg border border-gray-200 overflow-hidden bg-white mb-2 shadow-sm">
                                                {selectedBlock.settings.imageUrl ? (
                                                    <Image src={selectedBlock.settings.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 justify-center bg-gradient-to-t from-black/80 to-transparent pt-6">
                                                    <button className="px-3 py-1 bg-white text-gray-800 text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 hover:bg-gray-50"><CloudUpload size={10} /> Change</button>
                                                    <button onClick={() => updateBlockSetting(selectedBlock.id, 'imageUrl', '')} className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 hover:bg-red-600"><X size={10} /> Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {['countdown_7', 'countdown_6', 'hero_39', 'hero_12'].includes(selectedBlock.type) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                            <span className="w-4 h-4 rounded bg-green-500/10 text-green-600 flex items-center justify-center text-[8px]"><CheckCircle2 size={10} /></span>
                                            <span className="text-[10px] uppercase font-black tracking-wider text-gray-500">{selectedBlock.name} Settings</span>
                                        </div>

                                        {selectedBlock.type === 'hero_12' && (
                                            <>
                                                <div className="space-y-4">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Main Content</h3>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Badge Text</label>
                                                        <input value={selectedBlock.settings.topBadge || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'topBadge', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</label>
                                                        <textarea value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-20 p-3 bg-white border border-gray-300 rounded text-[11px] leading-relaxed resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Button Text</label>
                                                        <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Button URL</label>
                                                        <input value={selectedBlock.settings.buttonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonUrl', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Images</h3>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Background Image URL</label>
                                                        <input value={selectedBlock.settings.bgImageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'bgImageUrl', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Product Image URL</label>
                                                        <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">First Card</h3>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Card Heading</label>
                                                        <input value={selectedBlock.settings.card1Heading || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'card1Heading', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>

                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="p-3 bg-gray-50/50 border border-gray-100 rounded-lg space-y-3">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item {i} Letter</label>
                                                                <input value={selectedBlock.settings[`card1Icon${i}`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `card1Icon${i}`, e.target.value)} maxLength={1} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item {i} Title</label>
                                                                <input value={selectedBlock.settings[`card1Title${i}`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `card1Title${i}`, e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Item {i} Subtitle</label>
                                                                <input value={selectedBlock.settings[`card1Desc${i}`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `card1Desc${i}`, e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Second Card</h3>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Second Card Heading</label>
                                                        <input value={selectedBlock.settings.card2Heading || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'card2Heading', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                                                            Card Image
                                                        </label>
                                                        <input value={selectedBlock.settings.card2ImageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'card2ImageUrl', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Card Text Overlay</label>
                                                        <input value={selectedBlock.settings.card2Text || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'card2Text', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedBlock.type === 'hero_39' && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-semibold text-gray-400">Title</label>
                                                    <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-semibold text-gray-400">Description</label>
                                                    <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-20 outline-none focus:border-blue-500" />
                                                </div>
                                                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                                    <label className="text-[11px] font-semibold text-gray-400">Background Image URL</label>
                                                    <input value={selectedBlock.settings.bgImageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'bgImageUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                </div>
                                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                                    <label className="text-[11px] font-semibold text-gray-400 mb-1">Thumbnail Carousel (5 Images)</label>
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <input key={num} value={selectedBlock.settings[`thumb${num}`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `thumb${num}`, e.target.value)} placeholder={`Thumbnail ${num} image URL`} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[11px] font-medium outline-none focus:border-blue-500" />
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {selectedBlock.type === 'countdown_6' && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-semibold text-gray-400">Title</label>
                                                    <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                </div>
                                                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                                    <label className="text-[11px] font-semibold text-gray-400">Right Side Image URL</label>
                                                    <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                </div>
                                                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                                    <label className="text-[11px] font-semibold text-gray-400">Floating Badge Text</label>
                                                    <input value={selectedBlock.settings.badgeText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badgeText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                </div>
                                            </>
                                        )}

                                        {['countdown', 'countdown_7'].includes(selectedBlock.type) && (
                                            <>
                                                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Title</label>
                                                    <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{selectedBlock.type === 'countdown_7' ? 'Subtitle' : 'Description'}</label>
                                                    <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded text-[12px] resize-none h-16 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                                </div>

                                                {selectedBlock.type === 'countdown' && (
                                                    <>
                                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</label>
                                                            <input type="date" value={selectedBlock.settings.date || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'date', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Time</label>
                                                            <input type="time" value={selectedBlock.settings.time || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'time', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                                        </div>
                                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Image URL</label>
                                                            <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Button Text</label>
                                            <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Button Link</label>
                                            <input value={selectedBlock.settings.buttonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonUrl', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100] mb-2" />
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'how_it_works_2' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Heading</label>
                                            <input value={selectedBlock.settings.heading || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'heading', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="space-y-2 pt-2 border-t border-gray-100">
                                                <label className="text-[11px] font-semibold text-gray-400">Step {n} Title</label>
                                                <input value={selectedBlock.settings[`step${n}Title`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `step${n}Title`, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                <label className="text-[11px] font-semibold text-gray-400">Step {n} Description</label>
                                                <textarea value={selectedBlock.settings[`step${n}Desc`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `step${n}Desc`, e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedBlock.type === 'trusted_by_4' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500" />
                                        </div>
                                        {['logo1', 'logo2', 'logo3', 'logo4'].map((key, i) => (
                                            <div key={key} className="space-y-1.5 pt-2 border-t border-gray-100">
                                                <label className="text-[11px] font-semibold text-gray-400">Logo {i + 1} URL</label>
                                                <input value={selectedBlock.settings[key] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, key, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedBlock.type === 'trusted_by_2' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Title (Marquee label)</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        {['logo1', 'logo2', 'logo3', 'logo4', 'logo5'].map((key, i) => (
                                            <div key={key} className="space-y-1.5 pt-2 border-t border-gray-100">
                                                <label className="text-[11px] font-semibold text-gray-400">Logo {i + 1} URL</label>
                                                <input value={selectedBlock.settings[key] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, key, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedBlock.type === 'product_showcase_9' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Badge Text</label>
                                            <input value={selectedBlock.settings.badge || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badge', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Image Name (e.g. Aurora X-500)</label>
                                            <input value={selectedBlock.settings.imageName || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageName', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Product Subtitle</label>
                                            <input value={selectedBlock.settings.productTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'productTitle', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[11px] font-semibold text-gray-400">Product Image URL</label>
                                            <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className="space-y-1.5 pt-2 border-t border-gray-100">
                                                <label className="text-[11px] font-semibold text-gray-400">Feature {n} Tag (e.g. HIGH FIDELITY)</label>
                                                <input value={selectedBlock.settings[`feat${n}Tag`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `feat${n}Tag`, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                <label className="text-[11px] font-semibold text-gray-400">Feature {n} Title</label>
                                                <input value={selectedBlock.settings[`feat${n}Title`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `feat${n}Title`, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                <label className="text-[11px] font-semibold text-gray-400">Feature {n} Description</label>
                                                <textarea value={selectedBlock.settings[`feat${n}Desc`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `feat${n}Desc`, e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-14 outline-none focus:border-blue-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedBlock.type === 'countdown_2' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Badge Text</label>
                                            <input value={selectedBlock.settings.badge || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badge', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Sub Title</label>
                                            <input value={selectedBlock.settings.subTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'subTitle', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Image</label>
                                            <div className="relative group">
                                                <div className="aspect-video w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                                                    {selectedBlock.settings.imageUrl ? <Image src={selectedBlock.settings.imageUrl} alt="Preview" fill className="object-cover" unoptimized /> : <ImageIcon className="text-gray-300" size={24} />}
                                                </div>
                                                <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} placeholder="Image URL" className="mt-2 w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Button Text</label>
                                            <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Button Link</label>
                                            <div className="flex gap-2">
                                                <input value={selectedBlock.settings.buttonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonUrl', e.target.value)} className="flex-1 h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                                <button className="h-8 w-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50"><Link2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</label>
                                            <input type="date" value={selectedBlock.settings.date || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'date', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Time</label>
                                            <input type="time" value={selectedBlock.settings.time || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'time', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'countdown_3' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Badge Text</label>
                                            <input value={selectedBlock.settings.badge || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badge', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Heading</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Rotating Image 1 URL</label>
                                            <input value={selectedBlock.settings.image1 || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'image1', e.target.value)} placeholder="https://..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Rotating Image 2 URL</label>
                                            <input value={selectedBlock.settings.image2 || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'image2', e.target.value)} placeholder="https://..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Countdown Date</label>
                                            <input type="date" value={selectedBlock.settings.date || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'date', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Countdown Time</label>
                                            <input type="time" value={selectedBlock.settings.time || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'time', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Button Text</label>
                                            <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Button Link</label>
                                            <input value={selectedBlock.settings.buttonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonUrl', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'sales_3' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Badge Text</label>
                                            <input value={selectedBlock.settings.badgeText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badgeText', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                                                Image URL
                                                <ImageIcon size={12} />
                                            </label>
                                            <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image Y-Offset (px)</label>
                                            <input type="number" value={selectedBlock.settings.imagePosition || '0'} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imagePosition', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                                                Button Text
                                                <MousePointer2 size={12} />
                                            </label>
                                            <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                                                Button Link
                                                <Link2 size={12} />
                                            </label>
                                            <input value={selectedBlock.settings.buttonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonUrl', e.target.value)} placeholder="/shop or https://..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'product_highlights_9' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Badge Text</label>
                                            <input value={selectedBlock.settings.badge || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badge', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Heading</label>
                                            <input value={selectedBlock.settings.heading || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'heading', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500" />
                                        </div>
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} className="space-y-1.5 pt-2 border-t border-gray-100">
                                                <label className="text-[11px] font-semibold text-gray-400">Card {n} Image URL</label>
                                                <input value={selectedBlock.settings[`feat${n}Img`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `feat${n}Img`, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                <label className="text-[11px] font-semibold text-gray-400">Card {n} Title</label>
                                                <input value={selectedBlock.settings[`feat${n}Title`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `feat${n}Title`, e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                                <label className="text-[11px] font-semibold text-gray-400">Card {n} Description</label>
                                                <textarea value={selectedBlock.settings[`feat${n}Desc`] || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, `feat${n}Desc`, e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-14 outline-none focus:border-blue-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedBlock.type === 'checkout_1' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Page Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Step 1 Title (Contact)</label>
                                            <input value={selectedBlock.settings.step1 || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'step1', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Step 2 Title (Shipping)</label>
                                            <input value={selectedBlock.settings.step2 || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'step2', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Submit Button Text</label>
                                            <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-2">
                                            <label className="text-[11px] font-semibold text-gray-400">Show Logistics line</label>
                                            <button onClick={() => updateBlockSetting(selectedBlock.id, 'showLogistics', !selectedBlock.settings.showLogistics)} className={`w-8 h-4 rounded-full relative transition-all ${selectedBlock.settings.showLogistics ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 h-3 w-3 bg-white rounded-full shadow-sm transition-all ${selectedBlock.settings.showLogistics ? 'right-0.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'contact_1' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Description</label>
                                            <textarea value={selectedBlock.settings.subtitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'subtitle', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-20 outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Form Title</label>
                                            <input value={selectedBlock.settings.formTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'formTitle', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Open Hours From</label>
                                            <textarea value={selectedBlock.settings.openHours || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'openHours', e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-gray-100">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Contact Info</p>
                                                <input value={selectedBlock.settings.address || ''} placeholder="Address" onChange={(e) => updateBlockSetting(selectedBlock.id, 'address', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[11px] font-medium outline-none focus:border-blue-500" />
                                                <input value={selectedBlock.settings.phone || ''} placeholder="Phone" onChange={(e) => updateBlockSetting(selectedBlock.id, 'phone', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[11px] font-medium outline-none focus:border-blue-500" />
                                                <input value={selectedBlock.settings.email || ''} placeholder="Email" onChange={(e) => updateBlockSetting(selectedBlock.id, 'email', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[11px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'testimonial_1' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Section Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Badge Text</label>
                                            <input value={selectedBlock.settings.subtitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'subtitle', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[11px] font-semibold text-gray-400">Slide Speed ({selectedBlock.settings.speed || 15})</label>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="30"
                                                step="1"
                                                value={selectedBlock.settings.speed || 15}
                                                onChange={(e) => updateBlockSetting(selectedBlock.id, 'speed', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                            <div className="flex justify-between text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">
                                                <span>Slow</span>
                                                <span>Fast</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Testimonials</label>
                                                <button
                                                    onClick={() => {
                                                        const current = selectedBlock.settings.testimonials || [];
                                                        updateBlockSetting(selectedBlock.id, 'testimonials', [...current, { name: 'New Client', role: 'Role', quote: 'Write a review...', image: '', rating: 5, date: '2026' }]);
                                                    }}
                                                    className="p-1 px-2.5 bg-blue-500 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-1"
                                                >
                                                    <Plus size={10} /> Add Item
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                                {(selectedBlock.settings.testimonials || []).map((t: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl space-y-3 relative group/item shadow-sm">
                                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                                                            <span className="text-[10px] font-bold text-gray-900">Item {i + 1} - {t.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => {
                                                                    const current = [...selectedBlock.settings.testimonials];
                                                                    if (i > 0) {
                                                                        [current[i], current[i - 1]] = [current[i - 1], current[i]];
                                                                        updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                                    }
                                                                }} className="text-gray-300 hover:text-blue-500"><ChevronUp size={14} /></button>
                                                                <button onClick={() => {
                                                                    const current = [...(selectedBlock.settings.testimonials || [])];
                                                                    current.splice(i, 1);
                                                                    updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                                }} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Customer Image</label>
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                                                                    <Image src={t.image || 'https://via.placeholder.com/100'} alt="Avatar" width={40} height={40} className="object-cover" unoptimized />
                                                                </div>
                                                                <input placeholder="Image URL" value={t.image} onChange={(e) => {
                                                                    const current = [...selectedBlock.settings.testimonials];
                                                                    current[i].image = e.target.value;
                                                                    updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                                }} className="flex-1 h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Rating</label>
                                                            <input type="number" min="1" max="5" value={t.rating || 5} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].rating = parseInt(e.target.value);
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Customer Name</label>
                                                            <input value={t.name} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].name = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Testimonial Description</label>
                                                            <textarea value={t.quote} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].quote = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-16 p-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500 resize-none font-medium" placeholder="This is an amazing product! Highly recommended." />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Date</label>
                                                            <input value={t.date} placeholder="Dec 2025" onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].date = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const current = selectedBlock.settings.testimonials || [];
                                                        updateBlockSetting(selectedBlock.id, 'testimonials', [...current, { name: 'New Item', role: 'Role', quote: 'Description here...', image: '', rating: 5, date: '2026' }]);
                                                    }}
                                                    className="w-full py-2 bg-white border border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Plus size={12} /> Add Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'testimonial_2' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Section Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Subtitle</label>
                                            <input value={selectedBlock.settings.subtitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'subtitle', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Testimonials</label>
                                                <button
                                                    onClick={() => {
                                                        const current = selectedBlock.settings.testimonials || [];
                                                        updateBlockSetting(selectedBlock.id, 'testimonials', [...current, { name: 'New Client', role: 'Role', quote: 'Write a review...', image: '' }]);
                                                    }}
                                                    className="p-1 px-2.5 bg-blue-500 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-1"
                                                >
                                                    <Plus size={10} /> Add Item
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                                {(selectedBlock.settings.testimonials || []).map((t: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl space-y-3 relative group/item shadow-sm">
                                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                                                            <span className="text-[10px] font-bold text-gray-900">Item {i + 1} - {t.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => {
                                                                    const current = [...selectedBlock.settings.testimonials];
                                                                    if (i > 0) {
                                                                        [current[i], current[i - 1]] = [current[i - 1], current[i]];
                                                                        updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                                    }
                                                                }} className="text-gray-300 hover:text-blue-500"><ChevronUp size={14} /></button>
                                                                <button onClick={() => {
                                                                    const current = [...(selectedBlock.settings.testimonials || [])];
                                                                    current.splice(i, 1);
                                                                    updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                                }} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Image URL</label>
                                                            <input value={t.image} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].image = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Customer Name</label>
                                                            <input value={t.name} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].name = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Role</label>
                                                            <input value={t.role} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].role = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Quote</label>
                                                            <textarea value={t.quote} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.testimonials];
                                                                current[i].quote = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'testimonials', current);
                                                            }} className="w-full h-16 p-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500 resize-none font-medium" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type.startsWith('not_found_') && (
                                    <div className="space-y-4">
                                        {selectedBlock.settings.badge !== undefined && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-gray-400">Badge Text</label>
                                                <input value={selectedBlock.settings.badge || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'badge', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        )}
                                        {selectedBlock.settings.subtitle !== undefined && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-gray-400">Subtitle</label>
                                                <input value={selectedBlock.settings.subtitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'subtitle', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        )}
                                        {selectedBlock.settings.message !== undefined && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-gray-400">Message</label>
                                                <textarea value={selectedBlock.settings.message || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'message', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-16 outline-none focus:border-blue-500" />
                                            </div>
                                        )}
                                        {selectedBlock.settings.imageUrl !== undefined && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-gray-400">Image URL</label>
                                                <input value={selectedBlock.settings.imageUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'imageUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        )}
                                        <div className="space-y-1.5 border-t border-gray-100 pt-2">
                                            <label className="text-[11px] font-semibold text-gray-400">Home Button Text</label>
                                            <input value={selectedBlock.settings.homeText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'homeText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        {selectedBlock.settings.backText !== undefined && (
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-semibold text-gray-400">Back Button Text</label>
                                                <input value={selectedBlock.settings.backText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'backText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Home Button URL</label>
                                            <input value={selectedBlock.settings.homeUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'homeUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                    </div>
                                )}
                                {['countdown', 'sales_1', 'sales_2'].includes(selectedBlock.type) && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded text-[12px] font-medium resize-none h-24 outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[11px] font-semibold text-gray-400">Button Text</label>
                                            <input value={selectedBlock.settings.buttonText || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonText', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400">Button Link</label>
                                            <input value={selectedBlock.settings.buttonUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'buttonUrl', e.target.value)} className="w-full h-8 px-3 bg-white border border-gray-200 rounded text-[12px] font-medium outline-none focus:border-blue-500 mb-2" />
                                            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mx-auto"><AlignLeft size={12} /> Select from list</button>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Image</label>
                                            <div className="relative h-28 w-full rounded-lg border border-gray-200 overflow-hidden bg-white mb-2 shadow-sm">
                                                {selectedBlock.settings.imageUrl ? (
                                                    <Image src={selectedBlock.settings.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 justify-center bg-gradient-to-t from-black/80 to-transparent pt-6">
                                                    <button className="px-3 py-1 bg-white text-gray-800 text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 hover:bg-gray-50"><CloudUpload size={10} /> Change</button>
                                                    <button onClick={() => updateBlockSetting(selectedBlock.id, 'imageUrl', '')} className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 hover:bg-red-600"><X size={10} /> Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedBlock.type === 'footer_12' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logo URL (Override)</label>
                                            <div className="flex gap-2">
                                                <input value={selectedBlock.settings.logoUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'logoUrl', e.target.value)} placeholder="Main store logo will be used if empty" className="flex-1 h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Legal Title</label>
                                            <input value={selectedBlock.settings.legalTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'legalTitle', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Title</label>
                                            <input value={selectedBlock.settings.contactTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'contactTitle', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                            <input value={selectedBlock.settings.email || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'email', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone</label>
                                            <input value={selectedBlock.settings.phone || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'phone', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PAN/VAT Number</label>
                                            <input value={selectedBlock.settings.panNumber || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'panNumber', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Social Title</label>
                                            <input value={selectedBlock.settings.socialTitle || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'socialTitle', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><Facebook size={12}/> Facebook URL</label>
                                            <input value={selectedBlock.settings.fbUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'fbUrl', e.target.value)} placeholder="https://facebook.com/..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><Instagram size={12}/> Instagram URL</label>
                                            <input value={selectedBlock.settings.igUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'igUrl', e.target.value)} placeholder="https://instagram.com/..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><Twitter size={12}/> TikTok URL</label>
                                            <input value={selectedBlock.settings.ttUrl || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'ttUrl', e.target.value)} placeholder="https://tiktok.com/@..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Show Made with Create Vendor</label>
                                                <button onClick={() => updateBlockSetting(selectedBlock.id, 'showMadeWith', !selectedBlock.settings.showMadeWith)} className={`w-8 h-4 rounded-full transition-all relative ${selectedBlock.settings.showMadeWith ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedBlock.settings.showMadeWith ? 'left-4.5' : 'left-0.5'}`} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Show PAN Number</label>
                                            <button onClick={() => updateBlockSetting(selectedBlock.id, 'showPan', !selectedBlock.settings.showPan)} className={`w-8 h-4 rounded-full transition-all relative ${selectedBlock.settings.showPan ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedBlock.settings.showPan ? 'left-4.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {(selectedBlock.type === 'branch_1' || selectedBlock.type === 'branch_2') && (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Section Title</label>
                                            <input value={selectedBlock.settings.title || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'title', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                            <textarea value={selectedBlock.settings.description || ''} onChange={(e) => updateBlockSetting(selectedBlock.id, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100] resize-none" />
                                        </div>
                                        <div className="space-y-1.5 pt-3 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Google Maps Embed URL</label>
                                            <p className="text-[10px] text-gray-400 leading-relaxed">Go to Google Maps → Share → Embed a map → Copy the <code className="bg-gray-100 px-1 rounded">src</code> URL only (or paste the entire iframe code)</p>
                                            <input value={selectedBlock.settings.mapUrl || ''} onChange={(e) => {
                                                let val = e.target.value;
                                                // Extract src if iframe is pasted
                                                if (val.includes('<iframe') && val.includes('src=')) {
                                                    const match = val.match(/src="([^"]+)"/);
                                                    if (match && match[1]) val = match[1];
                                                }
                                                updateBlockSetting(selectedBlock.id, 'mapUrl', val);
                                            }} placeholder="https://www.google.com/maps/embed?pb=..." className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[11px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Map Frame Height (px)</label>
                                            <input type="number" min="200" max="800" value={selectedBlock.settings.mapHeight || '400'} onChange={(e) => updateBlockSetting(selectedBlock.id, 'mapHeight', e.target.value)} className="w-full h-9 px-3 bg-white border border-gray-300 rounded text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 relative z-[100]" />
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Show Map</label>
                                            <button onClick={() => updateBlockSetting(selectedBlock.id, 'showMap', !selectedBlock.settings.showMap)} className={`w-8 h-4 rounded-full transition-all relative ${selectedBlock.settings.showMap ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedBlock.settings.showMap ? 'left-4' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branch Locations</label>
                                                <button
                                                    onClick={() => {
                                                        const current = selectedBlock.settings.branches || [];
                                                        updateBlockSetting(selectedBlock.id, 'branches', [...current, { name: 'New Branch', address: '', phone: '', hours: '' }]);
                                                    }}
                                                    className="p-1 px-2.5 bg-blue-500 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-1"
                                                >
                                                    <Plus size={10} /> Add Branch
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                                {(selectedBlock.settings.branches || []).map((b: any, i: number) => (
                                                    <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl space-y-3 relative group/item shadow-sm">
                                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                                                            <span className="text-[10px] font-bold text-gray-900">Branch {i + 1} - {b.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => {
                                                                    const current = [...selectedBlock.settings.branches];
                                                                    if (i > 0) {
                                                                        [current[i], current[i - 1]] = [current[i - 1], current[i]];
                                                                        updateBlockSetting(selectedBlock.id, 'branches', current);
                                                                    }
                                                                }} className="text-gray-300 hover:text-blue-500"><ChevronUp size={14} /></button>
                                                                <button onClick={() => {
                                                                    const current = [...(selectedBlock.settings.branches || [])];
                                                                    current.splice(i, 1);
                                                                    updateBlockSetting(selectedBlock.id, 'branches', current);
                                                                }} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Branch Name</label>
                                                            <input value={b.name} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.branches];
                                                                current[i].name = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'branches', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Address</label>
                                                            <input value={b.address || ''} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.branches];
                                                                current[i].address = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'branches', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Phone Number</label>
                                                            <input value={b.phone || ''} onChange={(e) => {
                                                                const current = [...selectedBlock.settings.branches];
                                                                current[i].phone = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'branches', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Opening Hours</label>
                                                            <input value={b.hours || ''} placeholder="Mon - Sun: 9 AM - 8 PM" onChange={(e) => {
                                                                const current = [...selectedBlock.settings.branches];
                                                                current[i].hours = e.target.value;
                                                                updateBlockSetting(selectedBlock.id, 'branches', current);
                                                            }} className="w-full h-7 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] outline-none focus:bg-white focus:border-blue-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button onClick={() => setSelectedBlockId(null)} className="w-full py-3 text-[10px] font-black uppercase text-gray-400 hover:text-black tracking-widest">Done Editing</button>
                            </div>
                        )}

                        <div className="pt-10">
                            <button onClick={handleSave} disabled={saving} className="w-full h-12 bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-600 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2">
                                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={14} className="mr-1" />} Apply Live
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Component Browser Modal */}
            <AnimatePresence>
                {isComponentBrowserOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                                <div>
                                    <h2 className="text-[16px] font-bold text-gray-900">Browse Components</h2>
                                    <p className="text-[12px] text-gray-500">Click a component to add it to your page</p>
                                </div>
                                <button onClick={() => setIsComponentBrowserOpen(false)} className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-all">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                                <div className="relative w-full max-w-full">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search all components..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[13px] outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Categories Sidebar */}
                                <div className="w-[220px] border-r border-gray-100 overflow-y-auto custom-scrollbar p-4 space-y-1 shrink-0 bg-white">
                                    {[
                                        { id: 'New', count: PREMADE_COMPONENTS.filter(c => !c.type.startsWith('not_found_') && !c.type.startsWith('checkout_') && !c.type.startsWith('contact_') && !c.type.startsWith('how_it_works_') && !c.type.startsWith('trusted_by_') && !c.type.startsWith('countdown') && !c.type.startsWith('footer_') && !c.type.startsWith('testimonial_') && !c.type.startsWith('sales_') && !c.type.startsWith('hero')).length },
                                        { id: '404', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('not_found_')).length },
                                        { id: 'Blocks', count: 0 },
                                        { id: 'About', count: 0 },
                                        { id: 'All Products', count: 0 },
                                        { id: 'Bento Grids', count: 0 },
                                        { id: 'Blog Details', count: 0 },
                                        { id: 'Blog List', count: 0 },
                                        { id: 'Branches', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('branch_')).length },
                                        { id: 'Brands', count: 0 },
                                        { id: 'Categories', count: 0 },
                                        { id: 'Checkouts', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('checkout_')).length },
                                        { id: 'Combo Products', count: 0 },
                                        { id: 'Contact Form', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('contact_')).length },
                                        { id: 'Faqs', count: 0 },
                                        { id: 'Featured Products', count: 0 },
                                        { id: 'Features', count: 0 },
                                        { id: 'Footers', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('footer_')).length },
                                        { id: 'Headers', count: 0 },
                                        { id: 'Hero Sections', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('hero')).length },
                                        { id: 'How It Works', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('how_it_works_')).length },
                                        { id: 'Trusted By', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('trusted_by_')).length },
                                        { id: 'Countdown', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('countdown')).length },
                                        { id: 'Sales & Offers', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('sales_')).length },
                                        { id: 'Testimonials', count: PREMADE_COMPONENTS.filter(c => c.type.startsWith('testimonial_')).length },
                                        { id: 'Order Ratings', count: 0 },
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setBrowserCategory(cat.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-semibold transition-all ${browserCategory === cat.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                        >
                                            {cat.id} <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${browserCategory === cat.id ? 'bg-white text-blue-500 shadow-sm' : 'bg-gray-100 text-gray-400'}`}>{cat.count}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Components Grid */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {PREMADE_COMPONENTS.filter(comp => {
                                            if (browserCategory === '404') return comp.type.startsWith('not_found_');
                                            if (browserCategory === 'Checkouts') return comp.type.startsWith('checkout_');
                                            if (browserCategory === 'Contact Form') return comp.type.startsWith('contact_');
                                            if (browserCategory === 'How It Works') return comp.type.startsWith('how_it_works_');
                                            if (browserCategory === 'Trusted By') return comp.type.startsWith('trusted_by_');
                                            if (browserCategory === 'Countdown') return comp.type.startsWith('countdown');
                                            if (browserCategory === 'Testimonials') return comp.type.startsWith('testimonial_');
                                            if (browserCategory === 'Footers') return comp.type.startsWith('footer_');
                                            if (browserCategory === 'Branches') return comp.type.startsWith('branch_');
                                            if (browserCategory === 'Sales & Offers') return comp.type.startsWith('sales_');
                                            if (browserCategory === 'Hero Sections') return comp.type.startsWith('hero');
                                            if (browserCategory === 'New') return !comp.type.startsWith('not_found_') && !comp.type.startsWith('checkout_') && !comp.type.startsWith('contact_') && !comp.type.startsWith('how_it_works_') && !comp.type.startsWith('trusted_by_') && !comp.type.startsWith('countdown') && !comp.type.startsWith('testimonial_') && !comp.type.startsWith('footer_') && !comp.type.startsWith('branch_') && !comp.type.startsWith('sales_') && !comp.type.startsWith('hero');
                                            return false;
                                        }).map((comp, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    addBlock(comp);
                                                    setIsComponentBrowserOpen(false);
                                                }}
                                                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-200 transition-all cursor-pointer group flex flex-col h-48 relative"
                                            >
                                                {i === 0 && <span className="absolute top-3 right-3 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 w-max tracking-wide shadow-md">New</span>}
                                                <div className="flex-1 bg-white p-2 border-b border-gray-50 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-50/10 transition-colors">
                                                    {(comp as any).previewImage || (comp.defaultSettings as any)?.imageUrl ? (
                                                        <Image src={(comp as any).previewImage || (comp.defaultSettings as any).imageUrl} alt={comp.name} fill className="object-contain p-2 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all" unoptimized />
                                                    ) : (
                                                        <div className="h-full w-full bg-white shadow-sm border border-gray-100 rounded-md relative flex items-center justify-center">
                                                            <div className="w-1/2 h-2/3 bg-gray-50 rounded" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-white shrink-0 border-t border-gray-50">
                                                    <p className="text-[12px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{comp.name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Your custom component</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }` }} />
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { db } from '../firebase/config';
import { Store } from '../types';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Palette,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Tag,
  Megaphone,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Store as StoreIcon,
  Bell,
  Handshake,
  Truck,
  Box,
  Globe,
  Info,
  Puzzle,
  AlertCircle,
  ChevronsUpDown,
  Menu,
  X,
  Layers,
  Star,
  UserPlus,
  Mail,
  Shield,
  Phone,
  MapPin,
  ClipboardList,
  CreditCard,
  Layout,
  User,
  History,
  FileSearch,
  BookOpen,
  DollarSign,
  HelpCircle as HelpIcon,
  MessageSquare as BlogIcon,
  StickyNote,
  Undo2,
  RefreshCcw,
  Plus,
  Zap
} from 'lucide-react';

export const StoreDashboardSidebar: React.FC = () => {
  const params = useParams();
  const storeId = params?.storeId as string;
  const pathname = usePathname();
  const { storeData: store } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // State for expanded menus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Products': false,
    'Customers': false,
    'Promotions': false,
    'Delivery': false,
    'Dropshipping': false,
    'Basic Content': true,
    'Store Settings': true,
    'Help Center': false,
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (!store) return null;

  const navItems = [
    { type: 'divider', label: 'General' },
    { label: 'Dashboard', icon: LayoutDashboard, href: `/dashboard/${store.id}` },
    {
      type: 'dropdown',
      label: 'Products',
      icon: Package,
      subitems: [
        { label: 'All Products', icon: Package, href: `/dashboard/${store.id}/products` },
        { label: 'Categories', icon: Layers, href: `/dashboard/${store.id}/products/categories` },
        { label: 'Brands', icon: Tag, href: `/dashboard/${store.id}/products/brands` },
        { label: 'Features', icon: Star, href: `/dashboard/${store.id}/products/features` },
        { label: 'Featured Products', icon: Megaphone, href: `/dashboard/${store.id}/products/featured` },
        { label: 'Reviews By Customer', icon: MessageSquare, href: `/dashboard/${store.id}/products/reviews` },
      ]
    },
    { label: 'Orders', icon: ShoppingCart, href: `/dashboard/${store.id}/orders` },
    { label: 'Notifications', icon: Bell, href: `/dashboard/${store.id}/notifications` },
    {
      type: 'dropdown',
      label: 'Customers',
      icon: Users,
      subitems: [
        { label: 'Contact Forms', icon: Mail, href: `/dashboard/${store.id}/customers/contact` },
        { label: 'Past Customers', icon: History, href: `/dashboard/${store.id}/customers/past` },
      ]
    },
    {
      type: 'dropdown',
      label: 'Promotions',
      icon: Tag,
      subitems: [
        { label: 'Promotional Offers', icon: Megaphone, href: `/dashboard/${store.id}/promotions/offers` },
        { label: 'Promocodes', icon: Tag, href: `/dashboard/${store.id}/promotions/codes` },
      ]
    },
    { label: 'Affiliates', icon: Handshake, href: `/dashboard/${store.id}/affiliates` },
    {
      type: 'dropdown',
      label: 'Delivery',
      icon: Truck,
      subitems: [
        { label: 'Delivery Prices', icon: DollarSign, href: `/dashboard/${store.id}/delivery/prices` },
        { label: 'Installation Presets', icon: Settings, href: `/dashboard/${store.id}/delivery/installation` },
        { label: 'Delivery Partners', icon: Users, href: `/dashboard/${store.id}/delivery/partners` },
        { label: 'Custom Delivery Ad', icon: Info, href: `/dashboard/${store.id}/delivery/custom` },
      ]
    },
    {
      type: 'dropdown',
      label: 'Dropshipping',
      icon: Box,
      subitems: [
        { label: 'Products', icon: Box, href: `/dashboard/${store.id}/dropshipping/products` },
        { label: 'Payment Settlement', icon: CreditCard, href: `/dashboard/${store.id}/dropshipping/settlement` }
      ]
    },
    { type: 'divider', label: 'Website' },
    {
      type: 'dropdown',
      label: 'Basic Content',
      icon: Info,
      subitems: [
        { label: 'Footer', icon: Layout, href: `/dashboard/${store.id}/website/footer` },
        { label: 'Branches', icon: MapPin, href: `/dashboard/${store.id}/website/branches` },
        { label: 'Blog Posts', icon: BlogIcon, href: `/dashboard/${store.id}/website/blog` },
        { label: 'FAQ', icon: HelpIcon, href: `/dashboard/${store.id}/website/faq` },
        { label: 'Privacy Policy', icon: Shield, href: `/dashboard/${store.id}/website/privacy` },
        { label: 'Terms & Conditions', icon: StickyNote, href: `/dashboard/${store.id}/website/terms` },
        { label: 'Return Policy', icon: Undo2, href: `/dashboard/${store.id}/website/return` },
        { label: 'Refund Policy', icon: RefreshCcw, href: `/dashboard/${store.id}/website/refund` },
        { label: 'About Page', icon: Info, href: `/dashboard/${store.id}/website/about` },
        { label: 'Email Preference', icon: Mail, href: `/dashboard/${store.id}/settings/email` }
      ]
    },
    {
      type: 'dropdown',
      label: 'Store Settings',
      icon: Settings,
      subitems: [
        { label: 'Shop Info', icon: StoreIcon, href: `/dashboard/${store.id}/settings/info` },
        { label: 'Custom Domain', icon: Globe, href: `/dashboard/${store.id}/settings/domain` },
        { label: 'Managers', icon: Users, href: `/dashboard/${store.id}/settings/managers` },
        { label: 'Appearance', icon: Palette, href: `/dashboard/${store.id}/settings/appearance` },
        { label: 'Payment Methods', icon: CreditCard, href: `/dashboard/${store.id}/settings/payments` },
        { label: 'Website Templates', icon: Globe, href: `/dashboard/${store.id}/settings/templates` },
        { label: 'Email preference', icon: Mail, href: `/dashboard/${store.id}/settings/email` }
      ]
    },
    { label: 'Plugins', icon: Puzzle, href: `/dashboard/${store.id}/plugins` },
    { type: 'divider', label: 'Other' },
    {
      type: 'dropdown',
      label: 'Help Center',
      icon: HelpCircle,
      subitems: [
        { label: 'Overview', icon: BookOpen, href: `/dashboard/${store.id}/help` },
        { label: 'Getting Started', icon: Zap, href: `/dashboard/${store.id}/help/getting-started` },
        { label: 'Products', icon: Package, href: `/dashboard/${store.id}/help/products` },
        { label: 'Orders', icon: ShoppingCart, href: `/dashboard/${store.id}/help/orders` },
        { label: 'Customers', icon: Users, href: `/dashboard/${store.id}/help/customers` },
        { label: 'Promotional Offers', icon: Tag, href: `/dashboard/${store.id}/help/promotions` },
        { label: 'Payment Methods', icon: CreditCard, href: `/dashboard/${store.id}/help/payments` },
        { label: 'Delivery Presets', icon: Truck, href: `/dashboard/${store.id}/help/delivery` },
        { label: 'Settings', icon: Settings, href: `/dashboard/${store.id}/help/settings` },
        { label: 'About Page', icon: Info, href: `/dashboard/${store.id}/help/about` },
        { label: 'Email Preference', icon: Mail, href: `/dashboard/${store.id}/help/email-preference` },
        { label: 'Dropshipping & Create Vendor', icon: Box, href: `/dashboard/${store.id}/help/dropshipping` },
        { label: 'FAQs', icon: HelpIcon, href: `/dashboard/${store.id}/help/faqs` },
      ]
    },
    { label: 'My Reports', icon: AlertCircle, href: `/dashboard/${store.id}/reports` }
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo showText={false} className="scale-75 origin-left" />
          <span className="font-semibold truncate max-w-[150px]">{store.name}</span>
        </div>
        <button onClick={toggleSidebar} className="p-2 text-gray-600">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:h-screen lg:shadow-sm
      `}>
        <div className="p-4 border-b hidden lg:block bg-muted/5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50 flex items-center justify-center">
              {(store as any).appearance?.logoUrl ? (
                <Image 
                   src={(store as any).appearance.logoUrl} 
                   alt={store.name} 
                   fill 
                   className="object-contain p-1.5" 
                   unoptimized 
                />
              ) : (
                <Logo showText={false} className="scale-75" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-[13px] text-gray-900 truncate leading-tight">{store.name}</h2>
              <p className="text-[9px] text-gray-400 truncate uppercase tracking-widest font-bold mt-0.5">Admin Panel</p>
            </div>
          </div>
          <Link
            href={`/store/${store.id}`}
            target="_blank"
            className="w-full flex items-center px-3 py-2 bg-white border rounded-lg text-xs font-medium transition-all hover:bg-gray-50 text-gray-600"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2 text-gray-500" />
            <span className="flex-1">Visit Your Shop</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          </Link>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar mt-16 lg:mt-0">
          <nav className="space-y-1 px-2">
            {navItems.map((item, idx) => {
              if (item.type === 'divider') {
                return (
                  <div key={idx} className="pt-4 pb-1 px-3">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</span>
                  </div>
                );
              }

              if (item.type === 'dropdown') {
                const Icon = item.icon as any;
                const isExpanded = expandedMenus[item.label!];
                const isActiveGroup = item.subitems?.some(sub => pathname === sub.href);

                return (
                  <div key={idx} className="space-y-0.5">
                    <button
                      onClick={() => toggleMenu(item.label!)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-[13px] group
                        ${isExpanded ? 'bg-white border text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-4 w-4 ${isExpanded ? 'text-gray-900' : 'text-gray-500'}`} />
                        <span className={isExpanded ? 'font-medium' : 'font-normal'}>{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && item.subitems && (
                      <div className="pl-4 pr-1 space-y-0.5 py-1 flex flex-col relative">
                        {/* Vertical line connector */}
                        <div className="absolute left-[20px] top-0 bottom-4 w-[1px] bg-gray-100" />

                        {item.subitems.map((subitem, subIdx) => {
                          const isSubActive = pathname === subitem.href;
                          const SubIcon = subitem.icon as any;
                          return (
                            <Link
                              key={subIdx}
                              href={subitem.href}
                              onClick={() => {
                                if (window.innerWidth < 1024) setIsOpen(false);
                              }}
                              className={`
                                flex items-center gap-3 py-1.5 px-3 rounded-lg text-[13px] relative z-10
                                ${isSubActive ? 'bg-gray-50 text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                              `}
                            >
                              <SubIcon className={`h-3.5 w-3.5 ${isSubActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <span className="truncate">{subitem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon as any;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={idx}
                  href={item.href!}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-[13px]
                    ${isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <span className={isActive ? 'font-medium' : 'font-normal'}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="p-3 border-t bg-white mt-auto">
          <button className="flex items-center space-x-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-500 bg-emerald-100 text-emerald-700">B</div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-[13px] font-semibold text-gray-900 truncate">Bishal Mishra</h4>
              <p className="text-[11px] text-gray-500 truncate mt-0.5 lowercase">bishalmishra1000@gmail...</p>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </aside>
    </>
  );
};

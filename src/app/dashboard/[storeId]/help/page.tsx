'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Rocket, Package, ShoppingCart, Users, Tag, CreditCard, Truck, Settings, Box, HelpCircle, BookOpen, ArrowRight, Mail, Info, Globe, Palette, FileText, Handshake, DollarSign, Layout, Star
} from 'lucide-react';

const HELP_SECTIONS = [
  {
    icon: Rocket,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Getting Started',
    desc: 'Learn the basics and set up your shop',
    href: 'getting-started',
  },
  {
    icon: Package,
    color: 'text-green-500',
    bg: 'bg-green-50',
    label: 'Products',
    desc: 'Manage your product catalog and inventory',
    href: 'products',
  },
  {
    icon: ShoppingCart,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    label: 'Orders',
    desc: 'Process and track customer orders',
    href: 'orders',
  },
  {
    icon: Users,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    label: 'Customers',
    desc: 'Manage customer data and relationships',
    href: 'customers',
  },
  {
    icon: Tag,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    label: 'Promotional Offers',
    desc: 'Create and manage discounts and campaigns',
    href: 'promotions',
  },
  {
    icon: Star,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    label: 'Promocodes',
    desc: 'Create and manage discount codes',
    href: 'promocodes',
  },
  {
    icon: Handshake,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    label: 'Affiliates',
    desc: 'Manage affiliate partners and commissions',
    href: 'affiliates',
  },
  {
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    label: 'Delivery Prices',
    desc: 'Set base delivery prices for your store',
    href: 'delivery-prices',
  },
  {
    icon: Settings,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'Installation Presets',
    desc: 'Manage installation costs for different cities',
    href: 'installation-presets',
  },
  {
    icon: Users,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    label: 'Delivery Partners',
    desc: 'Manage third-party delivery services',
    href: 'delivery-partners',
  },
  {
    icon: Info,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    label: 'Custom Delivery Ad',
    desc: 'Promote delivery in specific regions',
    href: 'custom-delivery-ad',
  },
  {
    icon: CreditCard,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Payment Methods',
    desc: 'Configure payment options for your customers',
    href: 'payments',
  },
  {
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Payment Settlement',
    desc: 'Track and withdraw your shop earnings',
    href: 'settlement',
  },
  {
    icon: Truck,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    label: 'Delivery Presets',
    desc: 'Manage delivery charges for different districts',
    href: 'delivery',
  },
  {
    icon: Settings,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    label: 'Settings',
    desc: 'Configure your core shop settings',
    href: 'settings',
  },
  {
    icon: Box,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Dropshipping & Create Vendor',
    desc: 'Learn about dropshipping and selling as a vendor',
    href: 'dropshipping',
  },
  {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'About Page',
    desc: 'Customize your shop\'s about page content',
    href: 'about',
  },
  {
    icon: Mail,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    label: 'Email Preference',
    desc: 'Manage email notification settings',
    href: 'email-preference',
  },
  {
    icon: HelpCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'FAQs',
    desc: 'Frequently asked questions and answers',
    href: 'faqs',
  },
];

export default function HelpCenterPage() {
  const params = useParams();
  const storeId = params?.storeId as string;

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[20px] font-bold text-gray-900">Help Center</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Find answers, guides, and documentation to help you manage your shop effectively.
          </p>
        </div>

        {/* Help Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {HELP_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={`/dashboard/${storeId}/help/${section.href}`}
                className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg ${section.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-gray-900">{section.label}</h3>
                </div>
                <p className="text-[12px] text-gray-500 mb-4">{section.desc}</p>
                <div className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 group-hover:bg-gray-50 transition-all w-full justify-center">
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-gray-700" />
            <h3 className="text-[14px] font-semibold text-gray-900">Need More Help?</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-4">
            If you can&apos;t find the information you need, our support team is ready to assist you.
          </p>
          <div className="flex gap-4">
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
                Documentation
             </button>
             <button className="px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 shadow-md">
                Contact Support
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

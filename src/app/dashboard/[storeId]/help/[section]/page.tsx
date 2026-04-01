'use client';

import React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Rocket,
  Settings,
  Plus,
  Layers,
  Box,
  CheckCircle2,
  ArrowRight,
  ShoppingCart,
  Zap,
  Tag,
  Users,
  CreditCard,
  Truck,
  HelpCircle,
  BookOpen,
  Info,
  Clock,
  Eye,
  Search,
  Percent,
  Calendar,
  FileText,
  User,
  Layout,
  UserPlus,
  ShieldCheck,
  MapPin,
  AlertCircle,
  XCircle,
  Clock8,
  ChevronDown,
  LayoutDashboard,
  Mail,
  Smartphone,
  Store as StoreIcon,
  Package,
  History,
  Undo2,
  RefreshCcw,
  StickyNote,
  Shield,
  SearchIcon,
  CheckCircle
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { icon: BookOpen, label: 'Overview', href: 'overview' },
  { icon: Rocket, label: 'Getting Started', href: 'getting-started' },
  { icon: Package, label: 'Products', href: 'products' },
  { icon: ShoppingCart, label: 'Orders', href: 'orders' },
  { icon: Users, label: 'Customers', href: 'customers' },
  { icon: Tag, label: 'Promotional Offers', href: 'promotions' },
  { icon: CreditCard, label: 'Payment Methods', href: 'payments' },
  { icon: Box, label: 'Delivery Presets', href: 'delivery' },
  { icon: RefreshCcw, label: 'Refund Policy', href: 'refund-policy' },
  { icon: Undo2, label: 'Return Policy', href: 'return-policy' },
  { icon: FileText, label: 'Terms & Conditions', href: 'terms-conditions' },
  { icon: Shield, label: 'Privacy Policy', href: 'privacy-policy' },
  { icon: Settings, label: 'Settings', href: 'settings' },
  { icon: Truck, label: 'Dropshipping & Create Vendor', href: 'dropshipping' },
  { icon: Mail, label: 'Email Preference', href: 'email-preference' },
  { icon: HelpCircle, label: 'FAQs', href: 'faqs' },
  { icon: Info, label: 'About', href: 'about' },
];

export default function HelpSubPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const section = params?.section as string;
  const storeId = params?.storeId as string;
  const [activeFaq, setActiveFaq] = React.useState<string | null>('gs-1');

  const renderGettingStarted = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900 leading-none">Getting Started</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Welcome! Follow these steps to set up your e-commerce shop and start selling.</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Rocket className="h-4 w-4 text-gray-900" />
          <h2 className="text-[14px] font-bold text-gray-900">Quick Start Guide</h2>
        </div>
        <p className="text-[12px] text-gray-400 mb-6 font-medium leading-none">Get your shop up and running in minutes</p>

        <div className="space-y-6 relative">
          <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-gray-100" />

          {[
            { 
              step: 1, 
              icon: StoreIcon, 
              title: 'Create Your Shop', 
              desc: 'Set up your shop profile with basic information',
              link: `/dashboard/${storeId}/settings/info`,
              btnText: 'Go to Create Your Shop'
            },
            { 
              step: 2, 
              icon: Settings, 
              title: 'Configure Settings', 
              desc: 'Update your shop settings and preferences',
              link: `/dashboard/${storeId}/help/settings`,
              btnText: 'Go to Configure Settings'
            },
            { 
              step: 3, 
              icon: Box, 
              title: 'Add Products', 
              desc: 'Start adding products to your catalog',
              link: `/dashboard/${storeId}/products`,
              btnText: 'Go to Add Products'
            }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 relative z-10">
              <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{item.step}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="h-3.5 w-3.5 text-gray-600" />
                  <h3 className="text-[13.5px] font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-[12px] text-gray-500 mb-3.5 font-medium leading-relaxed">{item.desc}</p>
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm bg-white"
                >
                  {item.btnText} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mb-4">
        <h3 className="text-[14px] font-bold text-gray-900 mb-1">Key Features</h3>
        <p className="text-[12px] text-gray-400 mb-5 font-medium leading-none">What you can do with your e-commerce platform</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3.5 gap-x-8">
          {[
            'Manage unlimited products',
            'Create promotional offers',
            'Customize shop appearance',
            'Track orders and customers',
            'Configure payment methods',
            'Invite team members'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[12.5px] text-gray-700 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <h3 className="text-[14px] font-bold text-gray-900 mb-1">Next Steps</h3>
        <p className="text-[12px] text-gray-400 mb-5 font-medium leading-none">Once you&apos;ve completed the quick start guide, explore these areas:</p>

        <div className="flex flex-wrap gap-2.5">
          {[
            { label: 'Products Guide', href: 'products' },
            { label: 'Orders Guide', href: 'orders' },
            { label: 'Settings Guide', href: 'settings' }
          ].map((item, i) => (
            <Link
              key={i}
              href={`/dashboard/${storeId}/help/${item.href}`}
              className="px-4 py-1.5 border border-gray-200 rounded-lg text-[11px] font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm bg-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">Products Management</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Learn how to manage your product catalog, categories, and inventory.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Box className="h-4 w-4 text-gray-900" />
            <h3 className="text-[14px] font-bold text-gray-900">Adding Products</h3>
          </div>
          <p className="text-[12px] text-gray-400 mb-5 -mt-3.5 font-medium leading-none">Learn how to add new products to your catalog</p>
          <div className="space-y-3">
            {[
              'Navigate to Products → Create Product',
              'Fill in product details (name, description, price)',
              'Upload product images',
              'Set product variants if applicable',
              'Assign categories and subcategories',
              'Save and publish your product'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-gray-900" />
            <h3 className="text-[14px] font-bold text-gray-900">Managing Categories</h3>
          </div>
          <p className="text-[12px] text-gray-400 mb-5 -mt-3.5 font-medium leading-none">Organize your products with categories</p>
          <div className="space-y-3">
            {[
              'Go to Products → Categories',
              'Create main categories for your products',
              'Add subcategories for better organization',
              'Assign products to appropriate categories',
              'Use categories to help customers find products easily'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Box className="h-4 w-4 text-gray-900" />
            <h3 className="text-[14px] font-bold text-gray-900">Product Variants</h3>
          </div>
          <p className="text-[12px] text-gray-400 mb-5 -mt-3.5 font-medium leading-none">Create products with multiple options</p>
          <div className="space-y-3">
            {[
              'When creating a product, add variants',
              'Define variant attributes (size, color, etc.)',
              'Set different prices for each variant',
              'Upload variant-specific images',
              'Manage inventory for each variant'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[13px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/${storeId}/products`}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded-lg text-[11.5px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Create Product
            </Link>
            <Link
              href={`/dashboard/${storeId}/products/categories`}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
            >
              <Layers className="h-4 w-4 text-gray-500" /> Manage Categories
            </Link>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[13px] font-bold text-gray-900 mb-5 uppercase tracking-wider">Tips & Best Practices</h3>
          <div className="space-y-3">
            {[
              'Use high-quality product images (at least 800x800px)',
              'Write detailed product descriptions to improve SEO',
              'Organize products into logical categories',
              'Keep inventory levels updated regularly',
              'Use product variants for items with multiple options'
            ].map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                <span className="text-[12.5px] text-gray-600 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">Orders Management</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Learn how to create, track, and manage orders effectively.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-4 w-4 text-gray-900" />
            <h3 className="text-[14px] font-bold text-gray-900">Creating Orders</h3>
          </div>
          <p className="text-[12px] text-gray-400 mb-5 -mt-3.5 font-medium leading-none">Learn how to create orders manually</p>
          <div className="space-y-3">
            {[
              'Navigate to Orders → Create Order',
              'Select or add customer information',
              'Add products to the order',
              'Set order status and payment method',
              'Review and confirm the order'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-4 w-4 text-gray-900" />
            <h3 className="text-[14px] font-bold text-gray-900">Managing Orders</h3>
          </div>
          <p className="text-[12px] text-gray-400 mb-5 -mt-3.5 font-medium leading-none">Track and update order status</p>
          <div className="space-y-3">
            {[
              'View all orders in the Orders page',
              'Use filters to find specific orders',
              'Click on an order to view details',
              'Update order status as it progresses',
              'Track order history and updates'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[13px] font-bold text-gray-900 mb-5 uppercase tracking-wider">Order Statuses</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Pending', desc: 'Order has been placed but not yet approved' },
              { label: 'Approved', desc: 'Order has been approved and is being prepared' },
              { label: 'Packaging', desc: 'Items are being packaged for shipment' },
              { label: 'Shipping', desc: 'Order is being shipped to customer' },
              { label: 'Shipped', desc: 'Order has been shipped' },
              { label: 'Delivering', desc: 'Order is out for delivery' },
              { label: 'Delivered', desc: 'Order has been successfully delivered' },
              { label: 'Canceled', desc: 'Order has been canceled' }
            ].map((status, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 flex-shrink-0">
                  <span className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-black text-center w-full uppercase">
                    {status.label}
                  </span>
                </div>
                <span className="text-[12px] text-gray-500 font-medium">{status.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[13px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/${storeId}/orders`}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 rounded-lg text-[11px] font-black text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Create Order
            </Link>
            <Link
              href={`/dashboard/${storeId}/orders`}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg text-[11px] font-black text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" /> View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Customers Management</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn how to view and manage your customer database.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Users className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Viewing Customers</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">Access and browse your customer list</p>
          <div className="space-y-3.5">
            {[
              'Navigate to Customers from the sidebar',
              'View all registered customers',
              'Use search to find specific customers',
              'Click on a customer to view details',
              'See customer order history and information'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Users className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Customer Information</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">What information is available for each customer</p>
          <div className="space-y-3.5">
            {[
              'Customer name and contact details',
              'Order history and purchase statistics',
              'Total amount spent',
              'Last order date',
              'Customer preferences and notes'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Users className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Managing Customer Data</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">Best practices for customer management</p>
          <div className="space-y-3.5">
            {[
              'Keep customer information up to date',
              'Review customer purchase patterns',
              'Use customer data for marketing insights',
              'Respect customer privacy and data protection',
              'Export customer data when needed'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/${storeId}/customers`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" /> View All Customers
            </Link>
            <Link
              href={`/dashboard/${storeId}/orders`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
            >
              <SearchIcon className="h-3.5 w-3.5" /> Create Order for Customer
            </Link>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">Customer Insights</h3>
          <p className="text-[12px] text-gray-500 mb-4 font-medium">Use customer data to:</p>
          <div className="space-y-3">
            {[
              'Identify your most valuable customers',
              'Understand purchasing patterns',
              'Create targeted marketing campaigns',
              'Improve customer service'
            ].map((insight, i) => (
              <div key={i} className="flex gap-3 items-center ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                <span className="text-[12.5px] text-gray-600 font-medium">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPromotions = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Promotional Offers</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn how to create and manage promotional offers and discounts.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Tag className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Creating Promotional Offers</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">Learn how to create discounts and promotions</p>
          <div className="space-y-3.5">
            {[
              'Navigate to Promotional Offers → Create Offer',
              'Enter offer name and description',
              'Set discount type (percentage or fixed amount)',
              'Define discount value',
              'Set start and end dates',
              'Select applicable products or categories',
              'Save and activate the offer'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Tag className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Managing Offers</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">Edit, activate, and deactivate promotional offers</p>
          <div className="space-y-3.5">
            {[
              'View all offers in the Promotional Offers page',
              'Click on an offer to view or edit details',
              'Activate or deactivate offers as needed',
              'Monitor offer performance',
              'Delete expired or unused offers'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Tag className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Offer Types</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">Different types of promotional offers available</p>
          <div className="space-y-3.5">
            {[
              'Percentage discounts: Reduce price by a percentage',
              'Fixed amount discounts: Reduce price by a fixed amount',
              'Category-specific offers: Apply to entire categories',
              'Product-specific offers: Apply to individual products',
              'Time-limited offers: Set expiration dates'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/${storeId}/promotions/offers`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[11px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Create Offer
            </Link>
            <Link
              href={`/dashboard/${storeId}/promotions/offers`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
            >
              View All Offers
            </Link>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">Best Practices</h3>
          <div className="space-y-3">
            {[
              'Create time-limited offers to create urgency',
              'Test different discount amounts to find optimal pricing',
              'Promote offers through your marketing channels',
              'Monitor offer performance and adjust as needed',
              'Don\'t overuse discounts - maintain product value'
            ].map((practice, i) => (
              <div key={i} className="flex gap-3 items-center ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                <span className="text-[12.5px] text-gray-600 font-medium">{practice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Payment Methods</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn how to configure and manage payment methods for your shop.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex gap-4">
          <Info className="h-4.5 w-4.5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-[13.5px] font-bold text-blue-900 mb-1.5">About Create Vendor Pay</h4>
            <p className="text-[12px] text-blue-700/80 leading-relaxed font-medium">
              Create Vendor Pay is a unified payment gateway that allows your customers to pay using eSewa, Khalti, Fonepay QR, or other supported payment methods. When you enable Create Vendor Pay, Create Vendor handles all payment processing and charges a service fee percentage on each transaction. This simplifies payment management for you while giving customers multiple payment options.
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm transition-all h-full">
          <div className="flex items-center gap-2.5 mb-1">
             <CreditCard className="h-4.5 w-4.5 text-gray-900" />
             <h3 className="text-[15px] font-bold text-gray-900">Available Payment Methods</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-6">Detailed information about each payment method</p>

          <div className="space-y-5">
            {/* COD */}
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/30">
               <div className="flex items-center gap-3 mb-2">
                 <h4 className="text-[14px] font-bold text-gray-900">Cash on Delivery (COD)</h4>
                 <span className="px-2 py-0.5 bg-emerald-500 rounded-md text-[9px] font-black text-white uppercase">No Config Needed</span>
               </div>
               <p className="text-[12px] text-gray-400 mb-5 font-medium">Customers pay in cash when the product is delivered to them. No online payment required.</p>
               <p className="text-[11.5px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Key Features:</p>
               <div className="space-y-2.5">
                 {[
                   'No upfront payment from customers',
                   'Payment collected at the time of delivery',
                   'No configuration needed - works immediately',
                   'Suitable for customers who prefer cash payments',
                   'Higher risk of order cancellation'
                 ].map((feat, i) => (
                   <div key={i} className="flex gap-3 items-center ml-1">
                     <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                     <span className="text-[12px] text-gray-600 font-medium">{feat}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* eSewa */}
            <div className="p-6 border border-gray-100 rounded-xl bg-white">
               <div className="flex items-center gap-3 mb-2">
                 <h4 className="text-[14px] font-bold text-gray-900">eSewa</h4>
                 <span className="px-2 py-0.5 border border-gray-100 rounded-md text-[9px] font-bold text-gray-500 uppercase bg-gray-50">Requires Configuration</span>
               </div>
               <p className="text-[12px] text-gray-400 mb-5 font-medium">Nepal&apos;s popular digital wallet and payment gateway. Requires API credentials from eSewa.</p>
               
               <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 mb-5">
                  <p className="text-[11.5px] font-bold text-gray-900 mb-2.5">Required Configuration:</p>
                  <ul className="space-y-1.5 ml-4 list-disc marker:text-blue-500">
                    {['API Key', 'API Secret', 'Product Key'].map((conf, i) => (
                      <li key={i} className="text-[11.5px] text-gray-600 font-medium">{conf}</li>
                    ))}
                  </ul>
               </div>

               <p className="text-[11.5px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Key Features:</p>
               <div className="space-y-2.5">
                 {[
                   'Popular digital wallet in Nepal',
                   'Requires eSewa merchant account',
                   'Need to configure API Key, API Secret, and Product Key',
                   'Secure and trusted payment method',
                   'Real-time payment processing',
                   'Suitable for Nepali customers'
                 ].map((feat, i) => (
                   <div key={i} className="flex gap-3 items-center ml-1">
                     <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                     <span className="text-[12px] text-gray-600 font-medium">{feat}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Khalti */}
            <div className="p-6 border border-gray-100 rounded-xl bg-white">
               <div className="flex items-center gap-3 mb-2">
                 <h4 className="text-[14px] font-bold text-gray-900">Khalti</h4>
                 <span className="px-2 py-0.5 border border-gray-100 rounded-md text-[9px] font-bold text-gray-500 uppercase bg-gray-50">Requires Configuration</span>
               </div>
               <p className="text-[12px] text-gray-400 mb-5 font-medium">Another popular digital wallet and payment gateway in Nepal. Requires API credentials from Khalti.</p>
               
               <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 mb-5">
                  <p className="text-[11.5px] font-bold text-gray-900 mb-2.5">Required Configuration:</p>
                  <ul className="space-y-1.5 ml-4 list-disc marker:text-blue-500">
                    {['Secret Key', 'Access Token'].map((conf, i) => (
                      <li key={conf} className="text-[11.5px] text-gray-600 font-medium">{conf}</li>
                    ))}
                  </ul>
               </div>

               <p className="text-[11.5px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Key Features:</p>
               <div className="space-y-2.5">
                 {[
                   'Popular digital wallet in Nepal',
                   'Requires Khalti merchant account',
                   'Need to configure Secret Key and Access Token',
                   'Secure payment processing',
                   'Real-time transaction updates',
                   'Widely used by Nepali customers'
                 ].map((feat, i) => (
                   <div key={i} className="flex gap-3 items-center ml-1">
                     <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                     <span className="text-[12px] text-gray-600 font-medium">{feat}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Fonepay */}
            <div className="p-6 border border-gray-100 rounded-xl bg-white">
               <div className="flex items-center gap-3 mb-2">
                 <h4 className="text-[14px] font-bold text-gray-900">Fonepay QR</h4>
                 <span className="px-2 py-0.5 border border-gray-100 rounded-md text-[9px] font-bold text-gray-500 uppercase bg-gray-50">Requires Configuration</span>
               </div>
               <p className="text-[12px] text-gray-400 mb-5 font-medium">QR code-based payment system in Nepal. Customers scan QR code to complete payment.</p>
               
               <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 mb-5">
                  <p className="text-[11.5px] font-bold text-gray-900 mb-2.5">Required Configuration:</p>
                  <ul className="space-y-1.5 ml-4 list-disc marker:text-blue-500">
                    {['Merchant ID', 'Secret Key'].map((conf, i) => (
                      <li key={conf} className="text-[11.5px] text-gray-600 font-medium">{conf}</li>
                    ))}
                  </ul>
               </div>

               <p className="text-[11.5px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Key Features:</p>
               <div className="space-y-2.5">
                 {[
                   'QR code-based payment system',
                   'Requires Fonepay merchant account',
                   'Need to configure Merchant ID and Secret Key',
                   'Customers scan QR code to pay',
                   'Quick and convenient payment method',
                   'Popular in Nepal'
                 ].map((feat, i) => (
                   <div key={i} className="flex gap-3 items-center ml-1">
                     <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                     <span className="text-[12px] text-gray-600 font-medium">{feat}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Settings className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Configuring Payment Methods</h3>
          </div>
          <p className="text-[12px] text-gray-400 font-medium mb-5">Set up payment options for your shop</p>
          <div className="space-y-3.5">
            {[
              'Navigate to Settings → Payment Methods',
              'View available payment method options',
              'For methods requiring configuration (eSewa, Khalti, Fonepay QR), click \'Configure\'',
              'Enter required credentials from your payment provider',
              'Enable the payment methods you want to offer',
              'Test payment processing in test mode (if available)',
              'Activate payment methods for customers'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/settings/payments`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" /> Configure Payment Methods
          </Link>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">Important Notes</h3>
          <div className="space-y-4">
            {[
              'Payment methods must be configured before customers can place orders',
              'COD and Create Vendor Pay don\'t require configuration - they work immediately',
              'For eSewa, Khalti, and Fonepay QR, you need API credentials from the respective providers',
              'Create Vendor Pay allows customers to use multiple payment methods (eSewa, Khalti, etc.) but charges a service fee',
              'Keep payment gateway credentials secure and never share them',
              'Test payment methods in test mode before going live',
              'Regularly review payment transaction logs for discrepancies'
            ].map((practice, i) => (
              <div key={i} className="flex gap-3 items-center ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                <span className="text-[12px] text-gray-600 font-medium leading-relaxed">{practice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDelivery = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Delivery Presets</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn how to configure delivery charges for your products</p>
      </div>

      <div className="space-y-4">
        {/* What are Delivery Presets? */}
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <Box className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">What are Delivery Presets?</h3>
          </div>
          <p className="text-[12.5px] text-gray-400 mb-6 font-medium leading-relaxed">
            Delivery presets allow you to set different delivery charges for different districts or cities. You can create multiple presets with varying fees and assign them to specific products, or set a default preset that applies to all products unless overridden.
          </p>
          <p className="text-[12px] font-bold text-gray-900 mb-4 uppercase tracking-wider">Key Features:</p>
          <div className="space-y-3.5">
            {[
              { title: 'Default Fee', desc: 'Set a base delivery charge that applies to all districts not specifically configured' },
              { title: 'District-Specific Fees', desc: 'Set custom delivery charges for specific districts (e.g., "Kathmandu Inside Ring Road")' },
              { title: 'Default Preset', desc: 'Mark one preset as your shop\'s default, which will be used for products that don\'t have a specific preset assigned' },
              { title: 'Product Assignment', desc: 'Assign specific presets to individual products, or use the shop default' },
              { title: 'Free Delivery', desc: 'Products can be marked for free delivery, which overrides any preset' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-3 items-start ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-0.5" />
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-gray-700">{feature.title}:</span>{' '}
                  <span className="text-gray-500 font-medium">{feature.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Create a Delivery Preset */}
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="mb-8">
            <h3 className="text-[15px] font-bold text-gray-900">How to Create a Delivery Preset</h3>
            <p className="text-[12px] text-gray-400 font-medium mt-1">Step-by-step guide to creating your first delivery preset</p>
          </div>
          <div className="space-y-4">
            {[
              'Go to Delivery Presets from the sidebar or settings',
              'Click "Add Delivery Preset" button',
              'Enter a descriptive name for your preset (e.g., "Standard Delivery", "Express Delivery")',
              'Set the Default Fee - this applies to all districts not specifically configured',
              '(Optional) Configure custom fees for specific districts by entering district names and their corresponding fees',
              'Click "Create Preset" to save'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Setting a Default Preset */}
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="mb-6">
            <h3 className="text-[15px] font-bold text-gray-900">Setting a Default Preset</h3>
            <p className="text-[12px] text-gray-400 font-medium mt-1">Learn how to set a delivery preset as your shop\'s default</p>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium">To set a delivery preset as your shop\'s default:</p>
          <div className="space-y-4">
            {[
              'Go to Delivery Presets page',
              'Find the preset you want to set as default',
              'Click the "Set as Default" button (star icon)',
              'The preset will be marked as "Default" and used for all products unless they have a specific preset assigned'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Using Presets with Products */}
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="mb-8">
            <h3 className="text-[15px] font-bold text-gray-900">Using Presets with Products</h3>
            <p className="text-[12px] text-gray-400 font-medium mt-1">How to assign delivery presets to your products</p>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium">When creating or editing a product:</p>
          <div className="space-y-4">
            {[
              'You can enable "Free Delivery" to override any preset and offer free shipping',
              'If free delivery is disabled, you can select a specific Delivery Preset from the dropdown',
              'If no preset is selected, the shop\'s default preset will be used',
              'This allows you to have different delivery charges for different product categories or types'
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-center ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                <span className="text-[12.5px] text-gray-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Info className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[14px] font-bold text-gray-900">Important Notes</h3>
          </div>
          <div className="space-y-5 mt-4">
            {[
              'You must have at least one delivery preset set as default for your shop',
              'If a product doesn\'t have a preset assigned and there\'s no shop default, delivery charges may not calculate correctly',
              'District names must match exactly (case-sensitive) when setting custom fees',
              'You can edit or delete presets at any time, but make sure to set a new default if you delete the current default preset'
            ].map((note, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                <span className="text-[12px] text-gray-500 font-medium leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-black text-gray-900 mb-5">Quick Actions</h3>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/${storeId}/settings/delivery`}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-lg text-[12px] font-black text-white hover:bg-blue-700 transition-all shadow-md"
            >
              Go to Delivery Presets <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/dashboard/${storeId}/help/settings`}
              className="inline-flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-lg text-[12px] font-black text-gray-700 hover:bg-gray-50 bg-white transition-all shadow-sm"
            >
              View Settings Guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-gray-900">Settings Guide</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Learn how to configure and customize your shop settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[
          {
            icon: User,
            title: 'Profile Settings',
            desc: 'Manage your personal account information',
            items: ['Update your full name and email', 'Change profile picture', 'Manage account preferences'],
            link: 'profile'
          },
          {
            icon: StoreIcon,
            title: 'Shop Info',
            desc: 'Configure your shop details',
            items: ['Update shop name and logo', 'Set shop location and contact info', 'Configure shop visibility settings'],
            link: 'info'
          },
          {
            icon: Users,
            title: 'Managers',
            desc: 'Invite and manage team members',
            items: ['Invite managers by email', 'View active managers', 'Remove manager access'],
            link: 'managers'
          },
          {
            icon: Layout,
            title: 'Appearance',
            desc: "Customize your shop's look and feel",
            items: ['Choose color themes', 'Customize shop layout', 'Set display preferences'],
            link: 'appearance'
          }
        ].map((card, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <card.icon className="h-4 w-4 text-gray-900" />
              <h3 className="text-[14px] font-bold text-gray-900">{card.title}</h3>
            </div>
            <p className="text-[11.5px] text-gray-400 mb-6 font-medium leading-none">{card.desc}</p>
            <div className="space-y-3 mb-6">
              {card.items.map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-center">
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[12px] text-gray-600 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <Link
              href={`/dashboard/${storeId}/settings/${card.link}`}
              className="flex items-center justify-center gap-2 p-2 border border-gray-100 rounded-lg text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all bg-white"
            >
              Go to {card.title} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <CreditCard className="h-4 w-4 text-gray-900" />
          <h3 className="text-[14px] font-bold text-gray-900">Payment Methods</h3>
        </div>
        <p className="text-[11.5px] text-gray-400 mb-6 font-medium leading-none">Configure payment options</p>
        <div className="space-y-3 mb-6">
          {['Set up payment gateways', 'Configure payment preferences', 'Manage payment settings'].map((item, idx) => (
            <div key={idx} className="flex gap-2.5 items-center">
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[12px] text-gray-600 font-medium">{item}</span>
            </div>
          ))}
        </div>
        <Link
          href={`/dashboard/${storeId}/settings/payments`}
          className="flex items-center justify-center gap-2 p-2 border border-gray-100 rounded-lg text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all bg-white"
        >
          Go to Payment Methods <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-8">
        <div>
          <h3 className="text-[14px] font-bold text-gray-900 mb-1">Verification & Enrollment</h3>
          <p className="text-[11.5px] text-gray-400 font-medium leading-none">Learn about dropshipper and Create Vendor verification</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-gray-900" />
            <h4 className="text-[13.5px] font-bold text-gray-900">Dropshipper Verification</h4>
          </div>
          <p className="text-[12px] text-gray-500 mb-5 leading-relaxed font-medium">
            Dropshipper verification allows you to enable dropshipping features for your products. This enables other shops to sell your products without holding inventory.
          </p>
          <p className="text-[11.5px] font-bold text-gray-900 mb-2.5">Application Status:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Clock8 className="h-2.5 w-2.5" /> Not Applied
              </div>
              <span className="text-[11.5px] text-gray-600 font-bold">You haven't enrolled yet</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Clock8 className="h-2.5 w-2.5" /> Pending
              </div>
              <span className="text-[11.5px] text-gray-600 font-bold">Application under review</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-emerald-100 rounded-lg bg-emerald-50/30">
              <div className="px-2 py-0.5 bg-emerald-500 rounded-md text-[9px] font-black text-white uppercase flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" /> Approved
              </div>
              <span className="text-[11.5px] text-emerald-700 font-bold">You can enable dropshipping</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-rose-100 rounded-lg bg-rose-50/30">
              <div className="px-2 py-0.5 bg-rose-500 rounded-md text-[9px] font-black text-white uppercase flex items-center gap-1">
                <XCircle className="h-2.5 w-2.5" /> Rejected
              </div>
              <span className="text-[11.5px] text-rose-700 font-bold">Application was rejected</span>
            </div>
          </div>
          <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 flex gap-3">
            <Info className="h-4 w-4 text-orange-500 mt-0.5" />
            <p className="text-[11.5px] text-orange-800 leading-relaxed font-bold">
              Important: Office Visit Required<br />
              <span className="text-[11px] text-orange-600/80 font-medium">After submitting your enrollment application, you must visit our office to complete the contract and finalize your verification. You will be notified via email once your application status changes.</span>
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <StoreIcon className="h-4 w-4 text-gray-900" />
            <h4 className="text-[13.5px] font-bold text-gray-900">Create Vendor Verification</h4>
          </div>
          <p className="text-[12px] text-gray-500 mb-5 leading-relaxed font-medium">
            Create Vendor verification allows you to sell your products through the Create Vendor platform. This gives you access to a wider customer base and additional selling opportunities.
          </p>
          <p className="text-[11.5px] font-bold text-gray-900 mb-2.5">Application Status:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Clock8 className="h-2.5 w-2.5" /> Not Applied
              </div>
              <span className="text-[11.5px] text-gray-600 font-bold">You haven't enrolled yet</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Clock8 className="h-2.5 w-2.5" /> Pending
              </div>
              <span className="text-[11.5px] text-gray-600 font-bold">Application under review</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-emerald-100 rounded-lg bg-emerald-50/30">
              <div className="px-2 py-0.5 bg-emerald-500 rounded-md text-[9px] font-black text-white uppercase flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" /> Approved
              </div>
              <span className="text-[11.5px] text-emerald-700 font-bold">You can enable Create Vendor selling</span>
            </div>
            <div className="flex items-center gap-3 p-3 border border-rose-100 rounded-lg bg-rose-50/30">
              <div className="px-2 py-0.5 bg-rose-500 rounded-md text-[9px] font-black text-white uppercase flex items-center gap-1">
                <XCircle className="h-2.5 w-2.5" /> Rejected
              </div>
              <span className="text-[11.5px] text-rose-700 font-bold">Application was rejected</span>
            </div>
          </div>
          <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 flex gap-3">
            <Info className="h-4 w-4 text-orange-500 mt-0.5" />
            <p className="text-[11.5px] text-orange-800 leading-relaxed font-bold">
              Important: Office Visit Required<br />
              <span className="text-[11px] text-orange-600/80 font-medium">After submitting your enrollment application, you must visit our office to complete the contract and finalize your verification. You will be notified via email once your application status changes.</span>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-[13.5px] font-bold text-gray-900 mb-4">How to Enroll:</h4>
          <div className="space-y-3">
            {[
              'Go to Settings → Shop Info',
              'Scroll to the "Verification & Enrollment" section',
              'Click "Enroll for Dropshipping" or "Enroll for Create Vendor"',
              'Wait for your application to be reviewed',
              'Visit our office to complete the contract once notified'
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-baseline">
                <span className="text-[12.5px] text-gray-400 font-bold w-4">{i + 1}.</span>
                <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-[13.5px] font-bold text-gray-900 mb-4">Important Notes:</h4>
          <div className="space-y-4">
            {[
              'Dropshipper and Create Vendor verifications are separate and independent',
              'You can only enable dropshipping/Create Vendor features if your status is "Approved"',
              'You cannot enroll again if you already have a pending or approved application',
              'If rejected, contact support for more information'
            ].map((note, i) => (
              <div key={i} className="flex gap-3 items-start">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-1" />
                <span className="text-[12px] text-gray-600 font-medium leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm mt-4">
        <h4 className="text-[14px] font-bold text-gray-900 mb-4">Settings Overview</h4>
        <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
          Settings allow you to customize your e-commerce platform to match your business needs. Each section focuses on a specific aspect of your shop configuration.
        </p>
        <p className="text-[12px] font-bold text-gray-900 mb-4 uppercase tracking-wider">Quick Tips:</p>
        <div className="space-y-4">
          {[
            'Update shop info regularly to keep information current',
            'Invite managers to help with shop operations',
            'Customize appearance to match your brand',
            'Configure payment methods before accepting orders',
            'Set up delivery presets to manage shipping charges effectively',
            'Enroll in verification services to unlock additional features'
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 items-start">
              <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-1" />
              <span className="text-[12.5px] text-gray-600 font-medium leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDropshipping = () => (
    <div className="max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-[22px] font-black text-gray-900">Dropshipping & Create Vendor</h1>
        <p className="text-[13.5px] text-gray-500 mt-0.5 font-medium">Complete guide to dropshipping and selling through Create Vendor platform.</p>
      </div>

      <div className="space-y-5">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Info className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Overview</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-6 font-medium leading-relaxed">
            Our platform offers two powerful ways to expand your business reach:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/30">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4 text-blue-600" />
                <h4 className="text-[14px] font-bold text-gray-900">Dropshipping</h4>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                Allow other sellers to sell your products without holding inventory, or sell products from other verified sellers.
              </p>
            </div>
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/30">
              <div className="flex items-center gap-2 mb-3">
                <StoreIcon className="h-4 w-4 text-blue-600" />
                <h4 className="text-[14px] font-bold text-gray-900">Create Vendor</h4>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                Sell your products through the Create Vendor marketplace to reach a wider customer base.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Verification Requirements</h3>
          </div>
          <p className="text-[12.5px] text-gray-400 mb-6 font-medium">Both services require verification before you can use them</p>

          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex gap-4 mb-8">
            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-gray-900 mb-1">Important: Office Visit Required</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                After submitting your enrollment application, you must visit our office to complete the contract and finalize your verification. You will be notified via email once your application status changes.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-4 w-4 text-gray-900" />
                <h4 className="text-[14px] font-bold text-gray-900">Dropshipper Verification</h4>
              </div>
              <p className="text-[12.5px] text-gray-500 mb-4 leading-relaxed font-medium">
                To become a dropshipper (selling others' products) or enable dropshipping for your products, you need to be verified as a dropshipper.
              </p>
              <h5 className="text-[12px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Requirements:</h5>
              <div className="space-y-2.5 ml-1">
                {[
                  'Valid business registration documents',
                  'Tax identification number',
                  'Bank account details for payments',
                  'Completed application form',
                  'In-person office visit to sign contract'
                ].map((req, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-[12.5px] text-gray-600 font-medium">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <StoreIcon className="h-4 w-4 text-gray-900" />
                <h4 className="text-[14px] font-bold text-gray-900">Create Vendor Verification</h4>
              </div>
              <p className="text-[12.5px] text-gray-500 mb-4 leading-relaxed font-medium">
                To sell your products through Create Vendor marketplace, you need Create Vendor verification.
              </p>
              <h5 className="text-[12px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Requirements:</h5>
              <div className="space-y-2.5 ml-1">
                {[
                  'Valid business registration documents',
                  'Product quality certifications (if applicable)',
                  'Tax identification number',
                  'Bank account details for payments',
                  'Completed application form',
                  'In-person office visit to sign contract'
                ].map((req, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="text-[12.5px] text-gray-600 font-medium">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
               <div className="flex items-center gap-2 mb-3">
                 <MapPin className="h-4 w-4 text-gray-600" />
                 <h4 className="text-[13px] font-bold text-gray-900">Office Location</h4>
               </div>
               <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                 Please contact our support team to schedule your office visit and receive the exact address. You will receive this information via email after your application is submitted.
               </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">How to Enroll</h3>
          </div>
          <div className="space-y-8 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-gray-100" />
            {[
              { title: 'Go to Shop Settings', desc: 'Navigate to Settings → Shop Info in your dashboard.' },
              { title: 'Find Verification Section', desc: 'Scroll down to the "Verification & Enrollment" section.' },
              { title: 'Click Enroll Button', desc: 'Click "Enroll for Dropshipping" or "Enroll for Create Vendor" based on which service you want to use.' },
              { title: 'Wait for Review', desc: "Your application will be reviewed by our admin team. You'll receive email notifications about status updates." },
              { title: 'Visit Office', desc: 'Once notified, visit our office to complete the contract and finalize your verification. Bring all required documents.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm">{i + 1}</div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href={`/dashboard/${storeId}/settings/info`} className="mt-8 inline-flex items-center gap-2.5 px-6 py-2 bg-blue-600 rounded-lg text-[12.5px] font-bold text-white hover:bg-blue-700 transition-all shadow-md">
            Go to Shop Settings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">Application Status</h3>
          <p className="text-[12.5px] text-gray-400 mb-8 font-medium">Understanding your verification status</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {[
               { icon: Info, label: 'Not Applied', val: "You haven't enrolled yet. Click \"Enroll\" to start the application process.", color: 'gray' },
               { icon: Clock, label: 'Pending', val: "Your application is under review. You'll be notified once a decision is made.", color: 'orange' },
               { icon: CheckCircle, label: 'Approved', val: "You're verified! You can now use the features. Don't forget to visit the office to complete the contract.", color: 'emerald' },
               { icon: XCircle, label: 'Rejected', val: "Your application was rejected. Contact support for more information and to reapply.", color: 'rose' }
             ].map((status, i) => (
               <div key={i} className={`p-4 border ${status.color === 'gray' ? 'border-gray-100' : status.color === 'emerald' ? 'border-emerald-100 bg-emerald-50/20' : status.color === 'orange' ? 'border-orange-100 bg-orange-50/20' : 'border-rose-100 bg-rose-50/20'} rounded-xl`}>
                 <div className="flex items-center gap-2 mb-2">
                   <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase flex items-center gap-1.5 ${status.color === 'gray' ? 'bg-gray-100 text-gray-500' : status.color === 'emerald' ? 'bg-emerald-500 text-white' : status.color === 'orange' ? 'bg-orange-400 text-white' : 'bg-rose-500 text-white'}`}>
                     <status.icon className="h-2.5 w-2.5" /> {status.label}
                   </div>
                 </div>
                 <p className="text-[11.5px] text-gray-500 font-medium leading-relaxed">{status.val}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Truck className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Selling Your Products as Dropshipping</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-6 -mt-6 font-medium">Enable other sellers to sell your products without holding inventory</p>

          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex gap-4 mb-8">
            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-gray-900 mb-1">Requirement</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                Your shop must be verified as a dropshipper (status: Approved) to enable this feature.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-[14px] font-bold text-gray-900 mb-3">What is Dropshipping?</h4>
              <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                When you enable dropshipping for a product, other verified sellers can add your product to their shop and sell it to their customers. When a customer orders from them, the order is automatically forwarded to you, and you ship directly to the customer.
              </p>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-gray-900 mb-4">How to Enable Dropshipping for Your Products</h4>
              <div className="space-y-3.5">
                {[
                  'Ensure your shop is verified as a dropshipper (status: Approved)',
                  'Go to Products → Create/Edit Product',
                  'In the Status section, toggle "Allow Others to Sell Your Product via Dropshipping"',
                  'Set a "Price for Dropshipper" - this is the price at which dropshippers can purchase your product',
                  'Save and publish your product'
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-baseline ml-1">
                    <span className="text-[12.5px] text-blue-600 font-bold">{i + 1}.</span>
                    <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">Benefits</h4>
                  <ul className="space-y-3">
                    {[
                      'Reach more customers through other sellers\' shops',
                      'No need to manage multiple sales channels',
                      'Automatic order forwarding',
                      'You control the dropshipper price',
                      'You maintain control over inventory'
                    ].map((b, i) => (
                      <li key={i} className="flex gap-2.5 items-center">
                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                        <span className="text-[12px] text-gray-600 font-medium">{b}</span>
                      </li>
                    ))}
                  </ul>
               </div>
               <div>
                  <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">Important Notes</h4>
                  <ul className="space-y-3">
                    {[
                      'Stock is always checked from your inventory, not the dropshipper\'s',
                      'When a dropshipper\'s customer orders, you receive an order automatically',
                      'You ship directly to the end customer',
                      'If you update product details, dropshippers are notified via email',
                      'Dropshipped products cannot be enabled for dropshipping again (prevents loops)'
                    ].map((n, i) => (
                      <li key={i} className="flex gap-2.5 items-center">
                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                        <span className="text-[12px] text-gray-600 font-medium">{n}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Layers className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Selling Others' Products as Dropshipping</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-6 -mt-6 font-medium">Become a dropshipper and sell products without holding inventory</p>

          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex gap-4 mb-8">
            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-gray-900 mb-1">Requirement</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                Your shop must be verified as a dropshipper (status: Approved) to sell dropshipped products.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-[14px] font-bold text-gray-900 mb-3">What is Dropshipping?</h4>
              <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                As a dropshipper, you can sell products from other verified sellers without purchasing inventory upfront. When a customer orders from you, the order is automatically forwarded to the original seller, who ships directly to your customer.
              </p>
            </div>
            <div>
               <h4 className="text-[14px] font-bold text-gray-900 mb-4">How to Start Dropshipping</h4>
               <div className="space-y-4">
                 {[
                   'Get verified as a dropshipper (see "How to Enroll" above)',
                   'Go to Dropshipping in your sidebar',
                   'Browse products available for dropshipping',
                   'Click on a product to view details',
                   'Click "Sell as Your Product" to add it to your shop',
                   'Review and edit product details (price, description, etc.)',
                   'Publish the product in your shop'
                 ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-baseline ml-1">
                      <span className="text-[12.5px] text-blue-600 font-bold">{i + 1}.</span>
                      <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
                    </div>
                 ))}
               </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">How It Works</h4>
               <div className="space-y-4">
                 {[
                   'Customer orders from your shop',
                   'System checks stock from the original seller\'s inventory',
                   'Order is automatically created for the original seller',
                   'Original seller ships directly to your customer',
                   'You keep the difference between your selling price and the dropshipper price'
                 ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-baseline ml-1">
                      <span className="text-[12.5px] text-blue-600 font-bold">{i + 1}.</span>
                      <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
                    </div>
                 ))}
               </div>
            </div>
          </div>
          <Link href={`/dashboard/${storeId}/dropshipping/products`} className="mt-10 inline-flex items-center gap-2.5 px-6 py-2 border border-gray-200 rounded-lg text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all bg-white shadow-sm">
            Browse Dropshipping Products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <StoreIcon className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Selling on Create Vendor</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-6 -mt-6 font-medium">Reach more customers through the Create Vendor marketplace</p>

          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex gap-4 mb-8">
            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-gray-900 mb-1">Requirement</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                Your shop must be verified for Create Vendor (status: Approved) to enable this feature.
              </p>
            </div>
          </div>

          <div className="space-y-10">
            <div>
               <h4 className="text-[14px] font-black text-gray-900 mb-3">What is Create Vendor?</h4>
               <p className="text-[12.5px] text-gray-500 leading-relaxed font-medium">
                 Create Vendor is our marketplace platform where customers can discover and purchase products from multiple sellers in one place. By enabling your products for Create Vendor, you gain access to a wider customer base and increased visibility.
               </p>
            </div>
            <div>
               <h4 className="text-[14px] font-bold text-gray-900 mb-4">How to Enable Create Vendor Selling</h4>
               <div className="space-y-4">
                 {[
                   'Ensure your shop is verified for Create Vendor (status: Approved)',
                   'Go to Products → Create/Edit Product',
                   'In the Status section, toggle "Sell to Create Vendor"',
                   'Save and publish your product',
                   'Your product will appear in Create Vendor marketplace'
                 ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-baseline ml-1">
                      <span className="text-[12.5px] text-blue-600 font-bold">{i + 1}.</span>
                      <span className="text-[12.5px] text-gray-700 font-medium">{step}</span>
                    </div>
                 ))}
               </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">Benefits</h4>
               <div className="space-y-3">
                 {[
                   'Access to Create Vendor\'s customer base',
                   'Increased product visibility',
                   'Unified marketplace experience',
                   'Automatic order management',
                   'Marketing support from Create Vendor'
                 ].map((b, i) => (
                    <div key={i} className="flex gap-2.5 items-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      <span className="text-[12px] text-gray-600 font-medium">{b}</span>
                    </div>
                 ))}
               </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">Important Notes</h4>
               <div className="space-y-3">
                 {[
                   'Only verified shops can enable this feature',
                   'Products must meet quality standards',
                   'You maintain control over pricing',
                   'Orders from Create Vendor appear in your orders dashboard',
                   'Dropshipped products cannot be sold through Create Vendor'
                 ].map((n, i) => (
                    <div key={i} className="flex gap-2.5 items-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      <span className="text-[12px] text-gray-600 font-medium">{n}</span>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="space-y-1">
            {[
              'Can I be both a dropshipper and enable dropshipping for my products?',
              'How long does verification take?',
              'Can I enable dropshipping for products I\'m already dropshipping?',
              'What happens if the original seller updates their product?',
              'How is stock managed for dropshipped products?',
              'Can I set my own price for dropshipped products?',
              'What if my application is rejected?',
              'Do I need separate verification for Dropshipping and Create Vendor?'
            ].map((q, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100">
                <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600 text-left">{q}</span>
                <ChevronDown className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
           <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-5">Quick Actions</h4>
           <div className="flex flex-wrap gap-2.5">
              <Link href={`/dashboard/${storeId}/settings/info`} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[11.5px] font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-all">
                <ShieldCheck className="h-4 w-4" /> Check Verification Status
              </Link>
              <Link href={`/dashboard/${storeId}/dropshipping/products`} className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-[11.5px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all bg-white shadow-sm">
                <SearchIcon className="h-4 w-4" /> Browse Dropshipping Products
              </Link>
              <Link href={`/dashboard/${storeId}/products`} className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-[11.5px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all bg-white shadow-sm">
                <LayoutDashboard className="h-4 w-4" /> Manage Products
              </Link>
           </div>
        </div>
      </div>
    </div>
  );

  const renderRefundPolicy = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Refund Policy</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn how to configure and manage your store's refund policy.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <RefreshCcw className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Configuring Your Refund Policy</h3>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
            A clear refund policy builds trust with your customers. You can define when and how refunds are issued for products purchased from your store.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Refund Eligibility', desc: 'Specify which products are eligible for refunds and under what conditions (e.g., damaged goods, wrong item).' },
              { title: 'Refund Timeframe', desc: 'Define how many days customers have to request a refund after receiving their order.' },
              { title: 'Refund Method', desc: 'State whether refunds are issued to the original payment method or as store credit.' },
              { title: 'Processing Time', desc: 'Inform customers how long it typically takes to process a refund request.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-0.5" />
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-gray-700">{item.title}:</span>{' '}
                  <span className="text-gray-500 font-medium">{item.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/website/refund`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            Edit Refund Policy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderReturnPolicy = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Return Policy</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Set clear rules for product returns to ensure a smooth customer experience.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <Undo2 className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Setting Up Returns</h3>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
            Your return policy should clearly outline the process for customers to return items, including who covers shipping costs and what items are excluded.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Return Window', desc: 'Set the maximum number of days a customer can return a product after delivery.' },
              { title: 'Item Condition', desc: 'Specify the required state of the product for a successful return (e.g., original packaging, unused).' },
              { title: 'Return Shipping', desc: 'Clarify if the customer or the store is responsible for return shipping costs.' },
              { title: 'Exclusions', desc: 'List any items that cannot be returned (e.g., perishable goods, personal care items).' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-0.5" />
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-gray-700">{item.title}:</span>{' '}
                  <span className="text-gray-500 font-medium">{item.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/website/return`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            Edit Return Policy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderTermsConditions = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Terms & Conditions</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Define the legal agreement between you and your store's customers.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <FileText className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Legal Agreement</h3>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
            Terms and Conditions outline the rules, requirements, and legal aspects of using your store and purchasing your products.
          </p>
          <div className="space-y-4">
            {[
              { title: 'User Conduct', desc: 'Rules for how customers should interact with your website and services.' },
              { title: 'Intellectual Property', desc: 'Protection for your shop\'s brand, content, and original products.' },
              { title: 'Limitation of Liability', desc: 'Legal clauses that limit your responsibility in certain situations.' },
              { title: 'Governing Law', desc: 'Specify which jurisdiction\'s laws apply to your terms and conditions.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-0.5" />
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-gray-700">{item.title}:</span>{' '}
                  <span className="text-gray-500 font-medium">{item.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/website/terms`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            Edit Terms & Conditions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderPrivacyPolicy = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Privacy Policy</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Explain how you collect, use, and protect your customers' personal data.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <Shield className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Data Protection</h3>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
            Your privacy policy is a legal requirement and an important transparency tool for your customers regarding their personal information.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Information Collection', desc: 'Detail what data you collect (e.g., names, emails, shipping addresses).' },
              { title: 'Data Usage', desc: 'Explain why you need this data and how it is used to process orders or improve service.' },
              { title: 'Third-Party Sharing', desc: 'Disclose if and when you share data with third parties (e.g., payment gateways, shipping partners).' },
              { title: 'Cookie Policy', desc: 'Inform users about the use of cookies and tracking technologies on your shop.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-0.5" />
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-gray-700">{item.title}:</span>{' '}
                  <span className="text-gray-500 font-medium">{item.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/website/privacy`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            Edit Privacy Policy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderEmailPreference = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Email Preference</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn how to manage your email notification settings.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <Mail className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">Managing Notifications</h3>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
            You can control which emails you receive from Create Vendor. This allows you to stay informed about important events without cluttering your inbox.
          </p>
          <div className="space-y-4">
            {[
              { title: 'New Order Alerts', desc: 'Get notified immediately when a customer places an order.' },
              { title: 'Low Stock Notifications', desc: 'Receive alerts when product inventory falls below your set threshold.' },
              { title: 'Payment Confirmations', desc: 'Get emails when payouts are processed or payments are received.' },
              { title: 'Marketing & Updates', desc: 'Optional emails about new platform features and tips.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start ml-1">
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 mt-0.5" />
                <p className="text-[12.5px] leading-relaxed">
                  <span className="font-bold text-gray-700">{item.title}:</span>{' '}
                  <span className="text-gray-500 font-medium">{item.desc}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/settings/email`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            Configure Email Settings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">About Create Vendor</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Learn more about the platform and our mission.</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <Info className="h-4.5 w-4.5 text-gray-900" />
            <h3 className="text-[15px] font-bold text-gray-900">What is Create Vendor?</h3>
          </div>
          <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">
            Create Vendor is a comprehensive e-commerce platform designed to empower sellers in Nepal. We provide the tools you need to build, manage, and scale your online business with ease.
          </p>
          <div className="space-y-5">
            {[
              { title: 'Fast & Secure', desc: 'Built with the latest technologies to ensure your shop is always fast and your data is secure.' },
              { title: 'Unified Payments', desc: 'Integrated with eSewa, Khalti, and Fonepay for seamless transactions.' },
              { title: 'Local Support', desc: 'Dedicated team based in Nepal to help you every step of the way.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-[12px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-900 mb-5">Quick Actions</h3>
          <Link
            href={`/dashboard/${storeId}/website/about`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-md"
          >
            Edit About Page <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderFAQs = () => {
    const FAQ_DATA = [
      {
        id: 'getting-started',
        title: 'Getting Started',
        questions: [
          {
            id: 'gs-1',
            q: 'How do I create my first shop?',
            a: 'Navigate to Create Shop from the sidebar, fill in your shop details including name, location, and contact information, then save. Your shop will be created and ready to use.'
          },
          {
            id: 'gs-2',
            q: 'What information do I need to set up my shop?',
            a: 'You need a shop name, location details, contact information, and optionally a logo and banner to personalize your storefront.'
          },
          {
            id: 'gs-3',
            q: 'How do I add products to my shop?',
            a: 'Navigate to the Products section and click the "Add Product" button. Fill in the product details like title, price, description, and images.'
          }
        ]
      },
      {
        id: 'products',
        title: 'Products',
        questions: [
          {
            id: 'p-1',
            q: 'How many products can I add?',
            a: 'You can add as many products as you need. There is no hard limit on the number of products.'
          },
          {
            id: 'p-2',
            q: 'Can I add product variants?',
            a: 'Yes, you can add variants like size, color, and more for each product.'
          },
          {
            id: 'p-3',
            q: 'How do I organize products into categories?',
            a: 'You can create categories in the Products section and assign products to them.'
          }
        ]
      },
      {
        id: 'orders',
        title: 'Orders',
        questions: [
          {
            id: 'o-1',
            q: 'How do I create an order?',
            a: 'Go to the Orders section and click "Create Order". You can then select a customer and add products to the order.'
          },
          {
            id: 'o-2',
            q: 'What are the different order statuses?',
            a: 'Order statuses include Pending, Approved, Packaging, Shipping, Shipped, Delivering, Delivered, and Canceled.'
          },
          {
            id: 'o-3',
            q: 'Can I edit an order after creating it?',
            a: 'Yes, you can edit order details and update the status as the order progresses.'
          }
        ]
      },
      {
        id: 'customers',
        title: 'Customers',
        questions: [
          {
            id: 'c-1',
            q: 'How do I view customer information?',
            a: 'Navigate to the Customers section to view your customer list and their individual details.'
          },
          {
            id: 'c-2',
            q: 'Can I create orders for existing customers?',
            a: 'Yes, you can search for existing customers when creating a new order.'
          }
        ]
      },
      {
        id: 'promotions',
        title: 'Promotional Offers',
        questions: [
          {
            id: 'pr-1',
            q: 'How do I create a discount?',
            a: 'Navigate to Promotional Offers and click "Create Offer". You can define the discount type and rules.'
          },
          {
            id: 'pr-2',
            q: 'Can I apply discounts to specific products?',
            a: 'Yes, you can select specific products or entire categories to apply a discount.'
          },
          {
            id: 'pr-3',
            q: 'How long do promotional offers last?',
            a: 'You can set start and end dates for each promotion to control its duration.'
          }
        ]
      },
      {
        id: 'settings',
        title: 'Settings',
        questions: [
          {
            id: 's-1',
            q: 'How do I invite team members?',
            a: 'Go to Settings -> Managers and invite team members by entering their email address.'
          },
          {
            id: 's-2',
            q: 'Can I change my shop\'s appearance?',
            a: 'Yes, navigate to Settings -> Appearance to customize themes, layouts, and colors.'
          },
          {
            id: 's-3',
            q: 'How do I configure payment methods?',
            a: 'Navigate to Settings -> Payment Methods to set up gateways like eSewa, Khalti, or COD.'
          }
        ]
      }
    ];

    return (
      <div className="max-w-[840px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-gray-900 leading-none">Frequently Asked Questions</h1>
          <p className="text-[13px] text-gray-500 mt-2 font-medium">Find answers to common questions about using the platform.</p>
        </div>

        <div className="space-y-6">
          {FAQ_DATA.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm transition-all h-full">
              <div className="flex items-center gap-2.5 mb-8">
                <HelpCircle className="h-4.5 w-4.5 text-gray-900" />
                <h3 className="text-[15px] font-bold text-gray-900">{category.title}</h3>
              </div>
              <div className="space-y-4">
                {category.questions.map((faq) => {
                  const isOpen = activeFaq === faq.id;
                  return (
                    <div key={faq.id} className={`border rounded-lg transition-all ${isOpen ? 'border-gray-200' : 'border-gray-100/60'}`}>
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                        className="w-full h-12 flex items-center justify-between px-6 hover:bg-gray-50/50 transition-all group"
                      >
                        <span className={`text-[13px] font-bold text-left transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gray-400' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[12.5px] text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900 leading-none">Still Have Questions?</h3>
            <p className="text-[12px] text-gray-400 font-medium mt-2 mb-6">Can&apos;t find what you&apos;re looking for?</p>
            <div className="space-y-3.5">
              {[
                'Browse through our detailed documentation sections',
                'Check the Getting Started guide for step-by-step instructions',
                'Contact our support team for additional assistance'
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-center ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-[12.5px] text-gray-600 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="max-w-[1000px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-gray-900 leading-none">Help Center</h1>
        <p className="text-[13px] text-gray-500 mt-2 font-medium">Find answers, guides, and documentation to help you get the most out of your e-commerce platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[
          { icon: Rocket, title: 'Getting Started', desc: 'Learn the basics and set up your shop', color: 'text-blue-500', bg: 'bg-blue-50/30', border: 'border-blue-100', href: 'getting-started' },
          { icon: Package, title: 'Products', desc: 'Manage your product catalog', color: 'text-emerald-500', bg: 'bg-emerald-50/30', border: 'border-emerald-100', href: 'products' },
          { icon: ShoppingCart, title: 'Orders', desc: 'Process and track orders', color: 'text-purple-500', bg: 'bg-purple-50/30', border: 'border-purple-100', href: 'orders' },
          { icon: Users, title: 'Customers', desc: 'Manage customer relationships', color: 'text-orange-500', bg: 'bg-orange-50/30', border: 'border-orange-100', href: 'customers' },
          { icon: Tag, title: 'Promotional Offers', desc: 'Create and manage discounts', color: 'text-pink-500', bg: 'bg-pink-50/30', border: 'border-pink-100', href: 'promotions' },
          { icon: CreditCard, title: 'Payment Methods', desc: 'Configure payment options', color: 'text-indigo-500', bg: 'bg-indigo-50/30', border: 'border-indigo-100', href: 'payments' },
          { icon: Box, title: 'Delivery Presets', desc: 'Manage delivery charges for different districts', color: 'text-amber-500', bg: 'bg-amber-50/30', border: 'border-amber-100', href: 'delivery' },
          { icon: Settings, title: 'Settings', desc: 'Configure your shop settings', color: 'text-slate-500', bg: 'bg-slate-50/30', border: 'border-slate-100', href: 'settings' },
          { icon: Truck, title: 'Dropshipping & Create Vendor', desc: 'Learn about dropshipping and Create Vendor', color: 'text-blue-500', bg: 'bg-blue-50/30', border: 'border-blue-100', href: 'dropshipping' },
          { icon: HelpCircle, title: 'FAQs', desc: 'Frequently asked questions', color: 'text-red-500', bg: 'bg-red-50/30', border: 'border-red-100', href: 'faqs' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Link 
              key={i} 
              href={`/dashboard/${storeId}/help/${card.href}`}
              className="border border-gray-100/80 rounded-[18px] p-6 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all group flex flex-col items-start border-gray-200"
            >
              <div className={`w-9 h-9 border translate-x-1.5 ${card.border} ${card.bg} rounded-lg flex items-center justify-center mb-4 group-hover:bg-opacity-100 transition-colors`}>
                <Icon className={`h-4.5 w-4.5 ${card.color}`} />
              </div>
              <h3 className="text-[15.5px] font-bold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-6 h-10">{card.desc}</p>
              <div className="w-full mt-auto">
                <div className="w-full py-2 border border-gray-100 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 bg-white shadow-sm">
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="border border-gray-100 rounded-[20px] p-8 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 mb-1">
           <BookOpen className="h-4.5 w-4.5 text-gray-900" />
           <h3 className="text-[16px] font-bold text-gray-900">Need More Help?</h3>
        </div>
        <p className="text-[13.5px] text-gray-500 mb-6 font-medium leading-none">Can't find what you're looking for? We're here to help.</p>
        <div className="space-y-4">
          {[
            'Check out our FAQs section for common questions',
            'Browse through detailed guides for each feature',
            'Contact support if you need additional assistance'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="text-[12.5px] text-gray-600 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDefault = () => (
    <div className="max-w-[760px]">
      <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
          <BookOpen className="h-6 w-6 text-gray-400" />
        </div>
        <h1 className="text-[20px] font-bold text-gray-900 mb-2">Coming Soon</h1>
        <p className="text-[13px] text-gray-500 font-medium">This section is being updated.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/10 font-sans pb-32">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/dashboard/${storeId}/help`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-gray-900 leading-none">Help Center</span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Documentation and guides</span>
            </div>
          </div>
          <button 
             onClick={() => router.push(`/dashboard/${storeId}`)}
             className="px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 bg-white shadow-sm"
          >
             <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex gap-10">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-0.5">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">Documentation</p>
               {SIDEBAR_ITEMS.map((item, idx) => {
                 const Icon = item.icon;
                 const isActive = section === item.href || (section === undefined && item.href === 'overview');
                 return (
                   <Link
                     key={idx}
                     href={`/dashboard/${storeId}/help/${item.href}`}
                     className={`
                       flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all
                       ${isActive ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'}
                     `}
                   >
                     <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                     {item.label}
                   </Link>
                 );
               })}
            </div>
          </aside>

          <main className="flex-1">
            {section === 'overview' || !section ? renderOverview() :
             section === 'getting-started' ? renderGettingStarted() : 
             section === 'products' ? renderProducts() : 
             section === 'orders' ? renderOrders() :
             section === 'customers' ? renderCustomers() :
             section === 'promotions' ? renderPromotions() :
             section === 'payments' ? renderPayments() :
             section === 'delivery' ? renderDelivery() :
             section === 'refund-policy' ? renderRefundPolicy() :
             section === 'return-policy' ? renderReturnPolicy() :
             section === 'terms-conditions' ? renderTermsConditions() :
             section === 'privacy-policy' ? renderPrivacyPolicy() :
             section === 'settings' ? renderSettings() :
             section === 'dropshipping' ? renderDropshipping() :
             section === 'email-preference' ? renderEmailPreference() :
             section === 'about' ? renderAbout() :
             section === 'faqs' ? renderFAQs() :
             renderDefault()}
          </main>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
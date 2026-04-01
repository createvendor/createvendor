import { Timestamp } from 'firebase/firestore';

export interface PluginData {
  id: string;
  isEnabled: boolean;
  config?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'USER' | 'STORE_OWNER' | 'SUPER_ADMIN' | 'MANAGER';
  storeId?: string;
  createdAt: Timestamp;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  panVat?: string;
  contactEmail?: string;
  ownerId: string;
  logo?: string;
  logoUrl?: string;
  bannerUrl?: string;
  template?: string;
  subdomain?: string;
  customDomain?: string;
  domainVerified?: boolean;
  isPublished?: boolean;
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  settings: {
    template?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    currency: string;
    language: string;
    contactEmail: string;
    timezone?: string;
    socialLinks?: { platform: string, url: string }[];
    seo: {
      title: string;
      description: string;
      keywords: string;
    };
  };
  appearance?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    buttonStyle?: string;
    logoUrl?: string;
    faviconUrl?: string;
    bannerUrl?: string;
    textOverPrimaryColor?: string;
    manualColorOverride?: boolean;
  };
  paymentMethods?: {
    cod?: { isEnabled: boolean };
    fonepay?: { 
      isEnabled: boolean; 
      merchantId?: string; 
      secretKey?: string; 
      username?: string; 
      password?: string; 
    };
    manualQr?: { 
      isEnabled: boolean; 
      qrImageUrl?: string; 
      details?: string; 
    };
    esewa?: { isEnabled: boolean; merchantId?: string; details?: string };
    khalti?: { isEnabled: boolean; secretKey?: string; details?: string };
    // Backward compatibility for old payment method structure
    cashOnDelivery?: boolean;
    bankTransfer?: boolean;
    bankDetails?: string;
    stripe?: boolean;
    stripeKey?: string;
    paypal?: boolean;
    paypalEmail?: string;
  };
  socials?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
  website?: {
    footer?: {
      text?: string;
      showSocials?: boolean;
    };
  };
  branches?: any[];
  policies?: {
    privacy?: string;
    terms?: string;
    return?: string;
    refund?: string;
    about?: string;
  };
  faqs?: { id: string; question: string; answer: string; }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  plugins?: PluginData[];
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Brand {
  id: string;
  storeId: string;
  name: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface Feature {
  id: string;
  storeId: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

export interface FeaturedSection {
  id: string;
  storeId: string;
  title: string;
  order: number;
  mode: 'manual' | 'auto';
  isActive: boolean;
  images: string[];
  productIds: string[];
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  stock: number;
  inventoryType: 'track' | 'unlimited';
  categoryId: string;
  brandId?: string;
  status: 'active' | 'draft' | 'archived' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  isFeatured: boolean;
  isComboProduct?: boolean;
  images: string[];
  tags: string[];
  variants?: any[]; // For backward compatibility
  variantList?: any[]; // The new generated variants
  specifications?: any; // Can be string (old) or array (new)
  extraFields?: any[]; // Custom user inputs
  features?: { title: string, list: string[] };
  shipping?: { weight: number, length: number, width: number, height: number };
  seo?: {
    title: string;
    description: string;
    keywords?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Size", "Color"
  options: string[]; // e.g., ["S", "M", "L"]
  price?: number;
  inventory?: number;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  shippingCost?: number;
  tax: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  fulfillmentStatus?: 'UNFULFILLED' | 'FULFILLED' | 'PARTIAL';
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Address {
  name: string;
  email?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  address?: string;
  city: string;
  state: string;
  postalCode?: string;
  zip?: string;
  country: string;
}

export interface CartItem extends OrderItem {
  storeId: string;
}

export interface Review {
  id?: string;
  storeId: string;
  productId: string;
  rating: number;
  name: string;
  comment: string;
  isApproved: boolean;
  createdAt?: any;
}

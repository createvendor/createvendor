'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  extraInputs?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedVariants?: Record<string, string>, extraInputs?: Record<string, string>) => void;
  removeItem: (productId: string, selectedVariants?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('createvendor_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('createvendor_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const areVariantsEqual = (v1?: Record<string, string>, v2?: Record<string, string>) => {
    if (!v1 && !v2) return true;
    if (!v1 || !v2) return false;
    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => v1[key] === v2[key]);
  };

  const addItem = (product: Product, quantity: number, selectedVariants?: Record<string, string>, extraInputs?: Record<string, string>) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => 
        item.product.id === product.id && areVariantsEqual(item.selectedVariants, selectedVariants)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          (item.product.id === product.id && areVariantsEqual(item.selectedVariants, selectedVariants))
            ? { ...item, quantity: item.quantity + quantity, extraInputs }
            : item
        );
      }

      return [...currentItems, { product, quantity, selectedVariants, extraInputs }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, selectedVariants?: Record<string, string>) => {
    setItems((currentItems) => currentItems.filter((item) => 
      !(item.product.id === productId && areVariantsEqual(item.selectedVariants, selectedVariants))
    ));
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariants?: Record<string, string>) => {
    if (quantity <= 0) {
      removeItem(productId, selectedVariants);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        (item.product.id === productId && areVariantsEqual(item.selectedVariants, selectedVariants))
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => {
    // If we have selected variants and a variantList, use the variant price
    let price = item.product.price || 0;
    if (item.selectedVariants && item.product.variantList) {
      const variant = item.product.variantList.find(v => 
        Object.entries(item.selectedVariants!).every(([k, val]) => v.options[k] === val)
      );
      if (variant && variant.price !== undefined) {
        price = variant.price;
      }
    }
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

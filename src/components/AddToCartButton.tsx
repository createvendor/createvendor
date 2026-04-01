'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface AddToCartButtonProps {
  product: Product;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const { addItem, setIsCartOpen } = useCart();

  return (
    <button
      onClick={() => {
        addItem(product, 1);
        setIsCartOpen(true);
      }}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
    >
      Add to Cart
    </button>
  );
};

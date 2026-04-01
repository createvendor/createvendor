'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const productId = params?.productId as string;

  return <ProductForm storeId={storeId} productId={productId} isEdit={true} />;
}

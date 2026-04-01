'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId as string;

  return (
    <ProductForm 
      storeId={storeId} 
      onClose={() => router.push(`/dashboard/${storeId}/products`)} 
    />
  );
}

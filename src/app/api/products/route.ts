import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firestore';

// ✧ High-Performance Products API: Powered by Firebase Firestore
// This handles all multi-vendor inventory management instantly.

// [POST] Create or Update Product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
        id, storeId, name, description, price, compareAtPrice, 
        costPrice, stock, inventoryType, category, status, 
        images, variants, variantList, specifications, features, seo, tags 
    } = body;

    if (!storeId || !name) {
      return NextResponse.json({ error: 'Store ID and Product Name are required' }, { status: 400 });
    }

    // Generate or use existing ID – Firestore 'save' automatically handles both cases.
    const productId = id || crypto.randomUUID();

    await firestore.save('products', productId, {
        storeId,
        name,
        description: description || '',
        price: Number(price) || 0,
        compareAtPrice: Number(compareAtPrice) || 0,
        costPrice: Number(costPrice) || 0,
        stock: Number(stock) || 0,
        inventoryType: inventoryType || 'PHYSICAL',
        categoryId: category || '',
        status: (status || 'active').toLowerCase(),
        images: images || [],
        variants: variants || [],
        variantList: variantList || [],
        specifications: specifications || [],
        features: features || {},
        seo: seo || {},
        tags: tags || [],
        createdAt: id ? undefined : new Date().toISOString() // Only add createdAt if new
    });

    return NextResponse.json({ message: 'Product saved in cloud database', id: productId });

  } catch (error) {
    console.error('Firestore Product Error:', error);
    return NextResponse.json({ error: 'Failed to process product in cloud database' }, { status: 500 });
  }
}

// [GET] Fetch products for a store
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');
  const productId = searchParams.get('productId');

  try {
    // 1. Fetch single product
    if (productId) {
      const product = await firestore.get('products', productId);
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      return NextResponse.json(product);
    }

    // 2. Fetch all products for a store
    if (storeId) {
      const results = await firestore.getStoreProducts(storeId);
      return NextResponse.json(results);
    }

    return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
  } catch (error) {
    console.error('Firestore Product Fetch Error:', error);
    return NextResponse.json({ error: 'Database fetch failure' }, { status: 500 });
  }
}

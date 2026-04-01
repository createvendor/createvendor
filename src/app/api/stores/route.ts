import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firestore';

// ✧ High-Performance Store Management API: Powered by Firebase Firestore
// This handles all branding, settings, and multi-vendor configurations instantly.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (!id) {
        return NextResponse.json({ error: 'Missing store ID' }, { status: 400 });
    }

    // Fetch store from Cloud Firestore
    const store = await firestore.get('stores', id);

    if (!store) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store);

  } catch (error) {
    console.error('Firestore Store Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch store from cloud database' }, { status: 500 });
  }
}

// [POST] Create or Update a store
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
        id, ownerId, name, description, phone, contactEmail, address,
        logoUrl, bannerUrl, subdomain, customDomain, status, settings, paymentMethods 
    } = body;

    if (!id || !ownerId || !name) {
      return NextResponse.json({ error: 'Missing required store data' }, { status: 400 });
    }

    // Firestore 'save' uses setDoc with merge: true, handling both Create and Update automatically.
    await firestore.save('stores', id, {
        ownerId,
        name,
        description: description || '',
        phone: phone || '',
        contactEmail: contactEmail || '',
        address: address || '',
        logoUrl: logoUrl || '',
        bannerUrl: bannerUrl || '',
        subdomain: subdomain || '',
        customDomain: customDomain || '',
        status: status || 'PENDING',
        settings: settings || {},
        paymentMethods: paymentMethods || {}
    });

    return NextResponse.json({ message: 'Store saved in cloud database', id });

  } catch (error) {
    console.error('Firestore Store Save Error:', error);
    return NextResponse.json({ error: 'Failed to save store in cloud database' }, { status: 500 });
  }
}

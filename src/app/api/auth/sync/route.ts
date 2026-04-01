import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firestore';

// ✧ User Sync API: Ensures Firebase Auth users exist in our Cloud Firestore DB
// This fixes the connection timeout issues and provides a stable data layer.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, role } = body;

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required user data' }, { status: 400 });
    }

    // Firestore 'save' handles both Create and Update automatically with merge: true.
    await firestore.save('users', uid, {
        email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        role: role || 'USER',
        lastLogin: new Date().toISOString()
    });

    return NextResponse.json({ message: 'User synced with cloud database', status: 'success' });

  } catch (error) {
    console.error('Firestore User Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync user with cloud database' }, { status: 500 });
  }
}

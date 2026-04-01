import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET(req: NextRequest) {
  const hostname = req.nextUrl.searchParams.get('hostname');

  if (!hostname) {
    return NextResponse.json({ error: 'Hostname required' }, { status: 400 });
  }

  try {
    // Search for store with this custom domain that is verified
    const storesRef = collection(db, 'stores');
    const q = query(
      storesRef, 
      where('customDomain', '==', hostname),
      where('domainVerified', '==', true),
      limit(1)
    );
    
    const snap = await getDocs(q);

    if (!snap.empty) {
      const store = snap.docs[0];
      return NextResponse.json({ storeId: store.id });
    }

    // fallback: check subdomains if needed (e.g. vendor.createvendor.shop)
    if (hostname.endsWith('.createvendor.shop')) {
      const subdomain = hostname.replace('.createvendor.shop', '');
      const qSub = query(storesRef, where('subdomain', '==', subdomain), limit(1));
      const snapSub = await getDocs(qSub);
      
      if (!snapSub.empty) {
        return NextResponse.json({ storeId: snapSub.docs[0].id });
      }
    }

    return NextResponse.json({ storeId: null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

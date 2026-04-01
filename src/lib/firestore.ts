import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// ✧ High-Performance Firestore Helpers
// Optimized for Multi-Vendor scaling

export const firestore = {
  // Generic: Get a single document by ID
  get: async <T>(coll: string, id: string): Promise<T | null> => {
    const docRef = doc(db, coll, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  },

  // Generic: Save or Update a document (Merge by default)
  save: async (coll: string, id: string, data: any) => {
    const docRef = doc(db, coll, id);
    return setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // Generic: Delete a document
  delete: async (coll: string, id: string) => {
    return deleteDoc(doc(db, coll, id));
  },

  // Specific: Get Store by ID
  getStore: async (storeId: string) => {
    return firestore.get('stores', storeId);
  },

  // Specific: Get Products for a Store
  getStoreProducts: async (storeId: string) => {
    const q = query(
      collection(db, 'products'), 
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Generic: Query Helper
  find: async (coll: string, field: string, operator: any, value: any) => {
    const q = query(collection(db, coll), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

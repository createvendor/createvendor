'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { UserProfile, Store } from '../types';
import { subscribeToAuth } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  storeId: string | null;
  storeData: Store | null;
  dashboardCache: any | null;
  setDashboardCache: (data: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  storeId: null,
  storeData: null,
  dashboardCache: null,
  setDashboardCache: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [dashboardCache, setDashboardCacheState] = useState<any>(null);

  // Load cache from localStorage on init
  useEffect(() => {
    const cachedDash = localStorage.getItem('cv_dash_cache');
    if (cachedDash) {
      try { setDashboardCacheState(JSON.parse(cachedDash)); } catch(e) {}
    }
    
    const cachedProfile = localStorage.getItem('cv_profile_cache');
    if (cachedProfile) {
      try { 
        const data = JSON.parse(cachedProfile);
        setProfile(data.profile);
        setStoreId(data.storeId);
        setLoading(false);
      } catch(e) {}
    }
  }, []);

  const setDashboardCache = (data: any) => {
    setDashboardCacheState(data);
    localStorage.setItem('cv_dash_cache', JSON.stringify(data));
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          let currentProfile: UserProfile;

          if (userSnap.exists()) {
            currentProfile = userSnap.data() as UserProfile;
            setProfile(currentProfile);
            setStoreId(currentProfile.storeId || null);
            localStorage.setItem('cv_profile_cache', JSON.stringify({
              profile: currentProfile,
              storeId: currentProfile.storeId || null
            }));
          } else {
            const isAdmin = user.email === 'bishalmishra9000@gmail.com';
            currentProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'User',
              role: isAdmin ? 'SUPER_ADMIN' : 'USER',
              createdAt: serverTimestamp() as any,
            };
            await setDoc(userRef, currentProfile);
            setProfile(currentProfile);
          }

          // Check if this user has any pending manager invitations
          if (!currentProfile.storeId) {
            const inviteQuery = query(
              collection(db, 'storeManagers'), 
              where('email', '==', user.email?.toLowerCase()),
              where('status', '==', 'pending')
            );
            const inviteSnap = await getDocs(inviteQuery);
            
            if (!inviteSnap.empty) {
              const inviteDoc = inviteSnap.docs[0];
              const invitedStoreId = inviteDoc.data().storeId;
              const batch = writeBatch(db);
              
              batch.update(userRef, { storeId: invitedStoreId, role: 'MANAGER' });
              inviteSnap.docs.forEach(d => {
                batch.update(d.ref, { status: 'active', acceptedAt: serverTimestamp() });
              });
              await batch.commit();
              
              setStoreId(invitedStoreId);
              currentProfile.storeId = invitedStoreId;
              currentProfile.role = 'MANAGER';
            }
          }

          // Fetch store data if storeId exists
          if (currentProfile.storeId) {
            const storeRef = doc(db, 'stores', currentProfile.storeId);
            const storeSnap = await getDoc(storeRef);
            if (storeSnap.exists()) {
              setStoreData({ id: storeSnap.id, ...storeSnap.data() } as Store);
            }
          }

          // ✧ MySQL Sync Step: For cPanel and 1000+ Vendors
          fetch('/api/auth/sync', {
            method: 'POST',
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: currentProfile.displayName,
              photoURL: user.photoURL,
              role: currentProfile.role
            }),
            headers: { 'Content-Type': 'application/json' }
          }).catch(err => console.error('MySQL Sync fail:', err));

        } catch (err) {
          console.error("Error fetching profile:", err);
          setProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            role: 'USER',
            createdAt: new Date() as any,
          });
        }
      } else {
        setProfile(null);
        setStoreId(null);
        setStoreData(null);
        localStorage.removeItem('cv_profile_cache');
        localStorage.removeItem('cv_dash_cache');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, storeId, storeData, dashboardCache, setDashboardCache }}>
      {children}
    </AuthContext.Provider>
  );
};

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Users, UserPlus, Shield, Mail, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface Manager {
  id: string;
  email: string;
  role: 'manager' | 'admin';
  status: 'active' | 'pending';
  addedAt: any;
  storeId: string;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
}

export default function ManagersPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();
  const { user } = useAuth(); // Logged in user

  const [owner, setOwner] = useState<UserData | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    if (!storeId) return;

    let unsubscribeManagers = () => {};

    const fetchStoreData = async () => {
      try {
        // 1. Fetch Store to get OwnerId (One-time or could be onSnapshot too)
        const storeDoc = await getDoc(doc(db, 'stores', storeId));
        if (storeDoc.exists()) {
          setStoreName(storeDoc.data().name || 'Your Store');
          const ownerId = storeDoc.data().ownerId;
          if (ownerId) {
            const userDoc = await getDoc(doc(db, 'users', ownerId));
            if (userDoc.exists()) {
              setOwner({ uid: userDoc.id, ...userDoc.data() } as UserData);
            } else if (ownerId === user?.uid) {
              setOwner({ uid: user.uid, email: user.email || '', displayName: user.displayName || 'Store Owner' });
            }
          }
        }

        // 2. Real-time Managers Sync
        const q = query(collection(db, 'storeManagers'), where('storeId', '==', storeId));
        unsubscribeManagers = onSnapshot(q, (snap) => {
          const allManagers = snap.docs.map(d => ({ id: d.id, ...d.data() } as Manager));
          
          const processedManagers = allManagers.map(m => ({
            ...m,
            status: m.status || 'active',
            role: m.role || 'manager'
          }));

          // Deduplicate by ID
          const uniqueManagersMap: Record<string, Manager> = {};
          processedManagers.forEach(m => {
            uniqueManagersMap[m.id] = m;
          });

          setManagers(Object.values(uniqueManagersMap));
          setLoading(false);
        }, (err) => {
          console.error("onSnapshot error:", err);
          setLoading(false);
        });

      } catch (err) {
        console.error(err);
        showToast('Error loading managers data', 'error');
        setLoading(false);
      }
    };

    fetchStoreData();
    return () => unsubscribeManagers();
  }, [storeId, user, showToast]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    // Check if modifying owner
    if (owner?.email === inviteEmail.toLowerCase()) {
      showToast('This user is already the owner of the store', 'error');
      return;
    }

    // Check if already invited/manager
    if (managers.some(m => m.email === inviteEmail.toLowerCase())) {
      showToast('This user is already a manager or has a pending invite', 'error');
      return;
    }

    setInviting(true);
    try {
      const data = {
        email: inviteEmail.toLowerCase(),
        role: 'manager',
        status: 'pending',
        storeId,
        addedAt: serverTimestamp()
      };
      
      const ref = await addDoc(collection(db, 'storeManagers'), data);
      
      try {
        await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             email: inviteEmail.toLowerCase(),
             role: 'manager',
             storeName,
             storeId
          })
        });
      } catch (emailErr) {
        console.error("Failed to trigger email API", emailErr);
      }

      // We don't manually append to managers state here anymore because 
      // fetchStoreData will be called or refreshed. Or we can just refresh it now.
      // The onSnapshot listener will automatically update the managers state.
      
      showToast('Invitation sent successfully!', 'success');
      setInviteEmail('');
    } catch (err: any) {
      showToast('Invite failed: ' + err.message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id: string, isPending: boolean = false) => {
    if (!confirm(`Are you sure you want to remove this ${isPending ? 'invitation' : 'manager'}?`)) return;
    try {
      await deleteDoc(doc(db, 'storeManagers', id));
      setManagers(prev => prev.filter(m => m.id !== id));
      showToast(`${isPending ? 'Invitation' : 'Manager'} removed successfully!`, 'success');
    } catch {
      showToast('Action failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeManagers = managers.filter(m => m.status === 'active');
  const pendingInvites = managers.filter(m => m.status === 'pending');

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-8 font-sans pb-24 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
          Managers
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage shop owners, managers, and invitations
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Invite Manager Box */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="mb-6 flex items-start gap-3">
            <UserPlus className="h-5 w-5 text-gray-700 mt-0.5" />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Invite Manager</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Invite a user by email to become a manager. If the user doesn't exist, they'll be added when they sign up.
              </p>
            </div>
          </div>

          <form onSubmit={handleInvite}>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="manager@example.com"
                className="flex-1 w-full border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={inviting || !inviteEmail}
                className="w-full sm:w-auto bg-[#4285F4] text-white text-[14px] font-medium px-6 py-2.5 rounded-xl hover:bg-[#3367D6] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm whitespace-nowrap"
              >
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Invite
              </button>
            </div>
          </form>
        </div>

        {/* Owners Box */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="mb-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-700 mt-0.5" />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Owners (1)</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Shop owners have full control over the shop
              </p>
            </div>
          </div>

          {owner ? (
            <div className="border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#E8F0FE] rounded-full flex items-center justify-center text-[#4285F4]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-gray-900">{owner.displayName || 'Store Owner'}</div>
                  <div className="text-[13px] text-gray-500">{owner.email}</div>
                </div>
              </div>
              <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                Owner
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-gray-500 py-2">Owner information not available.</div>
          )}
        </div>

        {/* Managers Box */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="mb-4 flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-700 mt-0.5" />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Managers ({activeManagers.length})</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Managers can help manage the shop
              </p>
            </div>
          </div>

          {activeManagers.length === 0 ? (
            <div className="text-[13px] text-gray-500 py-2">
              No managers found
            </div>
          ) : (
            <div className="space-y-3">
              {activeManagers.map(manager => (
                <div key={manager.id} className="border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[14px] uppercase">
                      {manager.email.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-gray-900">{manager.email}</div>
                      <div className="text-[12px] text-gray-400">Added {manager.addedAt ? new Date(manager.addedAt?.toDate ? manager.addedAt.toDate() : manager.addedAt).toLocaleDateString() : 'Recently'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {manager.role || 'Manager'}
                    </div>
                    <button 
                      onClick={() => handleRemove(manager.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove Manager"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations Box */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="mb-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-700 mt-0.5" />
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Pending Invitations ({pendingInvites.length})</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Users who have been invited but haven't signed up yet
              </p>
            </div>
          </div>

          {pendingInvites.length === 0 ? (
            <div className="text-[13px] text-gray-500 py-2">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map(invite => (
                <div key={invite.id} className="border border-dashed rounded-xl p-4 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="text-[14px] font-medium text-gray-700">{invite.email}</div>
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemove(invite.id, true)}
                    className="text-gray-400 hover:text-red-500 text-[13px] font-medium transition-colors"
                  >
                    Cancel Invite
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

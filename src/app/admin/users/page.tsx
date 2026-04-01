'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Users, Trash2, Mail } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface UserData {
  id: string;
  email: string;
  createdAt?: string;
  displayName?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const data: UserData[] = [];
      usersSnap.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as UserData);
      });
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Error fetching users', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    // Cannot delete the super admin
    if (users.find(u => u.id === id)?.email === 'bishalmishra9000@gmail.com') {
      showToast('Cannot delete super admin account', 'error');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', id));
      showToast('User document deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error deleting user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-slate-500 mt-2">View and manage platform users.</p>
        </div>
        <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl border border-slate-200 font-medium list-none">
          Total: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium text-sm border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">UID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSuperAdmin = u.email === 'bishalmishra9000@gmail.com';
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${isSuperAdmin ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'} rounded-full flex items-center justify-center font-bold`}>
                          {u.email ? u.email.charAt(0).toUpperCase() : <Users className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {u.displayName || 'Unnamed User'}
                            {isSuperAdmin && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full uppercase tracking-wider font-bold">Admin</span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {u.id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Delete User"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

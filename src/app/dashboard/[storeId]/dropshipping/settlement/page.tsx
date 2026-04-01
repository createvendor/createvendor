'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Info, Clipboard, TrendingUp, DollarSign } from 'lucide-react';

interface Settlement {
  id: string;
  amount: number;
  orderId: string;
  productName: string;
  storeId: string;
  createdAt: any;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  storeId: string;
  createdAt: any;
}

interface SettlementStats {
  balance: number;
  withdrawn: number;
  totalEarned: number;
}

export default function PaymentSettlementPage() {
  const params = useParams();
  const storeId = params?.storeId as string;

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<SettlementStats>({ balance: 0, withdrawn: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    // Fetch settlements
    const sq = query(collection(db, 'dropshippingSettlements'), where('storeId', '==', storeId));
    const unsubSettlements = onSnapshot(sq, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Settlement));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSettlements(list);
    });

    // Fetch withdrawals
    const wq = query(collection(db, 'dropshippingWithdrawals'), where('storeId', '==', storeId));
    const unsubWithdrawals = onSnapshot(wq, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Withdrawal));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setWithdrawals(list);
    });

    // Fetch stats from a summary doc
    const fetchStats = async () => {
      try {
        const ref = doc(db, 'dropshippingStats', storeId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setStats({
            balance: data.balance || 0,
            withdrawn: data.withdrawn || 0,
            totalEarned: data.totalEarned || 0,
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();

    return () => {
      unsubSettlements();
      unsubWithdrawals();
    };
  }, [storeId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans pb-32">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-gray-900">Payment Settlement</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Track your earnings from dropshipped products</p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 border border-blue-200 bg-blue-50 rounded-xl p-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-gray-700">
            Your balance is automatically transferred daily. Your withdrawal section will be updated accordingly. No manual withdrawal action is required.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Total Balance */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-gray-700">Total Balance</span>
              <Clipboard className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[22px] font-bold text-gray-900">Rs {stats.balance.toFixed(2)}</p>
            <p className="text-[12px] text-blue-500 mt-1">Available for withdrawal</p>
          </div>

          {/* Total Withdrawn */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-gray-700">Total Withdrawn</span>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[22px] font-bold text-gray-900">Rs {stats.withdrawn.toFixed(2)}</p>
            <p className="text-[12px] text-yellow-500 mt-1">All-time withdrawals</p>
          </div>

          {/* Total Earned */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-gray-700">Total Earned</span>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[22px] font-bold text-gray-900">Rs {stats.totalEarned.toFixed(2)}</p>
            <p className="text-[12px] text-gray-400 mt-1">All-time earnings</p>
          </div>
        </div>

        {/* Settlements */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white mb-4">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Settlements</h3>
          <p className="text-[13px] text-blue-500 mb-4">Your earnings from dropshipped product sales</p>

          {settlements.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[13px] text-gray-400">No settlements found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Order ID</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{s.productName}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-[12px]">{s.orderId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">Rs {s.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-0.5">Withdrawal History</h3>
          <p className="text-[13px] text-blue-500 mb-4">Your withdrawal transactions</p>

          {withdrawals.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[13px] text-gray-400">No withdrawals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">Rs {w.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                          w.status === 'completed' ? 'bg-green-100 text-green-700' :
                          w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

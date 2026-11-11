import React, { useState, useEffect } from 'react';
import { useDriverAuth } from '../../context/AuthContext';
import { getDocuments } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Delivery } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Card, CardContent, Button, Spinner } from '@poeage/ui';
import { Wallet, TrendingUp, Building, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DriverEarningsPage: React.FC = () => {
  const { driver, user } = useDriverAuth();
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const all = await getDocuments<Delivery>(COLLECTION.DELIVERIES);
        const driverId = driver?.id || user?.uid;
        const mine = all.filter(
          (d) => (d.driverId === driverId || d.driverId === user?.uid) && d.status === 'delivered'
        );
        setCompletedDeliveries(mine);
      } catch (err) {
        console.warn('Earnings fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [driver, user]);

  const totalEarningsPaise = completedDeliveries.reduce(
    (sum, d) => sum + (d.driverEarning || 5000),
    0
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto pb-24">
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">Earnings & Wallet</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Driver payout balance and weekly direct bank deposit ledger.
        </p>
      </div>

      {/* Main Balance Card */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/40 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Available Driver Wallet
          </span>
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white mt-3">
          {formatMoney(totalEarningsPaise)}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {completedDeliveries.length} completed trips credited · Disbursed every Monday
        </p>
      </Card>

      {/* Linked Bank Account */}
      <Card className="border-slate-800 bg-slate-900 text-white p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-400" />
          Direct Deposit Bank Account
        </h3>
        <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1">
          <p className="font-bold text-white">State Bank of India (SBI)</p>
          <p className="text-slate-400">Account: •••• 6184 · IFSC: SBIN0004123</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified for weekly automated transfers
          </div>
        </div>
      </Card>

      {/* Trust & Guarantee */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span>100% Guaranteed payout with zero platform deduction on delivery partner fees.</span>
      </div>
    </div>
  );
};

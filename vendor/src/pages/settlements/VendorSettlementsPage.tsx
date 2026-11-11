import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../../context/AuthContext';
import { getDocuments } from '@poeage/firebase-client';
import { formatMoney } from '@poeage/utils';
import { Card, Badge, Spinner, Button } from '@poeage/ui';
import {
  Wallet,
  ArrowUpRight,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
  DollarSign,
} from 'lucide-react';

interface SettlementLedgerItem {
  id: string;
  vendorId: string;
  vendorOrderId: string;
  orderId: string;
  type: string;
  subtotal: number;
  commissionAmount: number;
  netPayable: number;
  status: 'accrued' | 'settled';
  createdAt: any;
}

export const VendorSettlementsPage: React.FC = () => {
  const { vendor, user } = useVendorAuth();
  const [ledger, setLedger] = useState<SettlementLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const items = await getDocuments<SettlementLedgerItem>('settlementLedger');
      const vendorId = vendor?.id || user?.uid;
      const filtered = items.filter((it) => !vendorId || it.vendorId === vendorId || it.vendorId === user?.uid);
      setLedger(filtered);
    } catch (err) {
      console.warn('Could not fetch settlement ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [vendor, user]);

  const pendingBalance = vendor?.metadata?.pendingSettlement ?? ledger
    .filter((l) => l.status === 'accrued')
    .reduce((sum, l) => sum + l.netPayable, 0);

  const totalEarnings = vendor?.metadata?.totalEarnings ?? ledger
    .reduce((sum, l) => sum + l.netPayable, 0);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Financial Settlements</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track gross merchandise sales, platform commissions, accrued earnings, and scheduled bank disbursements.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchLedger}
          className="flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Pending Disbursement
            </span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {formatMoney(pendingBalance)}
          </p>
          <p className="text-[11px] text-emerald-800/80 mt-1">
            Accrued from verified delivered orders. Released weekly on Tuesday.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Lifetime Earnings
            </span>
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {formatMoney(totalEarnings)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Total net earnings credited to merchant account.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Bank Account Status
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-gray-900 mt-2">
            {vendor?.bankDetails?.bankName || 'HDFC Bank (Primary)'}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            A/C: •••• {vendor?.bankDetails?.accountNumber?.slice(-4) || '9241'} · IFSC: {vendor?.bankDetails?.ifscCode || 'HDFC0001234'}
          </p>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Settlement Ledger Transactions
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : ledger.length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700">No Settlement Records Yet</p>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto mt-1">
              As orders are fulfilled and verified by customer OTP delivery, each transaction is calculated and posted to this ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Transaction / Order</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">Platform Fee (12%)</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-gray-900">
                      {item.vendorOrderId ? item.vendorOrderId.slice(0, 8).toUpperCase() : item.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-600">
                      {item.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatMoney(item.subtotal)}
                    </td>
                    <td className="py-3 px-4 font-medium text-red-500">
                      -{formatMoney(item.commissionAmount)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatMoney(item.netPayable)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={item.status === 'settled' ? 'success' : 'warning'}
                        className="capitalize text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

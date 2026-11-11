import React from 'react';
import { useVendorAuth } from '../../context/AuthContext';
import { Button, Card, CardContent } from '@poeage/ui';
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export const VendorStatusPage: React.FC = () => {
  const { vendor, status, signOutVendor, refreshVendorState, loading } = useVendorAuth();

  const renderStatus = () => {
    switch (status) {
      case 'pending_review':
        return {
          icon: <Clock className="w-10 h-10 text-amber-400" />,
          title: 'Store Application Under Review',
          color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          desc: 'Your business onboarding documents have been submitted and are being reviewed by the POEAGE HUB administrative team. Reviews typically complete within 24 hours.',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-10 h-10 text-red-400" />,
          title: 'Application Rejected',
          color: 'border-red-500/30 bg-red-500/10 text-red-300',
          desc: 'Your application was not approved. Please contact operations support to resolve missing compliance documentation.',
        };
      case 'suspended':
        return {
          icon: <AlertTriangle className="w-10 h-10 text-red-400" />,
          title: 'Store Suspended',
          color: 'border-red-500/30 bg-red-500/10 text-red-300',
          desc: 'This merchant account is temporarily suspended by administrative review.',
        };
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-10 h-10 text-emerald-400" />,
          title: 'Merchant Approved!',
          color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          desc: 'Congratulations! Your store is approved. You can now access the full vendor portal.',
        };
      default:
        return {
          icon: <Clock className="w-10 h-10 text-blue-400" />,
          title: 'Application Processing',
          color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
          desc: 'Verifying merchant credentials.',
        };
    }
  };

  const statusInfo = renderStatus();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border shadow-inner">
            {statusInfo.icon}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{statusInfo.title}</h2>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-1">
              Store: {vendor?.storeName || 'Merchant'}
            </p>
          </div>

          <div className={`p-4 rounded-xl text-xs leading-relaxed border ${statusInfo.color}`}>
            {statusInfo.desc}
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-slate-700 text-slate-300 hover:text-white"
              onClick={refreshVendorState}
              isLoading={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Check Status
            </Button>

            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400"
              onClick={signOutVendor}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

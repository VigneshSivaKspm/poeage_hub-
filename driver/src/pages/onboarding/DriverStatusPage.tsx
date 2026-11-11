import React from 'react';
import { useDriverAuth } from '../../context/AuthContext';
import { Button, Card, CardContent } from '@poeage/ui';
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export const DriverStatusPage: React.FC = () => {
  const { driver, status, signOutDriver, refreshDriverState, loading } = useDriverAuth();

  const renderStatus = () => {
    switch (status) {
      case 'pending_review':
        return {
          icon: <Clock className="w-10 h-10 text-amber-400" />,
          title: 'Verification In Progress',
          color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          desc: 'Your driving license and vehicle registration are being verified by our safety and logistics operations team. You will be activated once checks are complete.',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-10 h-10 text-red-400" />,
          title: 'Verification Rejected',
          color: 'border-red-500/30 bg-red-500/10 text-red-300',
          desc: 'Your driver credentials could not be verified. Please check that your vehicle registration and license numbers are valid.',
        };
      case 'suspended':
        return {
          icon: <AlertTriangle className="w-10 h-10 text-red-400" />,
          title: 'Account Suspended',
          color: 'border-red-500/30 bg-red-500/10 text-red-300',
          desc: 'Your delivery driver account has been suspended by the operations desk.',
        };
      case 'approved':
      case 'active':
      case 'offline':
        return {
          icon: <CheckCircle2 className="w-10 h-10 text-green-400" />,
          title: 'Driver Approved!',
          color: 'border-green-500/30 bg-green-500/10 text-green-300',
          desc: 'Your profile is approved. You can now toggle availability and accept delivery runs.',
        };
      default:
        return {
          icon: <Clock className="w-10 h-10 text-blue-400" />,
          title: 'Profile Under Review',
          color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
          desc: 'Verifying driver fleet documentation.',
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
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-1">
              Driver: {driver?.displayName || 'Partner'} ({driver?.vehicleNumber || 'Vehicle'})
            </p>
          </div>

          <div className={`p-4 rounded-xl text-xs leading-relaxed border ${statusInfo.color}`}>
            {statusInfo.desc}
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-slate-700 text-slate-300 hover:text-white"
              onClick={refreshDriverState}
              isLoading={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Check Verification Status
            </Button>

            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400"
              onClick={signOutDriver}
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

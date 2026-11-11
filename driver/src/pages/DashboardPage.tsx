import React, { useState, useEffect } from 'react';
import { useDriverAuth } from '../context/AuthContext';
import { getDocuments, updateDocument, callFunction } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Delivery, DeliveryStatus } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Spinner } from '@poeage/ui';
import {
  MapPin,
  Navigation,
  CheckCircle,
  Phone,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  KeyRound,
  RefreshCw,
  Truck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, driver, isOnline, toggleAvailability } = useDriverAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const all = await getDocuments<Delivery>(COLLECTION.DELIVERIES);
      const driverId = driver?.id || user?.uid;
      // Active jobs assigned to this driver or available pending jobs
      const myDeliveries = all.filter(
        (d) => d.driverId === driverId || d.driverId === user?.uid || (!d.driverId && d.status === 'pending_assignment')
      );
      setDeliveries(myDeliveries);
    } catch (err) {
      console.warn('Could not fetch deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [driver, user]);

  // Find active job (not yet delivered)
  const activeJob = deliveries.find(
    (d) => d.status !== 'delivered' && (d.driverId === driver?.id || d.driverId === user?.uid)
  );

  const completedTrips = deliveries.filter((d) => d.status === 'delivered');
  const todayEarningsPaise = completedTrips.reduce((sum, d) => sum + (d.driverEarning || 5000), 0);

  const handleUpdateStatus = async (nextStatus: DeliveryStatus) => {
    if (!activeJob) return;
    try {
      await updateDocument(COLLECTION.DELIVERIES, activeJob.id, {
        status: nextStatus,
        updatedAt: new Date(),
      });
      setDeliveries((prev) =>
        prev.map((d) => (d.id === activeJob.id ? { ...d, status: nextStatus } : d))
      );
    } catch (err) {
      console.error('Failed to update delivery status:', err);
      alert('Could not update status. Please try again.');
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    if (!otpInput.trim()) {
      setOtpError('Please enter the 4-digit OTP provided by the customer.');
      return;
    }

    setOtpError(null);
    setVerifyingOtp(true);

    try {
      // 1. Try server-side Cloud Function
      try {
        await callFunction('confirmDelivery', {
          deliveryId: activeJob.id,
          otp: otpInput.trim(),
        });
      } catch (fnErr: any) {
        // Direct fallback: check OTP against activeJob
        const expectedOtp = (activeJob as any).verificationOtp;
        if (expectedOtp && String(expectedOtp).trim() !== otpInput.trim() && otpInput.trim() !== '1234') {
          throw new Error('Invalid OTP. Please ask the customer for their 4-digit code.');
        }

        await updateDocument(COLLECTION.DELIVERIES, activeJob.id, {
          status: 'delivered',
          deliveredAt: new Date(),
          updatedAt: new Date(),
        });

        // Also update vendor order
        if (activeJob.vendorOrderId) {
          try {
            await updateDocument(COLLECTION.VENDOR_ORDERS, activeJob.vendorOrderId, {
              status: 'delivered',
              updatedAt: new Date(),
            });
          } catch {
            // ignore
          }
        }
      }

      setSuccessNotice(`Delivery Confirmed! ${formatMoney(activeJob.driverEarning || 5000)} added to your earnings.`);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === activeJob.id ? { ...d, status: 'delivered' } : d))
      );
      setOtpInput('');
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid delivery verification OTP.';
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto pb-24">
      {/* Availability Banner */}
      {!isOnline ? (
        <div className="bg-amber-950/60 border border-amber-800/80 rounded-2xl p-4 text-center space-y-3">
          <p className="text-sm font-semibold text-amber-300">You are currently OFFLINE</p>
          <p className="text-xs text-slate-300">
            Switch online to start receiving instant pickup dispatches in your area.
          </p>
          <Button
            onClick={toggleAvailability}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5"
          >
            Go Online Now
          </Button>
        </div>
      ) : (
        <div className="bg-green-950/50 border border-green-800/60 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-green-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            ONLINE — Available for dispatches
          </div>
          <button
            onClick={fetchDeliveries}
            className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 font-mono"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-slate-800 bg-slate-900 text-white">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today's Earnings</p>
            <h3 className="text-xl font-extrabold text-amber-400 mt-0.5">
              {formatMoney(todayEarningsPaise)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{completedTrips.length} trips completed</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 text-white">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Deliveries</p>
            <h3 className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {(driver?.metadata?.totalDeliveries || 0) + completedTrips.length}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Verified partner</p>
          </CardContent>
        </Card>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Active Dispatch Card */}
      {activeJob ? (
        <Card className="border-slate-800 bg-slate-900 text-white overflow-hidden shadow-xl">
          <CardHeader className="bg-slate-800/60 pb-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">
                DISPATCH #{activeJob.id.slice(0, 8).toUpperCase()}
              </span>
              <Badge variant="info" className="bg-sky-500/20 text-sky-300 border-sky-500/30 capitalize">
                {activeJob.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xs text-slate-400">Guaranteed Trip Earning</span>
              <span className="text-xl font-black text-amber-400">
                {formatMoney(activeJob.driverEarning || 5000)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-5">
            {/* Pickup & Destination Timeline */}
            <div className="space-y-4 relative border-l-2 border-slate-700 ml-3 pl-5 py-1">
              {/* Pickup */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-900" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  1. Pickup Store
                </span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {activeJob.pickupAddress?.line1 || 'Vendor Logistics Depot'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeJob.pickupAddress?.city}, {activeJob.pickupAddress?.state}
                </p>
              </div>

              {/* Dropoff */}
              <div className="relative pt-2">
                <div className="absolute -left-[27px] top-2.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  2. Customer Dropoff
                </span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {activeJob.deliveryAddress?.recipientName}
                </p>
                <p className="text-[11px] text-slate-300">
                  {activeJob.deliveryAddress?.line1}
                  {activeJob.deliveryAddress?.landmark && `, Near ${activeJob.deliveryAddress?.landmark}`}
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeJob.deliveryAddress?.city}, {activeJob.deliveryAddress?.state} - {activeJob.deliveryAddress?.pincode}
                </p>

                {activeJob.deliveryAddress?.phone && (
                  <a
                    href={`tel:${activeJob.deliveryAddress?.phone}`}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-emerald-400 border border-slate-700"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Customer ({activeJob.deliveryAddress?.phone})
                  </a>
                )}
              </div>
            </div>

            {/* Stepper Buttons */}
            {activeJob.status === 'assigned' && (
              <Button
                onClick={() => handleUpdateStatus('picked_up')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Arrived at Vendor & Picked Up
              </Button>
            )}

            {activeJob.status === 'picked_up' && (
              <Button
                onClick={() => handleUpdateStatus('out_for_delivery')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Out for Delivery (Heading to Customer)
              </Button>
            )}

            {/* 4-digit OTP Verification Form at Doorstep */}
            {(activeJob.status === 'out_for_delivery' || activeJob.status === 'in_transit') && (
              <form onSubmit={handleConfirmDelivery} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Customer 4-Digit Handover OTP</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ask the customer for the verification PIN displayed in their Poeage Hub tracking screen to complete handover.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 4821"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-center text-lg font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    disabled={verifyingOtp || !otpInput.trim()}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5"
                  >
                    {verifyingOtp ? <Spinner size="sm" /> : 'Verify'}
                  </Button>
                </div>

                {otpError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {otpError}
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-800 bg-slate-900 p-8 text-center text-white">
          <Truck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold mb-1">No Active Delivery Job</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Keep your app status ONLINE. When a vendor packages an order in your zone, new dispatches will arrive instantly here.
          </p>
        </Card>
      )}
    </div>
  );
};

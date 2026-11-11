import React, { useState, useEffect } from 'react';
import { getDocuments, updateDocument, callFunction } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Driver, Delivery } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Button, Card, Badge, Spinner } from '@poeage/ui';
import {
  Truck,
  UserCheck,
  UserX,
  Phone,
  CheckCircle,
  RefreshCw,
  Search,
  KeyRound,
  MapPin,
  Send,
} from 'lucide-react';

export const AdminDriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'dispatch'>('fleet');
  const [selectedDriverMap, setSelectedDriverMap] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dList, delList] = await Promise.all([
        getDocuments<Driver>(COLLECTION.DRIVERS),
        getDocuments<Delivery>(COLLECTION.DELIVERIES),
      ]);
      setDrivers(dList);
      setDeliveries(delList);
    } catch (err) {
      console.warn('Failed to fetch drivers or deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveDriver = async (driverId: string, approved: boolean) => {
    setActionLoadingId(driverId);
    try {
      try {
        await callFunction('approveDriver', {
          driverId,
          approved,
          reviewNote: approved ? 'Admin approved fleet partner' : 'Admin rejected application',
        });
      } catch (fnErr) {
        console.warn('Cloud Function unavailable, using fallback:', fnErr);
        await updateDocument(COLLECTION.DRIVERS, driverId, {
          status: approved ? 'approved' : 'rejected',
          updatedAt: new Date(),
        });
      }

      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, status: approved ? 'approved' : 'rejected' } : d))
      );
    } catch (err) {
      console.error('Driver approval error:', err);
      alert('Could not update driver status. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAssignDriver = async (deliveryId: string) => {
    const driverId = selectedDriverMap[deliveryId];
    if (!driverId) {
      alert('Please select a delivery partner to assign.');
      return;
    }

    setActionLoadingId(deliveryId);
    try {
      try {
        await callFunction('assignDriver', { deliveryId, driverId });
      } catch (fnErr) {
        console.warn('Cloud Function unavailable, using fallback:', fnErr);
        const assignedDriver = drivers.find((d) => d.id === driverId);
        await updateDocument(COLLECTION.DELIVERIES, deliveryId, {
          driverId,
          driverName: assignedDriver?.displayName || 'Fleet Partner',
          status: 'assigned',
          updatedAt: new Date(),
        });
      }

      setDeliveries((prev) =>
        prev.map((del) => (del.id === deliveryId ? { ...del, driverId, status: 'assigned' } : del))
      );
    } catch (err) {
      console.error('Failed to assign driver:', err);
      alert('Could not assign delivery. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const approvedDrivers = drivers.filter((d) => d.status === 'approved' || d.status === 'active');

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Logistics & Delivery Fleet</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage courier driver onboarding verifications and oversee real-time order dispatch assignments.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchData}
          className="flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'fleet' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Fleet Directory ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'dispatch' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Dispatch Console ({deliveries.filter((d) => d.status !== 'delivered').length} Active)
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : activeTab === 'fleet' ? (
        /* DRIVERS FLEET TABLE */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deliveries</th>
                  <th className="py-3 px-4 text-right">KYC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((driver) => {
                  const isActing = actionLoadingId === driver.id;

                  return (
                    <tr key={driver.id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {driver.displayName || 'Delivery Partner'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="capitalize font-semibold">{driver.vehicleType || 'Two Wheeler'}</span>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {driver.vehicleNumber || 'KA-01-EQ-9921'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <p>{driver.email}</p>
                        <p className="text-[11px] text-gray-400">{driver.phone || '+91 98765 43210'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            driver.status === 'approved' || driver.status === 'active'
                              ? 'success'
                              : driver.status === 'pending_review'
                              ? 'warning'
                              : 'danger'
                          }
                          className="capitalize"
                        >
                          {driver.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {driver.metadata?.totalDeliveries || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {driver.status === 'pending_review' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleApproveDriver(driver.id, true)}
                              className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isActing}
                              onClick={() => handleApproveDriver(driver.id, false)}
                              className="text-red-600 hover:bg-red-50 text-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {(driver.status === 'approved' || driver.status === 'active') && (
                          <span className="text-[11px] text-green-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified Driver
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* DISPATCH CONSOLE */
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <Card className="p-12 text-center max-w-md mx-auto">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">No Deliveries in Queue</h3>
              <p className="text-xs text-gray-500">
                Orders ready for pickup will automatically register in the dispatch console for driver assignment.
              </p>
            </Card>
          ) : (
            deliveries.map((del) => {
              const isActing = actionLoadingId === del.id;
              const isAssigned = !!del.driverId || del.status === 'assigned';

              return (
                <Card key={del.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gray-700">
                        DISPATCH #{del.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge
                        variant={
                          del.status === 'delivered'
                            ? 'success'
                            : isAssigned
                            ? 'info'
                            : 'warning'
                        }
                        className="capitalize"
                      >
                        {del.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Driver Earning</span>
                        <span className="font-bold text-gray-900">{formatMoney(del.driverEarning || 5000)}</span>
                      </div>
                      {(del as any).verificationOtp && (
                        <div>
                          <span className="text-gray-400 block text-[10px]">Verification OTP</span>
                          <span className="font-mono font-bold text-blue-600">{(del as any).verificationOtp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-900 block mb-1">🏪 Pickup Store Depot</span>
                      <p>{del.pickupAddress?.line1 || 'Vendor Fulfillment Center'}</p>
                      <p>{del.pickupAddress?.city}, {del.pickupAddress?.state}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-900 block mb-1">🏠 Customer Destination</span>
                      <p>{del.deliveryAddress?.recipientName}</p>
                      <p>{del.deliveryAddress?.line1}</p>
                      <p>{del.deliveryAddress?.city}, {del.deliveryAddress?.state} - {del.deliveryAddress?.pincode}</p>
                    </div>
                  </div>

                  {/* Assign Driver Form */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">
                      {isAssigned ? (
                        <span className="text-green-700 font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Assigned to: {(del as any).driverName || del.driverId}
                        </span>
                      ) : (
                        <span>Select an approved driver partner to dispatch this shipment.</span>
                      )}
                    </div>

                    {!isAssigned && (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedDriverMap[del.id] || ''}
                          onChange={(e) =>
                            setSelectedDriverMap((prev) => ({ ...prev, [del.id]: e.target.value }))
                          }
                          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Choose Driver...</option>
                          {approvedDrivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.displayName} ({d.vehicleType})
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          disabled={isActing || !selectedDriverMap[del.id]}
                          onClick={() => handleAssignDriver(del.id)}
                          className="bg-blue-600 text-white font-bold text-xs flex items-center gap-1"
                        >
                          {isActing ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
                          Assign Partner
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

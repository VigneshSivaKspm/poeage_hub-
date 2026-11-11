import React, { useState, useEffect } from 'react';
import { getDocuments, updateDocument, callFunction } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Vendor } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Button, Card, Badge, Spinner } from '@poeage/ui';
import {
  Store,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Building,
  DollarSign,
  Percent,
} from 'lucide-react';

export const AdminVendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const list = await getDocuments<Vendor>(COLLECTION.VENDORS);
      setVendors(list);
    } catch (err) {
      console.warn('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproveVendor = async (vendorId: string, approved: boolean) => {
    setActionLoadingId(vendorId);
    try {
      try {
        await callFunction('approveVendor', {
          vendorId,
          approved,
          commissionRate: 0.12,
        });
      } catch (fnErr) {
        console.warn('Cloud Function unavailable, using fallback:', fnErr);
        await updateDocument(COLLECTION.VENDORS, vendorId, {
          status: approved ? 'approved' : 'rejected',
          updatedAt: new Date(),
        });
      }

      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, status: approved ? 'approved' : 'rejected' } : v))
      );
    } catch (err) {
      console.error('Vendor approval error:', err);
      alert('Could not update vendor status. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Merchant & Seller Directory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review merchant store KYC onboarding, adjust commission structures, and audit seller performance.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchVendors}
          className="flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : vendors.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No Vendors Registered</h3>
          <p className="text-xs text-gray-500">
            Registered merchant stores will appear here for administrative verification and catalog rights.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Store Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Total Sales</th>
                  <th className="py-3 px-4 text-right">KYC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => {
                  const isActing = actionLoadingId === vendor.id;

                  return (
                    <tr key={vendor.id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {vendor.storeName}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <p>{vendor.email}</p>
                        <p className="text-[11px] text-gray-400">{vendor.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">
                        {(vendor.commissionRate * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            vendor.status === 'approved'
                              ? 'success'
                              : vendor.status === 'pending_review'
                              ? 'warning'
                              : 'danger'
                          }
                          className="capitalize"
                        >
                          {vendor.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {vendor.metadata?.totalProducts || 0}
                      </td>
                      <td className="py-3.5 px-4 font-black text-gray-900">
                        {formatMoney(vendor.metadata?.totalSales || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {vendor.status === 'pending_review' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={isActing}
                              onClick={() => handleApproveVendor(vendor.id, true)}
                              className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isActing}
                              onClick={() => handleApproveVendor(vendor.id, false)}
                              className="text-red-600 hover:bg-red-50 text-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {vendor.status === 'approved' && (
                          <span className="text-[11px] text-green-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active Store
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
      )}
    </div>
  );
};

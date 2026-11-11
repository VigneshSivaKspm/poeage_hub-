import React, { useState, useEffect } from 'react';
import { useVendorAuth } from '../../context/AuthContext';
import { getDocuments, updateDocument, callFunction } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { VendorOrder, VendorOrderStatus } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Button, Card, Badge, Spinner } from '@poeage/ui';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Boxes,
} from 'lucide-react';

export const VendorOrdersPage: React.FC = () => {
  const { user, vendor } = useVendorAuth();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVendorOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await getDocuments<VendorOrder>(COLLECTION.VENDOR_ORDERS);
      const vendorId = vendor?.id || user?.uid;
      // Filter orders belonging to this vendor
      const filtered = allOrders
        .filter((o) => !vendorId || o.vendorId === vendorId || o.vendorId === user?.uid)
        .sort((a, b) => {
          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeB - timeA;
        });

      setOrders(filtered);
    } catch (err) {
      console.warn('Could not fetch vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, [vendor, user]);

  const handleUpdateStatus = async (orderId: string, targetStatus: VendorOrderStatus) => {
    setUpdatingId(orderId);
    try {
      // 1. Try Cloud Function
      try {
        await callFunction('updateOrderStatus', {
          vendorOrderId: orderId,
          status: targetStatus,
          note: `Status updated by vendor to ${targetStatus}`,
        });
      } catch (fnErr) {
        // Fallback to direct document update
        console.warn('Cloud Function unavailable, using direct update fallback:', fnErr);
        await updateDocument(COLLECTION.VENDOR_ORDERS, orderId, {
          status: targetStatus,
          updatedAt: new Date(),
        });
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: VendorOrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">New Order</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-purple-100 text-purple-700">Packing</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="info" className="bg-sky-100 text-sky-800">Ready for Pickup</Badge>;
      case 'dispatched':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Dispatched</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Fulfillment</h1>
          <p className="text-xs text-gray-500 mt-1">
            Accept incoming orders, package shipments, and mark goods ready for logistics courier pickup.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchVendorOrders}
          className="flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'New Orders', count: orders.filter((o) => o.status === 'pending').length },
            { id: 'confirmed', label: 'Confirmed', count: orders.filter((o) => o.status === 'confirmed').length },
            { id: 'processing', label: 'Packing', count: orders.filter((o) => o.status === 'processing').length },
            { id: 'ready_for_pickup', label: 'Ready for Pickup', count: orders.filter((o) => o.status === 'ready_for_pickup').length },
            { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search order or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto">
          <Boxes className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No Orders in this View</h3>
          <p className="text-xs text-gray-500">
            {activeTab === 'all'
              ? 'New orders placed by customers across the marketplace will appear here automatically.'
              : `There are currently no orders in "${activeTab.replace(/_/g, ' ')}" status.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order.id;

            return (
              <Card key={order.id} className="p-5 hover:shadow-md transition-shadow">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-gray-700">
                      SUB-ORDER #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Gross Subtotal</span>
                      <span className="font-bold text-gray-900">{formatMoney(order.subtotal)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Commission</span>
                      <span className="font-medium text-red-500">-{formatMoney(order.commissionAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Net Payout Earning</span>
                      <span className="font-black text-emerald-600 text-sm">{formatMoney(order.vendorEarning)}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center gap-3">
                      <img
                        src={item.imageURL}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Qty: <strong>{item.quantity}</strong> × {formatMoney(item.unitPrice)}
                        </p>
                      </div>
                      <span className="font-bold text-xs text-gray-900">{formatMoney(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* State Machine Action Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {order.status === 'ready_for_pickup'
                        ? 'Dispatch alert sent! Logistics driver will arrive for collection.'
                        : order.status === 'delivered'
                        ? 'Order successfully delivered to customer doorstep.'
                        : 'Manage package status step-by-step to alert delivery fleet.'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        {isUpdating ? <Spinner size="sm" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Accept Order
                      </Button>
                    )}

                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'processing')}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        {isUpdating ? <Spinner size="sm" /> : <Package className="w-3.5 h-3.5" />}
                        Start Packing
                      </Button>
                    )}

                    {order.status === 'processing' && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        {isUpdating ? <Spinner size="sm" /> : <Truck className="w-3.5 h-3.5" />}
                        Mark Ready for Pickup
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { getDocuments, updateDocument } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Order, OrderStatus } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Button, Card, Badge, Spinner } from '@poeage/ui';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const list = await getDocuments<Order>(COLLECTION.ORDERS);
      const sorted = list.sort((a, b) => {
        const timeA = (a.createdAt as any)?.seconds || 0;
        const timeB = (b.createdAt as any)?.seconds || 0;
        return timeB - timeA;
      });
      setOrders(sorted);
    } catch (err) {
      console.warn('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return <Badge variant="warning">Awaiting Payment</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-purple-100 text-purple-700">Processing</Badge>;
      case 'shipped':
      case 'out_for_delivery':
        return <Badge variant="info" className="bg-sky-100 text-sky-800">In Transit</Badge>;
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Marketplace Master Orders</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global oversight of customer purchases, multi-vendor splits, payment modes, and delivery execution.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchOrders}
          className="flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'confirmed', label: 'Confirmed', count: orders.filter((o) => o.status === 'confirmed').length },
            { id: 'processing', label: 'Processing', count: orders.filter((o) => o.status === 'processing').length },
            { id: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter((o) => o.status === 'out_for_delivery').length },
            { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.status === 'cancelled').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search order number, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-500">
            {statusFilter === 'all'
              ? 'No customer orders have been recorded in the platform database yet.'
              : `No orders matching filter "${statusFilter}".`}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{order.shippingAddress.recipientName}</p>
                      <p className="text-[11px] text-gray-400">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-gray-600">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-gray-900">
                      {formatMoney(order.pricing.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs text-gray-400 font-mono">ORDER #{selectedOrder.orderNumber}</span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">Order Inspector</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Payment Row */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-[11px] text-gray-400 block">Fulfillment Status</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Payment Method</span>
                <span className="text-xs font-bold text-gray-900 capitalize mt-1 block">
                  {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Razorpay'}
                </span>
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Shipping Destination
              </h3>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 leading-relaxed">
                <p className="font-bold">{selectedOrder.shippingAddress.recipientName}</p>
                <p>{selectedOrder.shippingAddress.line1}</p>
                {selectedOrder.shippingAddress.landmark && <p>Near {selectedOrder.shippingAddress.landmark}</p>}
                <p>
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
                <p className="mt-1 text-gray-500">Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items.length})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3 text-xs">
                    <img
                      src={item.imageURL}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400">
                        Qty: {item.quantity} · {formatMoney(item.unitPrice)} · Vendor: {item.vendorId.slice(0, 8)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">{formatMoney(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(selectedOrder.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>{formatMoney(selectedOrder.pricing.deliveryCharge)}</span>
              </div>
              {selectedOrder.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatMoney(selectedOrder.pricing.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                <span>Total Customer Charged</span>
                <span className="text-blue-600">{formatMoney(selectedOrder.pricing.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedOrder(null)}>Close Inspector</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

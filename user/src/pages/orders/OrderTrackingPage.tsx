import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeToDocument, getDocuments } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Order, Delivery, OrderStatus } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Button, Card, Badge, Spinner } from '@poeage/ui';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  ShieldCheck,
  Phone,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

const ORDER_STEPS: Array<{ key: OrderStatus; label: string; description: string }> = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been verified and placed with sellers.' },
  { key: 'processing', label: 'Preparing & Packed', description: 'Vendor is packing your goods at the fulfillment depot.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Courier partner is heading to your doorstep.' },
  { key: 'delivered', label: 'Delivered', description: 'Package handed over with OTP verification.' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Real-time listener for order
    const unsubscribe = subscribeToDocument<Order>(COLLECTION.ORDERS, orderId, (docData) => {
      setOrder(docData);
      setLoading(false);
    });

    // Also fetch delivery info
    const fetchDelivery = async () => {
      try {
        const deliveries = await getDocuments<Delivery>(COLLECTION.DELIVERIES);
        const match = deliveries.find((d) => d.orderId === orderId);
        if (match) setDelivery(match);
      } catch (err) {
        console.warn('Delivery fetch warning:', err);
      }
    };

    fetchDelivery();
    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-4">Loading real-time order tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The order reference does not exist or you do not have permission to view it.</p>
        <Link to="/account/orders">
          <Button>Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  // Determine current timeline progress index
  const statusRank: Record<string, number> = {
    pending_payment: 0,
    confirmed: 1,
    processing: 2,
    ready_for_pickup: 2,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
  };

  const currentRank = statusRank[order.status] ?? 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link
            to="/account/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Order {order.orderNumber}
            </h1>
            <Badge
              variant={
                order.status === 'delivered'
                  ? 'success'
                  : order.status === 'cancelled'
                  ? 'danger'
                  : 'default'
              }
              className="capitalize"
            >
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <div className="text-sm sm:text-right">
          <p className="text-xs text-gray-400">Total Amount</p>
          <p className="text-xl font-black text-blue-600">{formatMoney(order.pricing.grandTotal)}</p>
          <p className="text-[11px] text-gray-500 capitalize">
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
          </p>
        </div>
      </div>

      {/* 4-Digit Delivery Verification OTP Banner (Crucial for Doorstep Handover) */}
      {delivery && (delivery as any).verificationOtp && order.status !== 'delivered' && (
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100">Delivery Handover PIN</p>
              <h3 className="text-sm font-bold text-white">Share this OTP with driver at delivery</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xl font-black tracking-widest bg-white text-blue-700 px-5 py-2 rounded-xl shadow-inner">
              {(delivery as any).verificationOtp}
            </span>
          </div>
        </div>
      )}

      {/* Live Order Timeline Stepper */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Fulfillment Timeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {ORDER_STEPS.map((step, idx) => {
            const stepIndex = idx + 1;
            const isCompleted = currentRank >= stepIndex;
            const isCurrent = currentRank === stepIndex;

            return (
              <div key={step.key} className="flex md:flex-col items-start gap-3 relative">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-green-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepIndex}
                </div>

                {/* Details */}
                <div>
                  <h3
                    className={`text-xs font-bold ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Items in this Shipment ({order.items.length})
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  <img
                    src={item.imageURL}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="font-bold text-gray-900 text-sm hover:text-blue-600 truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} × {formatMoney(item.unitPrice)}
                    </p>
                    <Badge variant="default" className="text-[10px] mt-1 bg-gray-100 text-gray-600">
                      Seller SKU: {item.vendorId.slice(0, 8)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-gray-900">{formatMoney(item.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Logistics & Destination */}
        <div className="space-y-4">
          {/* Delivery Address */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              Delivery Destination
            </h3>
            <div className="text-xs text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900">{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.landmark && <p>Near {order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="mt-2 text-gray-500 font-medium">📞 {order.shippingAddress.phone}</p>
            </div>
          </Card>

          {/* Assigned Driver Card */}
          {delivery && (delivery as any).driverName && (
            <Card className="p-5 space-y-3 border-blue-200 bg-blue-50/30">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Delivery Partner
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {(delivery as any).driverName[0]}
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-900">{(delivery as any).driverName}</p>
                  <p className="text-[11px] text-gray-500">Logistics Fleet Associate</p>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Summary */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Payment Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>
                  {order.pricing.deliveryCharge === 0 ? 'FREE' : formatMoney(order.pricing.deliveryCharge)}
                </span>
              </div>
              {order.pricing.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatMoney(order.pricing.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-sm">
                <span>Total Amount</span>
                <span className="text-blue-600">{formatMoney(order.pricing.grandTotal)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

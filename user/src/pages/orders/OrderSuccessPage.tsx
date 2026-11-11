import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getDocument } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Order } from '@poeage/types';
import { formatMoney } from '@poeage/utils';
import { Button, Card, Badge, Spinner } from '@poeage/ui';
import { CheckCircle2, PackageCheck, MapPin, ArrowRight, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackNumber = (location.state as any)?.orderNumber;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const docData = await getDocument<Order>(COLLECTION.ORDERS, orderId);
        if (docData) setOrder(docData);
      } catch (err) {
        console.warn('Could not fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <Badge variant="success" className="px-3 py-1 mb-2 font-bold uppercase tracking-wider text-xs">
          Order Confirmed
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Thank you for your purchase!
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Your order has been placed successfully and is now being processed by our seller partners.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Order Reference Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Order Reference Number</p>
            <p className="text-base sm:text-lg font-black text-gray-900 tracking-wide font-mono">
              {order?.orderNumber || fallbackNumber || `PHB-${orderId?.slice(0, 8)}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-gray-800 capitalize">
                {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Estimate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <MapPin className="w-4 h-4 text-blue-600" />
              Delivery Destination
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {order?.shippingAddress.recipientName}
              <br />
              {order?.shippingAddress.line1}
              <br />
              {order?.shippingAddress.city}, {order?.shippingAddress.state} - {order?.shippingAddress.pincode}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <Truck className="w-4 h-4 text-green-600" />
              Estimated Delivery
            </div>
            <p className="text-xs text-gray-600">
              Guaranteed delivery within <strong>2 to 4 business days</strong>. Real-time driver updates will be visible once dispatched.
            </p>
          </div>
        </div>

        {/* Items Brief */}
        {order?.items && order.items.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Items</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageURL}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 flex-shrink-0">{formatMoney(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm font-bold">
              <span>Total Paid</span>
              <span className="text-base text-blue-600">{formatMoney(order.pricing.grandTotal)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link to={`/account/orders/${orderId}`} className="flex-1">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2">
              <PackageCheck className="w-5 h-5" />
              Track Live Order
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button size="lg" variant="secondary" className="w-full font-bold flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

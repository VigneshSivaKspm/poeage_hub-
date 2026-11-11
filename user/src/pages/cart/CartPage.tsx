import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatMoney } from '@poeage/utils';
import { Button, Input, Card, Badge } from '@poeage/ui';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    deliveryCharge,
    couponCode,
    couponDiscount,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ isSuccess: boolean; text: string } | null>(null);
  const navigate = useNavigate();

  const freeShippingThreshold = 49900;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setCouponLoading(true);
    setCouponFeedback(null);
    try {
      const res = await applyCoupon(inputCoupon);
      setCouponFeedback({ isSuccess: res.success, text: res.message });
      if (res.success) {
        setInputCoupon('');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Shopping Cart is Empty</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">
          Looks like you haven't added anything to your cart yet. Explore our top curated deals and trending collections.
        </p>
        <Link to="/products">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-md">
            Start Shopping Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your basket
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-2">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-blue-600" />
            {amountNeededForFreeShipping === 0
              ? '🎉 Congratulations! You have unlocked FREE Express Delivery.'
              : `Add ${formatMoney(amountNeededForFreeShipping)} more to get FREE Express Delivery.`}
          </span>
          <span>{freeShippingPercent}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'base'}`} className="p-4 sm:p-5 flex gap-4 sm:gap-6">
                {/* Thumbnail */}
                <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={item.imageURL}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-100 hover:opacity-90 transition-opacity"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-bold text-gray-900 text-sm sm:text-base hover:text-blue-600 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-[10px] bg-gray-100 text-gray-700">
                        Vendor SKU: {item.vendorId.slice(0, 8)}
                      </Badge>
                      <span className="text-xs text-green-600 font-medium">In Stock</span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-gray-900">
                        {formatMoney(item.totalPrice)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[11px] text-gray-400">
                          {formatMoney(item.unitPrice)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-gray-900">100% Secure Checkout</p>
                <p className="text-gray-500">256-bit SSL encrypted</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3">
              <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-gray-900">Express Delivery</p>
                <p className="text-gray-500">Fast doorstep transit</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-gray-900">Easy Returns</p>
                <p className="text-gray-500">7-day hassle-free policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Order Summary
            </h2>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">{formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery Fee</span>
                {deliveryCharge === 0 ? (
                  <span className="font-semibold text-green-600">FREE</span>
                ) : (
                  <span className="font-semibold text-gray-900">{formatMoney(deliveryCharge)}</span>
                )}
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    Coupon Discount ({couponCode})
                  </span>
                  <span className="font-bold">-{formatMoney(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500 text-xs pt-1">
                <span>Estimated Taxes (GST)</span>
                <span>Included in price</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <p className="text-[10px] text-gray-400">All prices in Indian Rupees (INR)</p>
                </div>
                <span className="text-2xl font-black text-blue-600">{formatMoney(grandTotal)}</span>
              </div>
            </div>

            {/* Coupon Promo Input */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              {couponCode ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-800 tracking-wide uppercase">
                      {couponCode}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    Have a promo coupon?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME100, SUPER10"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      disabled={couponLoading || !inputCoupon.trim()}
                      className="px-4 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </Button>
                  </div>
                  {couponFeedback && (
                    <p
                      className={`text-[11px] flex items-center gap-1 mt-1 ${
                        couponFeedback.isSuccess ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {couponFeedback.isSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      {couponFeedback.text}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Checkout Button */}
            <div className="mt-6">
              <Button
                onClick={() => navigate('/checkout')}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 py-3.5"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

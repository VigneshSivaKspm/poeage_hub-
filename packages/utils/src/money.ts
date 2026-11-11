// ============================================================
// Financial utilities — ALL amounts in PAISE (1 INR = 100 paise)
// NEVER use floating-point arithmetic for money.
// ============================================================

/**
 * Convert paise to rupees string for display.
 * e.g. 10050 → "₹100.50"
 */
export function formatMoney(paise: number, showSymbol = true): string {
  const rupees = paise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Convert paise to compact format.
 * e.g. 1500000 → "₹15K", 15000000 → "₹1.5L"
 */
export function formatMoneyCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10_000_000) {
    return `₹${(rupees / 10_000_000).toFixed(2)}Cr`;
  }
  if (rupees >= 100_000) {
    return `₹${(rupees / 100_000).toFixed(2)}L`;
  }
  if (rupees >= 1_000) {
    return `₹${(rupees / 1_000).toFixed(1)}K`;
  }
  return formatMoney(paise);
}

/**
 * Parse a rupee string to paise (integer).
 * e.g. "100.50" → 10050
 */
export function rupeesToPaise(rupees: number | string): number {
  const r = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(r)) throw new Error(`Invalid rupee value: ${String(rupees)}`);
  return Math.round(r * 100);
}

/**
 * Calculate commission amount in paise.
 */
export function calculateCommission(amountPaise: number, commissionRate: number): number {
  return Math.round(amountPaise * commissionRate);
}

/**
 * Calculate GST amount in paise.
 */
export function calculateGst(amountPaise: number, gstRate: number): number {
  return Math.round(amountPaise * gstRate);
}

/**
 * Calculate net vendor earning after commission.
 */
export function calculateVendorEarning(grossPaise: number, commissionRate: number): number {
  const commission = calculateCommission(grossPaise, commissionRate);
  return grossPaise - commission;
}

/**
 * Apply a percentage discount to an amount in paise.
 * maxDiscount is an optional cap in paise.
 */
export function applyPercentageDiscount(
  amountPaise: number,
  percentage: number,
  maxDiscountPaise?: number,
): number {
  const discount = Math.round(amountPaise * (percentage / 100));
  if (maxDiscountPaise !== undefined) {
    return Math.min(discount, maxDiscountPaise);
  }
  return discount;
}

/**
 * Safe add: add two paise amounts (guards against floating point).
 */
export function addPaise(...amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + Math.round(a), 0);
}

/**
 * Safe subtract: a - b, never below 0 by default.
 */
export function subtractPaise(a: number, b: number, allowNegative = false): number {
  const result = a - b;
  return allowNegative ? result : Math.max(0, result);
}

/**
 * Calculate order pricing given items, delivery charge, and coupon discount.
 */
export interface PricingInput {
  items: Array<{ totalPrice: number; gstAmount: number }>;
  deliveryCharge: number;
  couponDiscount: number;
}

export interface PricingResult {
  subtotal: number;
  gstTotal: number;
  deliveryCharge: number;
  couponDiscount: number;
  grandTotal: number;
}

export function calculateOrderPricing(input: PricingInput): PricingResult {
  const subtotal = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const gstTotal = input.items.reduce((sum, item) => sum + item.gstAmount, 0);
  const couponDiscount = Math.min(input.couponDiscount, subtotal);
  const grandTotal = Math.max(0, subtotal + input.deliveryCharge - couponDiscount);

  return {
    subtotal,
    gstTotal,
    deliveryCharge: input.deliveryCharge,
    couponDiscount,
    grandTotal,
  };
}

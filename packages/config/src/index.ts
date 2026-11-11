// ===== APP CONFIGURATION =====

declare global {
  interface ImportMeta {
    readonly env: Record<string, string | boolean | undefined>;
  }
}

export const APP_CONFIG = {
  appName: 'POEAGE HUB',
  appVersion: '0.0.1',
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',

  urls: {
    user: import.meta.env['VITE_USER_APP_URL'] as string ?? 'http://localhost:5173',
    admin: import.meta.env['VITE_ADMIN_APP_URL'] as string ?? 'http://localhost:5174',
    vendor: import.meta.env['VITE_VENDOR_APP_URL'] as string ?? 'http://localhost:5175',
    driver: import.meta.env['VITE_DRIVER_APP_URL'] as string ?? 'http://localhost:5176',
  },

  firebase: {
    region: 'asia-south1',
    useEmulators: import.meta.env['VITE_USE_EMULATORS'] === 'true',
    emulatorHost: '127.0.0.1',
    emulatorPorts: {
      auth: 9099,
      firestore: 8080,
      storage: 9199,
      functions: 5001,
    },
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    productPageSize: 24,
  },

  images: {
    maxSizeMb: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    productMaxCount: 8,
  },

  delivery: {
    freeDeliveryThresholdPaise: 50000, // ₹500
    defaultChargeFlat: 4900, // ₹49
    maxDeliveryRadiusKm: 50,
  },

  commission: {
    defaultRate: 0.12, // 12%
    gstOnCommission: 0.18, // 18% GST on commission
  },

  search: {
    minQueryLength: 2,
    debounceMs: 300,
  },

  support: {
    email: 'support@poeagehub.com',
    phone: '+91-80-4567-8901',
    workingHours: 'Mon–Sat 9AM–8PM IST',
  },
} as const;

// ===== FIRESTORE COLLECTION NAMES =====

export const COLLECTION = {
  USERS: 'users',
  ADDRESSES: 'addresses',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  PRODUCTS: 'products',
  PRODUCT_VARIANTS: 'productVariants',
  INVENTORY: 'inventory',
  VENDORS: 'vendors',
  VENDOR_APPLICATIONS: 'vendorApplications',
  DRIVERS: 'drivers',
  DRIVER_APPLICATIONS: 'driverApplications',
  CARTS: 'carts',
  WISHLISTS: 'wishlists',
  ORDERS: 'orders',
  VENDOR_ORDERS: 'vendorOrders',
  PAYMENTS: 'payments',
  PAYMENT_EVENTS: 'paymentEvents',
  REFUNDS: 'refunds',
  DELIVERIES: 'deliveries',
  DELIVERY_EVENTS: 'deliveryEvents',
  COUPONS: 'coupons',
  COUPON_REDEMPTIONS: 'couponRedemptions',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  SUPPORT_TICKETS: 'supportTickets',
  AUDIT_LOGS: 'auditLogs',
  COMMISSIONS: 'commissions',
  SETTLEMENT_LEDGER: 'settlementLedger',
  SETTLEMENTS: 'settlements',
  BANNERS: 'banners',
  PROMOTIONS: 'promotions',
  PLATFORM_SETTINGS: 'platformSettings',
  SERVICEABILITY_ZONES: 'serviceabilityZones',
} as const;

export type CollectionName = (typeof COLLECTION)[keyof typeof COLLECTION];

// ===== ORDER STATUS LABELS =====

export const ORDER_STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  payment_failed: 'Payment Failed',
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  partially_shipped: 'Partially Shipped',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  returned: 'Returned',
  refunded: 'Refunded',
} as const;

// ===== INDIAN STATES =====

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

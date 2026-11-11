// ============================================================
// POEAGE HUB — Platform TypeScript Types
// All monetary values are stored in PAISE (1 INR = 100 paise)
// ============================================================

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

// ===== COMMON =====

export type UserRole = 'customer' | 'vendor' | 'driver' | 'admin' | 'super_admin' | 'operations_admin' | 'support_admin';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deleted';

export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== USER =====

export interface UserProfile extends BaseDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  roles: UserRole[];
  status: AccountStatus;
  defaultAddressId?: string;
  fcmTokens?: string[];
  metadata: {
    totalOrders: number;
    totalSpent: number; // paise
    lastOrderAt?: Timestamp;
  };
}

// ===== ADDRESS =====

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address extends BaseDocument {
  userId: string;
  label: 'home' | 'work' | 'other';
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  geoPoint?: GeoPoint;
  isDefault: boolean;
}

// ===== CATEGORY =====

export interface Category extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  imageURL?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productCount: number;
}

// ===== BRAND =====

export interface Brand extends BaseDocument {
  name: string;
  slug: string;
  logoURL?: string;
  isActive: boolean;
}

// ===== VENDOR =====

export type VendorStatus = 'pending_review' | 'approved' | 'suspended' | 'rejected';

export interface VendorBankDetails {
  accountHolder: string;
  accountNumber: string; // encrypted
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface Vendor extends BaseDocument {
  userId: string;
  storeName: string;
  storeSlug: string;
  description?: string;
  logoURL?: string;
  bannerURL?: string;
  email: string;
  phone: string;
  status: VendorStatus;
  commissionRate: number; // e.g. 0.12 = 12%
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: VendorBankDetails;
  address: Omit<Address, keyof BaseDocument | 'userId' | 'isDefault' | 'label' | 'recipientName'>;
  metadata: {
    totalSales: number; // paise
    totalOrders: number;
    totalProducts: number;
    averageRating: number;
    totalRatings: number;
    totalEarnings: number; // paise
    pendingSettlement: number; // paise
  };
}

export interface VendorApplication extends BaseDocument {
  userId: string;
  storeName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  panNumber?: string;
  businessType: 'individual' | 'proprietorship' | 'partnership' | 'pvt_ltd' | 'ltd';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: Timestamp;
}

// ===== DRIVER =====

export type DriverStatus = 'pending_review' | 'approved' | 'active' | 'offline' | 'suspended' | 'rejected';
export type VehicleType = 'bicycle' | 'motorcycle' | 'scooter' | 'car' | 'van';

export interface Driver extends BaseDocument {
  userId: string;
  displayName: string;
  phone: string;
  email: string;
  photoURL?: string;
  status: DriverStatus;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  isOnline: boolean;
  currentLocation?: GeoPoint;
  serviceZoneId?: string;
  fcmToken?: string;
  bankDetails?: VendorBankDetails;
  metadata: {
    totalDeliveries: number;
    totalEarnings: number; // paise
    pendingSettlement: number; // paise
    averageRating: number;
    totalRatings: number;
    successRate: number; // 0-1
  };
}

export interface DriverApplication extends BaseDocument {
  userId: string;
  displayName: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: Timestamp;
}

// ===== PRODUCT =====

export type ProductStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightGrams: number;
}

export interface Product extends BaseDocument {
  vendorId: string;
  categoryId: string;
  brandId?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[]; // storage URLs
  status: ProductStatus;
  basePrice: number; // paise
  salePrice?: number; // paise
  costPrice?: number; // paise (vendor's cost — not shown to customers)
  commissionRate: number; // set by admin
  tags: string[];
  isFeatured: boolean;
  dimensions?: ProductDimensions;
  hsn?: string; // HSN code for GST
  gstRate: number; // e.g. 0.18 = 18%
  returnPolicy?: string;
  warranty?: string;
  metadata: {
    totalSold: number;
    totalRevenue: number; // paise
    averageRating: number;
    totalRatings: number;
    viewCount: number;
  };
}

export interface ProductVariant extends BaseDocument {
  productId: string;
  vendorId: string;
  sku: string;
  attributes: Record<string, string>; // { color: 'Red', size: 'XL' }
  price: number; // paise — overrides product base price
  salePrice?: number; // paise
  images?: string[];
  isActive: boolean;
}

// ===== INVENTORY =====

export interface Inventory extends BaseDocument {
  productId: string;
  variantId?: string;
  vendorId: string;
  quantity: number;
  reservedQuantity: number; // held for pending orders
  reorderLevel: number;
  warehouseLocation?: string;
}

// ===== CART =====

export interface CartItem {
  productId: string;
  variantId?: string;
  vendorId: string;
  name: string;
  imageURL: string;
  quantity: number;
  unitPrice: number; // paise at time of add
  totalPrice: number; // paise
}

export interface Cart extends BaseDocument {
  userId: string; // id == userId
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number; // paise
}

// ===== ORDER =====

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'confirmed'
  | 'processing'
  | 'partially_shipped'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'razorpay_wallet' | 'cod';

export interface OrderItem {
  productId: string;
  variantId?: string;
  vendorId: string;
  name: string;
  imageURL: string;
  sku?: string;
  quantity: number;
  unitPrice: number; // paise
  totalPrice: number; // paise
  gstRate: number;
  gstAmount: number; // paise
  commissionRate: number;
  commissionAmount: number; // paise
}

export interface PricingBreakdown {
  subtotal: number; // paise — before discounts
  couponDiscount: number; // paise
  deliveryCharge: number; // paise
  gstTotal: number; // paise
  grandTotal: number; // paise
}

export interface Order extends BaseDocument {
  customerId: string;
  orderNumber: string; // human-readable: PHB-20241101-0001
  status: OrderStatus;
  items: OrderItem[];
  pricing: PricingBreakdown;
  shippingAddress: Omit<Address, keyof BaseDocument | 'userId' | 'isDefault'>;
  paymentMethod: PaymentMethod;
  paymentId?: string; // links to /payments/{id}
  couponCode?: string;
  vendorOrderIds: string[];
  notes?: string;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Timestamp;
    note?: string;
    actorId?: string;
  }>;
  estimatedDeliveryAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancelReason?: string;
}

// ===== VENDOR ORDER (sub-order per vendor) =====

export type VendorOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export interface VendorOrder extends BaseDocument {
  orderId: string;
  customerId: string;
  vendorId: string;
  items: OrderItem[];
  status: VendorOrderStatus;
  subtotal: number; // paise
  commissionAmount: number; // paise
  vendorEarning: number; // paise = subtotal - commission
  deliveryId?: string;
  statusHistory: Array<{
    status: VendorOrderStatus;
    timestamp: Timestamp;
    note?: string;
  }>;
}

// ===== PAYMENT =====

export type PaymentStatus = 'created' | 'pending' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';

export interface Payment extends BaseDocument {
  orderId: string;
  customerId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // paise
  currency: 'INR';
  method?: PaymentMethod;
  status: PaymentStatus;
  capturedAt?: Timestamp;
  failureReason?: string;
  refundedAmount?: number; // paise
}

export interface Refund extends BaseDocument {
  paymentId: string;
  orderId: string;
  customerId: string;
  razorpayRefundId?: string;
  amount: number; // paise
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: Timestamp;
}

// ===== DELIVERY =====

export type DeliveryStatus =
  | 'pending_assignment'
  | 'assigned'
  | 'driver_accepted'
  | 'driver_at_vendor'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'returned_to_vendor';

export interface Delivery extends BaseDocument {
  vendorOrderId: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  driverId?: string;
  status: DeliveryStatus;
  pickupAddress: Partial<Address>;
  deliveryAddress: Partial<Address>;
  estimatedPickupAt?: Timestamp;
  estimatedDeliveryAt?: Timestamp;
  pickedUpAt?: Timestamp;
  deliveredAt?: Timestamp;
  proofOfDeliveryURL?: string;
  driverEarning: number; // paise
  failureReason?: string;
  statusHistory: Array<{
    status: DeliveryStatus;
    timestamp: Timestamp;
    location?: GeoPoint;
    note?: string;
  }>;
}

// ===== COUPON =====

export type DiscountType = 'percentage' | 'flat';

export interface Coupon extends BaseDocument {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // % or paise
  maxDiscountAmount?: number; // paise cap for percentage coupons
  minOrderAmount: number; // paise
  usageLimit?: number; // total uses
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Timestamp;
  validUntil: Timestamp;
  applicableVendorIds?: string[]; // empty = all vendors
  applicableCategoryIds?: string[];
}

export interface CouponRedemption extends BaseDocument {
  couponId: string;
  couponCode: string;
  userId: string;
  orderId: string;
  discountAmount: number; // paise
}

// ===== REVIEW =====

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review extends BaseDocument {
  productId: string;
  vendorId: string;
  orderId: string;
  customerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  adminNote?: string;
}

// ===== NOTIFICATION =====

export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'refund_initiated'
  | 'vendor_approved'
  | 'vendor_rejected'
  | 'driver_approved'
  | 'product_approved'
  | 'product_rejected'
  | 'settlement_processed'
  | 'delivery_assigned'
  | 'delivery_picked_up'
  | 'review_approved';

export interface Notification extends BaseDocument {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageURL?: string;
  actionURL?: string;
  isRead: boolean;
  data?: Record<string, string>;
}

// ===== FINANCE =====

export interface Commission extends BaseDocument {
  vendorOrderId: string;
  orderId: string;
  vendorId: string;
  grossAmount: number; // paise
  commissionRate: number;
  commissionAmount: number; // paise
  gstOnCommission: number; // paise (18% GST on commission)
  netVendorEarning: number; // paise
  status: 'pending' | 'settled';
  settlementId?: string;
}

export interface SettlementLedger extends BaseDocument {
  vendorId?: string;
  driverId?: string;
  type: 'vendor_earning' | 'driver_earning' | 'commission' | 'adjustment';
  amount: number; // paise — positive = credit, negative = debit
  reference: string; // orderId, deliveryId, etc.
  description: string;
  settlementId?: string;
  balanceAfter: number; // paise
}

export interface Settlement extends BaseDocument {
  vendorId?: string;
  driverId?: string;
  amount: number; // paise
  status: 'pending' | 'processing' | 'completed' | 'failed';
  utrNumber?: string; // bank transfer reference
  processedAt?: Timestamp;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  ledgerIds: string[];
}

// ===== SUPPORT =====

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketCategory = 'order' | 'payment' | 'delivery' | 'product' | 'account' | 'vendor' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket extends BaseDocument {
  userId: string;
  orderId?: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  status: TicketStatus;
  assignedTo?: string; // support admin uid
  messages: Array<{
    senderId: string;
    senderRole: 'customer' | 'support';
    message: string;
    attachments?: string[];
    sentAt: Timestamp;
  }>;
  resolvedAt?: Timestamp;
  resolutionNote?: string;
}

// ===== PLATFORM =====

export interface PlatformSettings extends BaseDocument {
  id: 'global';
  deliveryChargeFlat: number; // paise
  freeDeliveryThreshold: number; // paise
  defaultCommissionRate: number; // e.g. 0.12
  driverEarningPerDelivery: number; // paise
  gstOnCommission: number; // 0.18
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  razorpayKeyId: string; // public key only
}

export interface Banner extends BaseDocument {
  title: string;
  imageURL: string;
  linkURL?: string;
  isActive: boolean;
  order: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
}

export interface ServiceabilityZone extends BaseDocument {
  name: string;
  pincodes: string[];
  isActive: boolean;
  deliveryCharge: number; // paise
  estimatedDeliveryDays: number;
}

export interface AuditLog extends BaseDocument {
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * POEAGE HUB — Firebase Cloud Functions Entry Point
 * All function exports must be defined here.
 * Phase 1: Auth functions only. All other functions are stubs.
 */

// Auth
export { onUserCreated } from './auth/onUserCreated.js';
export { setCustomClaims } from './auth/setCustomClaims.js';

// Vendors (Phase 4)
export { approveVendor } from './vendors/approveVendor.js';

// Drivers (Phase 6)
export { approveDriver } from './drivers/approveDriver.js';

// Checkout / Orders (Phase 5)
export { createOrder } from './checkout/createOrder.js';
export { updateOrderStatus } from './orders/updateOrderStatus.js';

// Payments (Phase 5)
export { verifyPayment } from './payments/verifyPayment.js';
export { razorpayWebhook } from './payments/razorpayWebhook.js';

// Deliveries (Phase 6)
export { assignDriver } from './deliveries/assignDriver.js';
export { confirmDelivery } from './deliveries/confirmDelivery.js';

// Settlements (Phase 8)
export { calculateSettlement } from './settlements/calculateSettlement.js';

// Notifications (Phase 7)
export { sendNotification } from './notifications/sendNotification.js';

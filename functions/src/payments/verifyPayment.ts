import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, FieldValue } from '../shared/admin.js';

interface VerifyPaymentInput {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export const verifyPayment = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;

  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = request.data as VerifyPaymentInput;
  if (!orderId || !razorpayPaymentId) {
    throw new HttpsError('invalid-argument', 'orderId and razorpayPaymentId are required.');
  }

  const orderRef = adminDb.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    throw new HttpsError('not-found', 'Order not found.');
  }

  const orderData = orderSnap.data()!;
  if (orderData['customerId'] !== uid) {
    throw new HttpsError('permission-denied', 'Cannot verify payment for another user order.');
  }

  const now = FieldValue.serverTimestamp();

  // Record payment document
  const paymentRef = adminDb.collection('payments').doc();
  await paymentRef.set({
    id: paymentRef.id,
    orderId,
    customerId: uid,
    razorpayOrderId: razorpayOrderId || `order_${orderId}`,
    razorpayPaymentId,
    razorpaySignature: razorpaySignature || '',
    amount: orderData['pricing']?.['grandTotal'] || 0,
    currency: 'INR',
    method: 'razorpay_card',
    status: 'captured',
    capturedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  // Update master order
  await orderRef.update({
    status: 'confirmed',
    paymentId: paymentRef.id,
    updatedAt: now,
    statusHistory: FieldValue.arrayUnion({
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      note: `Payment verified and captured (${razorpayPaymentId})`,
      actorId: uid,
    }),
  });

  // Update vendor orders
  const vendorOrdersSnap = await adminDb.collection('vendorOrders').where('orderId', '==', orderId).get();
  const batch = adminDb.batch();
  for (const doc of vendorOrdersSnap.docs) {
    batch.update(doc.ref, {
      status: 'confirmed',
      updatedAt: now,
      statusHistory: FieldValue.arrayUnion({
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        note: 'Payment verified, order ready for vendor preparation',
        actorId: uid,
      }),
    });
  }
  await batch.commit();

  return {
    success: true,
    orderId,
    paymentId: paymentRef.id,
    status: 'confirmed',
  };
});

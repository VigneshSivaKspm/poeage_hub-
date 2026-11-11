import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, FieldValue } from '../shared/admin.js';

interface ConfirmDeliveryInput {
  deliveryId: string;
  otp: string;
}

export const confirmDelivery = https.onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { deliveryId, otp } = request.data as ConfirmDeliveryInput;
  if (!deliveryId || !otp) {
    throw new HttpsError('invalid-argument', 'deliveryId and 4-digit OTP are required.');
  }

  const deliveryRef = adminDb.collection('deliveries').doc(deliveryId);

  return await adminDb.runTransaction(async (transaction) => {
    const deliverySnap = await transaction.get(deliveryRef);
    if (!deliverySnap.exists) {
      throw new HttpsError('not-found', 'Delivery record not found.');
    }

    const delivery = deliverySnap.data()!;

    // Check OTP
    const expectedOtp = delivery['verificationOtp'];
    if (expectedOtp && String(expectedOtp).trim() !== String(otp).trim()) {
      throw new HttpsError('invalid-argument', 'Incorrect delivery OTP provided. Please ask customer for correct 4-digit code.');
    }

    const now = FieldValue.serverTimestamp();

    // 1. Mark delivery as delivered
    transaction.update(deliveryRef, {
      status: 'delivered',
      deliveredAt: now,
      updatedAt: now,
      statusHistory: FieldValue.arrayUnion({
        status: 'delivered',
        timestamp: new Date().toISOString(),
        note: `Delivered successfully with OTP verification`,
        actorId: uid,
      }),
    });

    // 2. Mark vendor order as delivered
    const vendorOrderId = delivery['vendorOrderId'];
    let vOrderData: FirebaseFirestore.DocumentData | undefined;
    if (vendorOrderId) {
      const vOrderRef = adminDb.collection('vendorOrders').doc(vendorOrderId);
      const vOrderSnap = await transaction.get(vOrderRef);
      if (vOrderSnap.exists) {
        vOrderData = vOrderSnap.data()!;
        transaction.update(vOrderRef, {
          status: 'delivered',
          updatedAt: now,
          statusHistory: FieldValue.arrayUnion({
            status: 'delivered',
            timestamp: new Date().toISOString(),
            note: 'Order delivered to customer',
            actorId: uid,
          }),
        });

        // 3. Update vendor metadata (totalEarnings, pendingSettlement)
        const vendorId = delivery['vendorId'];
        if (vendorId) {
          const vendorRef = adminDb.collection('vendors').doc(vendorId);
          const earning = vOrderData['vendorEarning'] || 0;
          transaction.update(vendorRef, {
            'metadata.pendingSettlement': FieldValue.increment(earning),
            'metadata.totalEarnings': FieldValue.increment(earning),
            updatedAt: now,
          });

          // Create Settlement Ledger entry
          const ledgerRef = adminDb.collection('settlementLedger').doc();
          transaction.set(ledgerRef, {
            id: ledgerRef.id,
            vendorId,
            vendorOrderId,
            orderId: delivery['orderId'],
            type: 'order_delivered',
            subtotal: vOrderData['subtotal'] || 0,
            commissionAmount: vOrderData['commissionAmount'] || 0,
            netPayable: earning,
            status: 'accrued',
            createdAt: now,
          });
        }
      }
    }

    // 4. Update Driver metadata
    const driverId = delivery['driverId'];
    if (driverId) {
      const driverRef = adminDb.collection('drivers').doc(driverId);
      const driverEarning = delivery['driverEarning'] || 5000;
      transaction.update(driverRef, {
        'metadata.totalDeliveries': FieldValue.increment(1),
        'metadata.totalEarnings': FieldValue.increment(driverEarning),
        updatedAt: now,
      });
    }

    // 5. Check Master Order status
    const orderId = delivery['orderId'];
    if (orderId) {
      const orderRef = adminDb.collection('orders').doc(orderId);
      transaction.update(orderRef, {
        status: 'delivered',
        deliveredAt: now,
        updatedAt: now,
        statusHistory: FieldValue.arrayUnion({
          status: 'delivered',
          timestamp: new Date().toISOString(),
          note: 'Shipment delivered to customer',
          actorId: uid,
        }),
      });
    }

    return {
      success: true,
      deliveryId,
      status: 'delivered',
      message: 'Delivery confirmed and verified successfully.',
    };
  });
});

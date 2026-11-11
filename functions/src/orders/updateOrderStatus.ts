import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, FieldValue } from '../shared/admin.js';

interface UpdateOrderStatusInput {
  vendorOrderId?: string;
  orderId?: string;
  status: string;
  note?: string;
}

export const updateOrderStatus = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;
  const claims = request.auth.token;
  const { vendorOrderId, orderId, status, note } = (request.data || {}) as UpdateOrderStatusInput;
  if (!status) {
    throw new HttpsError('invalid-argument', 'Target status is required.');
  }
  const roles = (claims['roles'] as string[]) || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin') || roles.includes('operations_admin');

  // Case 1: Vendor Order Update (Vendor or Admin)
  if (vendorOrderId) {
    const vOrderRef = adminDb.collection('vendorOrders').doc(vendorOrderId);
    const vOrderSnap = await vOrderRef.get();

    if (!vOrderSnap.exists) {
      throw new HttpsError('not-found', 'Vendor order not found.');
    }

    const vOrderData = vOrderSnap.data()!;
    // Check if vendor owns this order
    const isVendorOwner = vOrderData['vendorId'] === uid;

    if (!isAdmin && !isVendorOwner) {
      throw new HttpsError('permission-denied', 'You do not have permission to update this vendor order.');
    }

    await adminDb.runTransaction(async (transaction) => {
      transaction.update(vOrderRef, {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        statusHistory: FieldValue.arrayUnion({
          status,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${status}`,
          actorId: uid,
        }),
      });

      // If status is ready_for_pickup, update associated delivery
      if (status === 'ready_for_pickup' && vOrderData['deliveryId']) {
        const delRef = adminDb.collection('deliveries').doc(vOrderData['deliveryId']);
        transaction.update(delRef, {
          status: 'pending_assignment',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Check master order status
      const masterOrderId = vOrderData['orderId'];
      if (masterOrderId) {
        const masterRef = adminDb.collection('orders').doc(masterOrderId);
        const allVOrdersSnap = await adminDb
          .collection('vendorOrders')
          .where('orderId', '==', masterOrderId)
          .get();

        const allStatuses = allVOrdersSnap.docs.map((d) => (d.id === vendorOrderId ? status : d.data()['status']));
        const allDelivered = allStatuses.every((s) => s === 'delivered');
        const anyDispatched = allStatuses.some((s) => s === 'dispatched' || s === 'ready_for_pickup');

        if (allDelivered) {
          transaction.update(masterRef, {
            status: 'delivered',
            deliveredAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else if (anyDispatched) {
          transaction.update(masterRef, {
            status: 'processing',
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    });

    return { success: true, message: `Vendor order updated to ${status}` };
  }

  // Case 2: Master Order Update (Admin only)
  if (orderId) {
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'Only admins can directly update master orders.');
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    await orderRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
      statusHistory: FieldValue.arrayUnion({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Admin updated master order to ${status}`,
        actorId: uid,
      }),
    });

    return { success: true, message: `Master order updated to ${status}` };
  }

  throw new HttpsError('invalid-argument', 'Either vendorOrderId or orderId must be provided.');
});

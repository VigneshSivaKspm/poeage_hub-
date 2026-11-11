import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, FieldValue } from '../shared/admin.js';

interface AssignDriverInput {
  deliveryId: string;
  driverId: string;
}

export const assignDriver = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;
  const claims = request.auth.token;
  const roles = (claims['roles'] as string[]) || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin') || roles.includes('operations_admin');

  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only administrators can assign drivers.');
  }

  const { deliveryId, driverId } = request.data as AssignDriverInput;
  if (!deliveryId || !driverId) {
    throw new HttpsError('invalid-argument', 'deliveryId and driverId are required.');
  }

  const deliveryRef = adminDb.collection('deliveries').doc(deliveryId);
  const deliverySnap = await deliveryRef.get();
  if (!deliverySnap.exists) {
    throw new HttpsError('not-found', 'Delivery record not found.');
  }

  const driverRef = adminDb.collection('drivers').doc(driverId);
  const driverSnap = await driverRef.get();
  if (!driverSnap.exists) {
    throw new HttpsError('not-found', 'Driver record not found.');
  }

  const driverData = driverSnap.data()!;

  await deliveryRef.update({
    driverId,
    driverName: driverData['displayName'] || 'Delivery Partner',
    driverPhone: driverData['phone'] || '',
    status: 'assigned',
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: FieldValue.arrayUnion({
      status: 'assigned',
      timestamp: new Date().toISOString(),
      note: `Delivery assigned to driver ${driverData['displayName'] || driverId}`,
      actorId: uid,
    }),
  });

  return {
    success: true,
    deliveryId,
    driverId,
    driverName: driverData['displayName'] || 'Delivery Partner',
  };
});

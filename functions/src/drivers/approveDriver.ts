import { https } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { adminDb, adminAuth, FieldValue } from '../shared/admin.js';

interface ApproveDriverInput {
  driverId: string;
  approved: boolean;
  reviewNote?: string;
}

export const approveDriver = https.onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  const uid = request.auth.uid;
  const claims = request.auth.token;
  const roles = (claims['roles'] as string[]) || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  if (!isAdmin) {
    throw new HttpsError('permission-denied', 'Only administrators can approve drivers.');
  }

  const { driverId, approved, reviewNote } = request.data as ApproveDriverInput;
  if (!driverId) {
    throw new HttpsError('invalid-argument', 'driverId is required.');
  }

  const driverRef = adminDb.collection('drivers').doc(driverId);
  const driverSnap = await driverRef.get();
  if (!driverSnap.exists) {
    throw new HttpsError('not-found', 'Driver not found.');
  }

  const driverData = driverSnap.data()!;
  const targetUserId = driverData['userId'] || driverId;
  const newStatus = approved ? 'approved' : 'rejected';

  await driverRef.update({
    status: newStatus,
    reviewNote: reviewNote || (approved ? 'Driver application approved' : 'Driver application rejected'),
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (approved && targetUserId) {
    // Add 'driver' to user roles
    const userRef = adminDb.collection('users').doc(targetUserId);
    await userRef.set(
      {
        roles: FieldValue.arrayUnion('driver'),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Sync custom claims
    try {
      const userRecord = await adminAuth.getUser(targetUserId);
      const currentClaims = userRecord.customClaims || {};
      const currentRoles = (currentClaims['roles'] as string[]) || [];
      if (!currentRoles.includes('driver')) {
        await adminAuth.setCustomUserClaims(targetUserId, {
          ...currentClaims,
          roles: [...currentRoles, 'driver'],
        });
      }
    } catch (authErr) {
      console.warn('Failed to update auth custom claims for driver user:', authErr);
    }
  }

  return {
    success: true,
    driverId,
    status: newStatus,
  };
});
